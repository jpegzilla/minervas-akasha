import React, { useState, useEffect, useContext, useCallback } from 'react'

import PropTypes from 'prop-types'

import Commands from '../utils/commands/utils/paletteCommands'
import paletteSearch from '../utils/commands/paletteSearch'
import windowSearch from '../utils/commands/windowSearch'
import { globalContext } from './App'
import { uuidv4 } from './../utils/misc'
import { makeStruct } from '../utils/managers/StructureMap'
import useToast from './../hooks/useToast'

const handleChange = (e, prefixSuggestion, minerva, setSearchResults) => {
  let results

  switch (prefixSuggestion) {
    case 'records:': // search only records
      results = paletteSearch(minerva, e.target.value)
      break

    case 'type:': // search records using a type
      results = paletteSearch(minerva, '', e.target.value)
      break

    case 'mime:': // search records using a mime type
      results = paletteSearch(minerva, '', 'any', e.target.value)
      break

    case 'windows:':
      results = windowSearch(minerva, e.target.value)
      break

    default:
      results = paletteSearch(minerva, e.target.value)
      break
  }

  setSearchResults(results)
}

const CommandPalette = props => {
  const {
    paletteInput,
    showCommandPalette,
    setShowCommandPalette,
    setWindows,
  } = props

  const { minerva } = useContext(globalContext)

  const toast = useToast()

  const [searchResults, setSearchResults] = useState([])
  const [prefixSetting, setPrefixSetting] = useState()
  const [prefixSuggestion, setPrefixSuggestion] = useState()

  useEffect(() => {
    if (paletteInput && showCommandPalette) paletteInput.current.focus()
    if (!showCommandPalette) setSearchResults([])

    minerva.showCommandPalette = showCommandPalette
  }, [showCommandPalette, minerva.showCommandPalette, paletteInput])

  useEffect(() => {
    if (showCommandPalette) {
      const results = paletteSearch(minerva, '')

      setSearchResults(results)
    }
  }, [minerva, showCommandPalette])

  const handleKeyDown = e => {
    const { key } = e

    e.stopPropagation()

    if (e.repeat) return

    switch (key.toLowerCase()) {
      case 'enter':
      case 'escape':
        setShowCommandPalette(false)
        break

      case 'backspace':
        if (paletteInput.current.value === '') {
          setPrefixSuggestion()
        }
        break
      default:
        return
    }
  }

  useEffect(() => {
    handleChange(
      { target: { value: '' } },
      prefixSuggestion,
      minerva,
      setSearchResults,
    )
  }, [prefixSuggestion, minerva])

  const preHandleInput = e => {
    const { value } = e.target

    handleChange(e, prefixSuggestion, minerva, setSearchResults)

    // check for prefix inputs
    Commands.prefixes.forEach(prefix => {
      if (value.startsWith(prefix)) {
        setPrefixSuggestion(prefix)
        paletteInput.current.value = ''
      }
    })
  }

  const handleDoubleClick = item => {
    setShowCommandPalette(false)

    // make sure the window isn't already open
    const foundItem = minerva.windows.find(
      i =>
        i.component === 'DataStructure' &&
        i.componentProps.structId === item.id,
    )

    if (foundItem) {
      if (foundItem.state !== 'minimized') return
      else {
        minerva.setWindows(
          minerva.windows.map(window => {
            return window.id === foundItem.id
              ? { ...window, state: 'restored' }
              : window
          }),
        )

        setWindows([...minerva.windows])

        minerva.setActiveWindowId(foundItem.id)
      }

      return
    }

    toast.add({
      duration: 3000,
      text: `loading ${item.type}: ${item.name}`,
      type: 'success',
    })

    const itemToOpen = minerva.record.records[item.type].find(
      i => i.id === item.id,
    )

    const { id, type } = itemToOpen

    // move objects like this to structuremap to dry things up
    const struct = makeStruct(type, id, minerva, uuidv4)

    minerva.setWindows([...minerva.windows, struct])

    setWindows([...minerva.windows])

    // make the new window the active window
    minerva.setActiveWindowId(struct.id)
  }

  const handleOpenWindow = item => {
    setShowCommandPalette(false)

    // make sure the window isn't already open
    const foundItem = minerva.windows.find(i => i.id === item.id)

    if (foundItem) {
      if (foundItem.state !== 'minimized') return
      else {
        minerva.setWindows(
          minerva.windows.map(window => {
            return window.id === foundItem.id
              ? { ...window, state: 'restored' }
              : window
          }),
        )

        setWindows([...minerva.windows])

        minerva.setActiveWindowId(foundItem.id)
      }

      return
    }
  }

  const handleCloseWindow = (id, componentProps) => {
    minerva.setWindows([
      ...minerva.windows.filter(w => (w.id === id ? false : true)),
    ])

    setSearchResults(searchResults.filter(item => item.id !== id))

    // if there's an id present, then remove the file from the record, because a component
    // with an id in componentProps is always going to be using indexeddb to store files.
    if (componentProps.id) {
      minerva.removeFileFromRecord(id)
    }

    setWindows([...minerva.windows])
  }

  return (
    <section
      onClick={e => {
        e.stopPropagation()
        setShowCommandPalette(false)
      }}
      id='command-palette'>
      <div
        onClick={e => {
          e.stopPropagation()
        }}>
        <div className='input-box'>
          {prefixSuggestion && (
            <span className='prefix-suggestion'>{prefixSuggestion}</span>
          )}

          {prefixSetting && <span className='prefix-setting'></span>}

          <input
            onKeyDown={handleKeyDown}
            ref={paletteInput}
            type='text'
            placeholder={
              prefixSuggestion
                ? `search in ${prefixSuggestion.replace(':', '')}`
                : 'find anything...'
            }
            onChange={preHandleInput}
          />
        </div>

        <ul>
          {searchResults.map(item => {
            // console.log(item)

            // if item is a window object
            if (item.component) {
              let title = item.title

              if (item.componentProps.info) {
                const truncName =
                  item.componentProps.info.name.length > 30
                    ? item.componentProps.info.name
                        .substring(0, 30)
                        .trim()
                        .padEnd(
                          item.componentProps.info.name.substring(0, 31).trim()
                            .length + 3,
                          '...',
                        )
                    : item.componentProps.info.name

                title += ` - ${truncName}`
              }

              return (
                <li key={item.id} onClick={() => handleOpenWindow(item)}>
                  <span className='identifier'>{`(${item.id.substring(
                    0,
                    8,
                  )})`}</span>
                  <span>{title.split('-')[0]}</span>
                  {title.split('-').length > 1 && (
                    <span className='title-color'>{`- ${
                      title.split('-')[1]
                    }`}</span>
                  )}
                  <b></b>
                  <span
                    onClick={() =>
                      handleCloseWindow(item.id, item.componentProps)
                    }
                    className='close-button'>
                    close
                  </span>
                </li>
              )
            }

            // if item is a record object
            if (item.type) {
              const { name, type, id } = item

              const truncName =
                name.length > 40
                  ? name
                      .substring(0, 40)
                      .trim()
                      .padEnd(name.substring(0, 41).trim().length + 3, '...')
                  : name

              return (
                <li onClick={() => handleDoubleClick(item)} key={id}>
                  <span className={type}>{`(${type})`}</span>
                  <span>{truncName}</span>
                </li>
              )
            }
          })}
        </ul>
      </div>
    </section>
  )
}

CommandPalette.propTypes = {
  setWindows: PropTypes.func,
  setShowCommandPalette: PropTypes.func,
  paletteInput: PropTypes.object,
  showCommandPalette: PropTypes.bool,
}

export default CommandPalette
