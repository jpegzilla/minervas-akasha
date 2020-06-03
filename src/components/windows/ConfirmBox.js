import React, { memo, useEffect, useContext } from 'react'

import { globalContext } from './../App'
import PropTypes from 'prop-types'

const ConfirmBox = props => {
  const { confirm, deny, message, name } = props
  let messageToShow

  const { audiomanager } = useContext(globalContext)

  useEffect(() => {
    audiomanager.play('s_two')
  })

  // the idea is that the confirmbox just is removed from the windows array
  // either on reloading, or being confirmed / denied. storing the component
  // is too expensive because it sometimes require storing an entire
  // savefile in temp storage in order to execute its actions (such as when
  // importing data.)

  if (message === 'overwritewarning') {
    messageToShow = (
      <>
        this will overwrite <span className='red'>all your data,</span>{' '}
        replacing it with the data in this file. are you sure you'd like to
        continue? this operation cannot be reversed.
      </>
    )
  } else messageToShow = message

  return (
    <section className='confirm-box-container'>
      <header className='choice-message-title'>
        savefile detected: <span className='yellow'>{name}</span>
      </header>
      <p className='choice-message'>{messageToShow}</p>
      <div className='choice-buttons'>
        <button className='confirm-button' onClick={confirm}>
          confirm
        </button>
        <button className='deny-button' onClick={deny}>
          deny
        </button>
      </div>
    </section>
  )
}

export default memo(ConfirmBox)

ConfirmBox.propTypes = {
  confirm: PropTypes.func,
  deny: PropTypes.func,
  message: PropTypes.string,
}
