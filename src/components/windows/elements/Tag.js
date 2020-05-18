import React from 'react'

import PropTypes from 'prop-types'

const Tag = props => {
  const { editTag, removeTag, i, t } = props

  // cut down tag names a little bit
  const truncName =
    t.name.length > 15
      ? t.name
          .substring(0, 14)
          .trim()
          .padEnd(t.name.substring(0, 14).trim().length + 1, '…')
      : t.name

  return (
    <li
      title={`${t.name}\nright click to change color.`}
      className={`structure-tag ${t.color}`}>
      <span
        onContextMenu={e => {
          e.stopPropagation()
          e.preventDefault()
          editTag(t)
        }}>
        {truncName}
      </span>
      <span
        onClick={e => {
          e.stopPropagation()
          removeTag(t, i)
        }}>
        x
      </span>
    </li>
  )
}

export default Tag

Tag.propTypes = {
  editTag: PropTypes.func,
  removeTag: PropTypes.func,
  i: PropTypes.number,
  t: PropTypes.object
}
