import React, { useRef } from 'react'

import PropTypes from 'prop-types'

import Tag from './Tag'

let isDown = false
let startX
let scrollLeft

const TagList = props => {
  const { tags, removeTag, editTag } = props

  const tagBarRef = useRef()

  const handleMouseDownTags = e => {
    if (e.nativeEvent.which === 2) return

    isDown = true
    startX = e.pageX - tagBarRef.current.offsetLeft
    scrollLeft = tagBarRef.current.scrollLeft
  }

  const handleMouseLeaveTags = () => {
    isDown = false
  }

  const handleMouseMoveTags = e => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - tagBarRef.current.offsetLeft
    const walk = x - startX
    tagBarRef.current.scrollLeft = scrollLeft - walk
  }

  const handleScrollInTags = e => {
    // if the user knows how to scroll horizontally, don't interrupt them
    if (e.shiftKey) return

    // if there is no overflow, do nothing
    if (tagBarRef.current.clientWidth - tagBarRef.current.scrollWidth === 0)
      return

    const { nativeEvent } = e
    const { deltaY } = nativeEvent
    let scrollDelta = 0

    if (Math.abs(deltaY) < 100)
      // figure out whether to make the number negative or positive and then
      // stick on a five
      scrollDelta = -parseInt(`${deltaY < 0 ? '-' : ''}${100}`)
    else if (Math.abs(deltaY) >= 100)
      scrollDelta = -parseInt(`${(deltaY / 100) * 25}`)

    tagBarRef.current.scrollLeft += scrollDelta
  }

  return (
    <ul
      onMouseDown={handleMouseDownTags}
      onMouseUp={handleMouseLeaveTags}
      onMouseMove={handleMouseMoveTags}
      onMouseLeave={handleMouseLeaveTags}
      ref={tagBarRef}
      onWheel={handleScrollInTags}
      className={
        tags
          ? tags.length > 3
            ? 'structure-taglist-long'
            : 'structure-taglist'
          : 'structure-taglist'
      }>
      {tags
        ? tags.map((t, i) => {
            return (
              <Tag
                t={t}
                i={i}
                key={`${t.name}-${i}`}
                removeTag={removeTag}
                editTag={editTag}
              />
            )
          })
        : false}
    </ul>
  )
}

TagList.propTypes = {
  tags: PropTypes.array,
  removeTag: PropTypes.func,
  editTag: PropTypes.func,
}

export default TagList
