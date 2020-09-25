import React, { memo, useContext } from 'react'
import { uuidv4 } from './../../utils/misc'

// import PropTypes from 'prop-types'

import { globalContext } from './../App'

const TextEditor = props => {
  console.log(props)
  // const { files, openFileId } = props

  const { minerva } = useContext(globalContext)

  const addNewFile = () => {}

  return (
    <section className='text-editor-window'>
      <header>
        <button onClick={addNewFile} className='add'>
          + new file
        </button>
      </header>
    </section>
  )
}

export default memo(TextEditor)

TextEditor.propTypes = {}
