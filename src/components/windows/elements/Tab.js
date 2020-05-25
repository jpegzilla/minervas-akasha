import React, { memo, useMemo } from 'react'

import PropTypes from 'prop-types'

const TabComponent = props => {
  const { w, title, activeWindowId, tabCounts, handleClickItem, state } = props

  let titleToUse = title,
    typeToUse = w.componentProps.type || w.component

  let itemName = title

  if (w.componentProps) {
    if (w.componentProps.info)
      if (w.componentProps.info.name) {
        titleToUse = `(${w.componentProps.type.substring(0, 3)}) ${
          w.componentProps.info.name
        }`

        itemName = w.componentProps.info.name
      }
  }

  const titleText = `name: ${itemName}\ntype: ${typeToUse}\nthis is ${typeToUse} #${tabCounts}.`.toLowerCase()

  return useMemo(
    () => (
      <li
        title={titleText}
        className={`${
          w.id === activeWindowId ? 'taskbar-button active' : 'taskbar-button'
        } ${state}`.trim()}
        onClick={e => {
          handleClickItem(e, w)
        }}>
        <span>{`${titleToUse} (${tabCounts})`}</span>
      </li>
    ),
    [
      w,
      activeWindowId,
      tabCounts,
      handleClickItem,
      titleText,
      titleToUse,
      state
    ]
  )
}

export default memo(TabComponent)

TabComponent.propTypes = {
  w: PropTypes.object,
  title: PropTypes.string,
  activeWindowId: PropTypes.string,
  tabCounts: PropTypes.number,
  handleClickItem: PropTypes.func
}
