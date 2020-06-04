import React from 'react'

const CommandPalette = props => {
  const { handleChange, searchResults } = props

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

export default CommandPalette
