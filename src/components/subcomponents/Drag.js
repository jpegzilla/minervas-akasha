/* eslint-disable */

import React, { Children, useState } from 'react'

let active = false
let currentX
let currentY
let initialX
let initialY
let xOffset = 0
let yOffset = 0

// turns a component into a draggable box
const Drag = props => {
  const [translation, setTranslation] = useState({ x: 0, y: 0 })

  const { children, position } = props

  const dragStart = e => {
    initialX = e.clientX - xOffset
    initialY = e.clientY - yOffset

    active = true
  }

  const dragEnd = () => {
    initialX = currentX
    initialY = currentY

    active = false
  }

  const drag = e => {
    if (active) {
      e.preventDefault()

      currentX = e.clientX - initialX
      currentY = e.clientY - initialY

      xOffset = currentX
      yOffset = currentY

      setTranslation({ x: currentX, y: currentY })
    }
  }

  if (position) {
    currentX = 0
    currentY = 0
    initialX = 0
    initialY = 0
    xOffset = 0
    yOffset = 0

    dragEnd()
  }

  return (
    <div
      style={{
        transform: `translate3d(${translation.x}px, ${translation.y}px, 0)`
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
