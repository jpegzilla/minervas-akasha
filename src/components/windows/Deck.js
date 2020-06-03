import React, { memo, useState, useEffect, useContext } from 'react'

import PropTypes from 'prop-types'

const Deck = () => {
  return (
    <section className='deck-viewer-container'>
      <header>header thing</header>
      <div className='deck-viewer-content'>cards will go here</div>
    </section>
  )
}

Deck.propTypes = {}

export default memo(Deck)
