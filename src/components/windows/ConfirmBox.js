import React, { memo } from 'react'

import PropTypes from 'prop-types'

const ConfirmBox = props => {
  const { confirm, deny, message } = props

  return (
    <section className='confirm-box-container'>
      <header>{message}</header>
      <div>
        <button onClick={confirm}>confirm</button>
        <button onClick={deny}>deny</button>
      </div>
    </section>
  )
}

export default memo(ConfirmBox)

ConfirmBox.propTypes = {
  confirm: PropTypes.func,
  deny: PropTypes.func,
  message: PropTypes.string
}
