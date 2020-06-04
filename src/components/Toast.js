/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react'
import Typist from './../utils/managers/Typist'

import PropTypes from 'prop-types'

const Toast = props => {
  const { remove, duration, text, type, id, sound, audiomanager } = props

  const removeRef = useRef()
  removeRef.current = remove

  const [typeText, setTypeText] = useState('')
  const [fade, setFade] = useState(false)

  useEffect(() => {
    if (sound) {
      switch (sound) {
        case 'error':
          audiomanager.play('e_one')
          break
        default:
          break
      }
    }

    new Typist(setTypeText, text).scramble(false)
  }, [])

  useEffect(() => {
    const fid = setTimeout(() => setFade(true), duration - 500)
    const id = setTimeout(() => removeRef.current(), duration)

    return () => {
      clearTimeout(id)
      clearTimeout(fid)
    }
  }, [duration])

  return (
    <div
      key={`${text}-${id}`}
      className={`${type} ${fade ? 'fade' : ''}`.trim()}>
      <div>{typeText}</div>
    </div>
  )
}

Toast.propTypes = {
  remove: PropTypes.func,
  duration: PropTypes.number,
  text: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  sound: PropTypes.object,
  audiomanager: PropTypes.object,
}

export default Toast
