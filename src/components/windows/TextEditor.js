import React, { memo, useContext } from 'react'

import PropTypes from 'prop-types'

import { globalContext } from './../App'

const TextEditor = props => {
  console.log(props)

  const { minerva } = useContext(globalContext)

  return <div>hello</div>
}

export default memo(TextEditor)

TextEditor.propTypes = {}
