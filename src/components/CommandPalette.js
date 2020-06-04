import React from 'react'

import PropTypes from 'prop-types'

const CommandPalette = props => {
  const { handleChange, searchResults, paletteInput } = props

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
        <input
          ref={paletteInput}
          type='text'
          placeholder='find anything...'
          onChange={handleChange}
        />
        <ul>
          {searchResults.map(item => {
            const { name } = item
            return <li>{name}</li>
          })}
        </ul>
      </div>
    </section>
  )
}

CommandPalette.propTypes = {
  handleChange: PropTypes.func,
  paletteInput: PropTypes.object,
  searchResults: PropTypes.array,
}

export default CommandPalette
