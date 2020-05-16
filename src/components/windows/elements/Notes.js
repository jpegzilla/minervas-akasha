import React, { useContext, useState, useEffect, useRef, memo } from 'react'

import useRunAfterUpdate from './../../../hooks/useRunAfterUpdate'
import handleTextAreaInput from './utils/handleTextAreaInput'

import PropTypes from 'prop-types'

import { globalContext } from './../../App'

let timeouts = []

const Notes = props => {
  const { id } = props
  const { minerva, audiomanager, setStatusMessage, setStatusText } = useContext(
    globalContext
  )
  const runAfterUpdate = useRunAfterUpdate()

  const record = minerva.record.findRecordById(id)

  const [collapsed, setCollapsed] = useState(true)
  const [noteText, setNoteText] = useState(record.data.notes)
  const [textHistory, setTextHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(textHistory.length)

  const currentRecord = minerva.record.findRecordById(id)

  const [customMetadata, setCustomMetadata] = useState({ key: '', value: '' })
  const [customMetadataObject, setCustomMetadataObject] = useState(
    currentRecord.data.extra || {}
  )
  // anything that is provided by the user, such as a date, and any custom
  // metadata provided by the user.
  // const [extra, setExtra] = useState(record.data.extra);

  // console.log(extra);

  const handleCustomMetadata = data => {
    const { key, value } = data
    let errorMessage

    if (!key) errorMessage = 'cannot set empty key.'
    if (!value) errorMessage = 'cannot set empty value.'
    const existingExtra = currentRecord.data.extra || {}

    if (Object.keys(existingExtra).length >= 5) {
      setStatusMessage({
        display: true,
        text: 'metadata limit reached.',
        type: 'fail'
      })

      audiomanager.play('e_one')

      clearAll()
      timeouts.push(setTimeout(t, 3000))

      return
    }

    if (!key || !value) {
      setStatusMessage({
        display: true,
        text: errorMessage,
        type: 'fail'
      })

      audiomanager.play('e_one')

      clearAll()
      timeouts.push(setTimeout(t, 3000))

      return
    }

    const newExtra = {
      ...existingExtra,
      [key]: value
    }

    minerva.editInRecord(id, currentRecord.type, 'data', {
      ...currentRecord.data,
      extra: newExtra
    })

    setCustomMetadata({ key: '', value: '' })
    setCustomMetadataObject(newExtra)
  }

  // function that just clears the status message
  const t = () => {
    setStatusText('')
    setStatusMessage({ display: false, text: '', type: null })
  }

  // function to clear all running timeouts belonging to this component
  const clearAll = () => {
    for (let i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i])
    }
  }

  const textArea = useRef()

  const { maxHistoryDepth } = minerva.settings.textEditor

  useEffect(() => {
    if (textHistory.length > maxHistoryDepth) {
      // remove the oldest element from the history
      // if history is too large
      textHistory.shift()
      setTextHistory([...textHistory])

      // set the position in history to the end of the history array, thus losing
      // the old 'future' in the history if the user was undoing things
      setHistoryIndex(textHistory.length)
    }

    minerva.record.editInRecord(
      id,
      record.type,
      'data',
      { ...record.data, notes: noteText },
      minerva
    )
  }, [
    noteText,
    minerva,
    record.data,
    record.type,
    id,
    maxHistoryDepth,
    textHistory
  ])

  return (
    <section className={`notes-container${collapsed ? ' collapsed' : ''}`}>
      <div
        onClick={() => {
          setCollapsed(!collapsed)
        }}
        className='notes-sidebar'
        title='click to expand note viewer'>
        <span>extra</span>
      </div>

      <div className={`notes-content${collapsed ? ' collapsed' : ''}`}>
        <div className='notes-content-notepad'>
          <header>
            <div>notepad</div>
          </header>
          <textarea
            ref={textArea}
            spellCheck='false'
            onClick={e => e.stopPropagation()}
            onChange={e => {
              setTextHistory([...textHistory, noteText])
              setNoteText(e.target.value)
            }}
            onKeyDown={e =>
              handleTextAreaInput(e, {
                setNoteText,
                textArea,
                textHistory,
                historyIndex,
                setHistoryIndex,
                runAfterUpdate
              })
            }
            value={noteText}
          />
        </div>

        <div className='notes-content-metadata'>
          <header>
            <div>custom metadata</div>
          </header>
          <div>
            <form
              onSubmit={e => {
                e.preventDefault()
                handleCustomMetadata(customMetadata)
              }}>
              <input
                type='text'
                placeholder='data key'
                value={customMetadata.key}
                onChange={e =>
                  setCustomMetadata({ ...customMetadata, key: e.target.value })
                }
              />
              <input
                type='text'
                placeholder='data value'
                value={customMetadata.value}
                onChange={e =>
                  setCustomMetadata({
                    ...customMetadata,
                    value: e.target.value
                  })
                }
              />
              <button
                type='submit'
                onClick={() => handleCustomMetadata(customMetadata)}>
                set custom metadata
              </button>
            </form>
          </div>

          {customMetadataObject && (
            <div className='custom-metadata-list'>
              <ul>
                {Object.entries(customMetadataObject).map(([k, v], i) => {
                  return (
                    <li key={`${k}-${i}`} className='custom-metadata-object'>
                      <span>
                        {k}: <span className='metadata-val'>{v}</span>
                      </span>
                      <span
                        onClick={() => {
                          const currentMetadata = customMetadataObject
                          delete currentMetadata[k]

                          setCustomMetadata(currentMetadata)
                        }}>
                        x
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default memo(Notes)

Notes.propTypes = {
  id: PropTypes.string
}
