import React, { useEffect, useRef, useState } from 'react'
import Typist from './../utils/managers/Typist'

export default ({ remove, duration, text, type, index }) => {
  const removeRef = useRef()
  removeRef.current = remove

  const [typeText, setTypeText] = useState('')
  const [fade, setFade] = useState(false)

  useEffect(() => {
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
      key={`${text}-${index}`}
      className={`${type} ${fade ? 'fade' : ''}`.trim()}>
      <div>{typeText}</div>
    </div>
  )
}
