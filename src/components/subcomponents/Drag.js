/* eslint-disable */

import React, { Children, useState, useEffect } from 'react'

// turns a component into a draggable box
const Drag = (props) => {
  const { children, position, reportPosition } = props

  const [active, setActive] = useState(false)
  const [offset, setOffset] = useState(position)
  const [currentCoords, setCurrentCoords] = useState(position)
  const [initialCoords, setInitialCoords] = useState(position)
  const [translation, setTranslation] = useState(position)

  useEffect(() => {
    if (!active) {
      reportPosition(initialCoords)
    }
  }, [active, initialCoords])

  const dragStart = (e) => {
    setInitialCoords({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    })

    setActive(true)
  }

  const dragEnd = () => {
    setInitialCoords({
      x: currentCoords.x,
      y: currentCoords.y,
    })

    setActive(false)
  }

  const drag = (e) => {
    if (active) {
      e.preventDefault()

      setCurrentCoords({
        x: e.clientX - initialCoords.x,
        y: e.clientY - initialCoords.y,
      })

      setOffset({
        x: currentCoords.x,
        y: currentCoords.y,
      })

      setTranslation({ x: currentCoords.x, y: currentCoords.y })
    }
  }

  return (
    <div
      style={{
        transform: `translate3d(${translation.x}px, ${translation.y}px, 0)`,
      }}
      onMouseDown={dragStart}
      onMouseUp={dragEnd}
      onMouseLeave={dragEnd}
      onMouseMove={drag}>
      {Children.only(children)}
    </div>
  )
}

export default Drag
