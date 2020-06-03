import React, { useState, useRef, useEffect, useContext } from 'react'

import { fontCodes, lineHeights } from '../../utils/structures/utils/textcodes'
import { globalContext } from './../App'
import { selectAllInElement } from './../../utils/misc'

export default props => {
  const { text, humanSize, mime, title, alt } = props
  const textArea = useRef()

  const altToShow = alt
    .split('\n')
    .splice(0, alt.split('\n').length - 1)
    .join('\n')

  const titleToShow = title.substring(0, 30).padEnd('0', 35)
  const { minerva } = useContext(globalContext)

  const [selectedFont, setSelectedFont] = useState(
    minerva.fontOptions.viewer.font || 'font-kaisho'
  )
  const [selectedLineHeight, setSelectedLineHeight] = useState(
    minerva.fontOptions.viewer.lineHeight || 'natural'
  )
  const [fontSize, setFontSize] = useState(
    minerva.fontOptions.viewer.fontSize || 16
  )
  const [letterSpacing, setLetterSpacing] = useState(
    minerva.fontOptions.viewer.letterSpacing || 0.0625
  )

  const [collapsed, setCollapsed] = useState(false)

  const handleKeyDown = e => {
    e.stopPropagation()

    const { key, ctrlKey } = e.nativeEvent

    // override default 'select all' action
    if (key === 'a' && ctrlKey) {
      e.preventDefault()
      selectAllInElement(textArea.current)
    }
  }

  useEffect(() => {
    minerva.setViewerFontOptions({
      font: selectedFont,
      fontSize: fontSize,
      lineHeight: selectedLineHeight,
      letterSpacing: letterSpacing,
    })
  }, [selectedFont, fontSize, selectedLineHeight, letterSpacing, minerva])

  return (
    <section className='text-viewer-container'>
      <header className='text-viewer-header' title={altToShow}>
        <span>{`text viewer - ${titleToShow}, ${humanSize}, ${mime}`}</span>
      </header>
      <div className='text-viewer-main'>
        <pre
          style={{
            fontSize: `${fontSize}px`,
            letterSpacing: `${letterSpacing}em`,
          }}
          tabIndex='-1'
          onKeyDown={handleKeyDown}
          ref={textArea}
          className={`text-viewer-text ${selectedFont} ${selectedLineHeight}`}>
          {text}
        </pre>
        <div className='text-viewer-sidebar'>
          <div
            className='sidebar-hide'
            onClick={() => setCollapsed(!collapsed)}>
            <span>{collapsed ? 'show' : 'hide'} settings</span>
          </div>
          <div
            className='sidebar-settings'
            style={{ display: collapsed ? 'none' : 'block' }}>
            <fieldset>
              <legend>text display font</legend>
              <div className='select-wrapper'>
                <select
                  value={selectedFont}
                  onChange={e => setSelectedFont(e.target.value)}
                  className='text-viewer-font-selector'>
                  {Object.entries(fontCodes).map(([k, v]) => {
                    return (
                      <option key={v} value={v}>
                        {k}
                      </option>
                    )
                  })}
                </select>
              </div>
            </fieldset>

            <fieldset>
              <legend>text line height</legend>
              <div className='select-wrapper'>
                <select
                  value={selectedLineHeight}
                  onChange={e => setSelectedLineHeight(e.target.value)}
                  className='text-viewer-font-selector'>
                  {lineHeights.map(item => {
                    return (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    )
                  })}
                </select>
              </div>
            </fieldset>

            <fieldset>
              <legend>text font size</legend>
              <input
                min='1'
                value={fontSize}
                type='number'
                placeholder='font size'
                onChange={e => setFontSize(e.target.value)}
              />
            </fieldset>

            <fieldset>
              <legend>text letter spacing</legend>
              <input
                step='0.0001'
                value={letterSpacing}
                type='number'
                placeholder='letter spacing'
                onChange={e => setLetterSpacing(e.target.value)}
              />
            </fieldset>

            <fieldset>
              <button
                className='delete-button'
                onClick={() => {
                  setFontSize(16)
                  setSelectedLineHeight('natural')
                  setSelectedFont('font-kaisho')
                  setLetterSpacing(0.0625)
                }}>
                reset
              </button>
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  )
}
