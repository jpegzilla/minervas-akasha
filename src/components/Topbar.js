import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'

import Clock from './windows/elements/Clock'

import Settings from './windows/Settings'

export const TopbarComponent = props => {
  const { settingsMenuRef, settingsOpen, setSettingsOpen } = props

  return useMemo(
    () => (
      <section id='top-bar'>
        <div
          onClick={e => {
            e.stopPropagation()
            setSettingsOpen(!settingsOpen)
          }}
          className='taskbar-button'
          id='settings-button'>
          settings
          {settingsOpen && <Settings settingsMenuRef={settingsMenuRef} />}
        </div>
        <b />
        <Clock />
      </section>
    ),
    [settingsMenuRef, settingsOpen, setSettingsOpen]
  )
}

export default memo(TopbarComponent)

TopbarComponent.propTypes = {
  settingsOpen: PropTypes.bool,
  settingsMenuRef: PropTypes.any,
  setSettingsOpen: PropTypes.func
}
