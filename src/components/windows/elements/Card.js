/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useRef, useContext } from 'react'

import { isInShadow } from './../../../utils/misc'
import { globalContext } from './../../App'

const Card = props => {
  const { title, id, content, columns, setColumns } = props

  // useful for determining if the user is currently dragging a card, which can affect
  // other components. that's why this is semi-global
  const { setIsDraggingCard, isDraggingCard } = useContext(globalContext)

  const [editingTitle, setEditingTitle] = useState(false)
  const [editingContent, setEditingContent] = useState(false)
  const [titleValue, setTitleValue] = useState(title)
  const [contentValue, setContentValue] = useState(content)
  const [currentlyDraggingId, setCurrentlyDraggingId] = useState()

  const valueRef = useRef()
  const titleRef = useRef()

  // this does not need a 'full' dependency list because I only want these things to happen
  // if someone starts or stops editing the content or title.
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus()
    }
  }, [editingTitle, editingContent])

  const changeCardContents = (content, title) => {
    if (valueRef.current) {
      valueRef.current.focus()
    }

    const newColumns = columns.map(col => {
      const cards = col.cards.map(card => {
        return card.id === id ? { ...card, content, title } : card
      })

      return { ...col, cards }
    })

    setColumns(newColumns)
  }

  const toggleEditing = item => {
    switch (item) {
      case 'titleoff':
        setEditingTitle(false)
        break
      case 'contentoff':
        setEditingContent(false)
        break
      case 'title':
        return setEditingTitle(!editingTitle)
      default:
        return setEditingContent(!editingContent)
    }

    changeCardContents(contentValue, titleValue)
  }

  const removeCard = id => {
    const newColumns = columns.map(col => {
      const cards = col.cards.filter(card => {
        return card.id !== id
      })

      return { ...col, cards }
    })

    setColumns(newColumns)
  }

  const handleCardDragStart = e => {
    setIsDraggingCard(true)
    setCurrentlyDraggingId(id)

    // setting info on the datatransfer in order to help other components
    // realize what's being dropped on them and react accordingly
    e.nativeEvent.dataTransfer.setData('item-type', 'card')
    e.nativeEvent.dataTransfer.setData('item-id', id)
  }

  const handleCardDragEnd = () => {
    setCurrentlyDraggingId()
    setIsDraggingCard(false)

    Array.from(document.querySelectorAll('.deck-card')).forEach(card => {
      card.classList.remove('card-dragged-over')
    })
  }

  const handleCardDrop = e => {
    setCurrentlyDraggingId()
    setIsDraggingCard(false)

    // check to see if this was a card / column being dropped.
    const type = e.nativeEvent.dataTransfer.getData('item-type')
    const itemId = e.nativeEvent.dataTransfer.getData('item-id')
    const thisCardId = id

    // if type and itemId are falsy, it is because the drop was
    // not triggered by a card / column. stop immediately
    if (!type || !itemId) {
      e.stopPropagation()
      e.preventDefault()
      return
    }

    const cardBeingReplaced = columns
      .map(col => col.cards.find(c => c.id === thisCardId) || false)
      .filter(Boolean)[0]

    const cardBeingDropped = columns
      .map(col => col.cards.find(c => c.id === itemId) || false)
      .filter(Boolean)[0]

    const colOfDropped = columns.findIndex(col =>
      col.cards.some(c => c.id === itemId)
    )

    const colOfThis = columns.findIndex(col =>
      col.cards.some(c => c.id === thisCardId)
    )

    // switch the card with the id (itemId) in the column (colOfDropped)
    // with the card with the id of (thisCardId) in the column (colOfThis)

    // could not do this any better bc I was too busy jamming out to
    // the prodigy to think. for like 3 hours straight. maybe will fix
    const newColumns = columns.map((col, idx) => {
      if (colOfThis === colOfDropped) {
        if (idx === colOfThis) {
          const dropIndex = col.cards.findIndex(c => c.id === itemId)
          const replaceIndex = col.cards.findIndex(c => c.id === thisCardId)

          const cards = col.cards

          cards[dropIndex] = cardBeingReplaced
          cards[replaceIndex] = cardBeingDropped

          return { ...col, cards }
        }
      } else {
        if (idx === colOfDropped) {
          const location = col.cards.findIndex(c => c.id === itemId)

          const cards = col.cards

          col.cards[location] = cardBeingReplaced

          return { ...col, cards }
        }

        if (idx === colOfThis) {
          const location = col.cards.findIndex(c => c.id === thisCardId)

          const cards = col.cards

          col.cards[location] = cardBeingDropped

          return { ...col, cards }
        }
      }

      return col
    })

    e.target.classList.remove('card-dragged-over')

    // setCurrentlyDraggingId()
  }

  const handleCardDragEnter = e => {
    if (!isDraggingCard) return
    if (e.target.id === currentlyDraggingId) return

    e.target.classList.add('card-dragged-over')
  }

  const handleCardDragLeave = e => {
    if (!isDraggingCard) return
    if (currentlyDraggingId === id) return

    const invalidLeave = () => {
      const toElement = e.nativeEvent.toElement
      const fromElement = e.nativeEvent.fromElement

      if (
        toElement.matches('.deck-card *') ||
        fromElement.matches('.deck-card *') ||
        isInShadow(toElement) ||
        isInShadow(fromElement)
      )
        return true

      return false
    }

    if (invalidLeave()) return

    e.target.classList.remove('card-dragged-over')
  }

  return (
    <div
      id={id}
      draggable='true'
      className='deck-card'
      onDragStart={handleCardDragStart}
      onDragEnd={handleCardDragEnd}
      onDrop={handleCardDrop}
      onDragEnter={handleCardDragEnter}
      onDragLeave={handleCardDragLeave}>
      <header>
        <span
          className={editingTitle ? 'nopadding' : ''}
          onClick={e => {
            e.stopPropagation()
            toggleEditing('title')
          }}>
          {editingTitle ? (
            <input
              tabIndex='0'
              ref={titleRef}
              type='text'
              onKeyPress={e => {
                e.key.toLowerCase() === 'enter' && toggleEditing('titleoff')
              }}
              onClick={e => e.stopPropagation()}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={() => toggleEditing('titleoff')}
              value={titleValue}
            />
          ) : (
            titleValue
          )}
        </span>
        <button
          onClick={() => {
            removeCard(id)
          }}>
          <span>x</span>
        </button>
      </header>
      <p
        onClick={e => {
          e.stopPropagation()
          toggleEditing(e)
        }}>
        {editingContent ? (
          <textarea
            tabIndex='0'
            resize='vertical'
            ref={valueRef}
            onKeyPress={e => {
              e.key.toLowerCase() === 'enter' && toggleEditing('contentoff')
            }}
            onClick={e => e.stopPropagation()}
            onChange={e => setContentValue(e.target.value)}
            onBlur={() => toggleEditing('contentoff')}
            value={contentValue}></textarea>
        ) : (
          <textarea
            tabIndex='0'
            resize='vertical'
            onChange={e => setContentValue(e.target.value)}
            value={contentValue}></textarea>
        )}
      </p>
    </div>
  )
}

export default Card
