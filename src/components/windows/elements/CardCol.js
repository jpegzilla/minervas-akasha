/* eslint-disable react-hooks/exhaustive-deps */

import React, { memo, useState, useEffect, useRef, useContext } from 'react'

import Card from './Card'
import { uuidv4 } from './../../../utils/misc'
import { globalContext } from './../../App'

const CardCol = props => {
  const {
    currentlyDraggingId,
    setCurrentlyDraggingId,
    id,
    cards,
    title,
    columns,
    setColumns,
    removeColumn
  } = props

  // useful for determining if the user is currently dragging a column, which can affect
  // other components. that's why this is semi-global
  const {
    setIsDraggingColumn,
    isDraggingColumn,
    setIsDraggingCard,
    isDraggingCard
  } = useContext(globalContext)

  const [titleValue, setTitleValue] = useState(title)
  const [editing, setEditing] = useState(false)

  const inputRef = useRef()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }

    if (editing === false) {
      const newColumns = columns.map(col => {
        if (col.id === id) {
          return { ...col, title: titleValue }
        }
        return col
      })

      setColumns(newColumns)
    }
  }, [editing])

  const addCard = () => {
    const newColumns = columns.map(col => {
      if (col.id === id) {
        const cards = [
          ...col.cards,
          {
            id: uuidv4(),
            type: 'card',
            title: 'untitled card',
            content: 'empty'
          }
        ]

        return { ...col, cards }
      }

      return col
    })

    setColumns(newColumns)
  }

  const handleColumnDragStart = e => {
    // console.log({ isDraggingColumn, target: e.nativeEvent.target })
    if (isDraggingColumn) return
    if (e.nativeEvent.target.matches('.deck-card')) return

    setIsDraggingColumn(true)

    // datatransfer so that for example the main desktop does not react
    // to a column being dropped on it, but other columns will know
    // how to react based on the item-type and item-id
    e.nativeEvent.dataTransfer.setData('item-type', 'column')
    e.nativeEvent.dataTransfer.setData('item-id', e.target.id)
    e.target.style.opacity = 0.5

    setCurrentlyDraggingId(e.target.id)
  }

  const handleColumnDragEnd = e => {
    e.target.style.opacity = ''

    Array.from(
      document.querySelectorAll('.column-dragged-over')
    ).forEach(elem => elem.classList.remove('column-dragged-over'))

    setIsDraggingColumn(false)
  }

  const handleColumnDrop = e => {
    // check to see if this was a card / column being dropped.
    const type = e.nativeEvent.dataTransfer.getData('item-type')
    const itemId = e.nativeEvent.dataTransfer.getData('item-id')
    // if type and itemId are falsy, it is because the drop was
    // not triggered by a card / column. stop immediately
    if (!type || !itemId) {
      e.stopPropagation()
      e.preventDefault()
      return
    }

    // if this event was triggered by dropping a card
    if (type === 'card') {
      // this will return if you dropped on a column, but
      // the event hits a card first instead.
      const catchCardDrop = e.nativeEvent.path.some(el => {
        if (el instanceof HTMLDocument) return false
        if (!(el instanceof Element)) return false
        if (el.matches('.deck-card')) return true
        return false
      })

      if (catchCardDrop) return

      const droppedOnColAt = columns.findIndex(col => col.id === id)
      const originOfCard = columns.findIndex(col =>
        col.cards.some(c => c.id === itemId)
      )

      // just logic to insert the card in the column from here
      // it's a little fucked up because I kept changing it
      // and then not refactoring it after changing something
      const cardToInsert = columns
        .map(col => col.cards.find(c => c.id === itemId) || false)
        .filter(Boolean)[0]

      const newColumns = columns.map(col => {
        if (originOfCard === droppedOnColAt) return col

        if (col.cards.some(card => card.id === cardToInsert.id)) {
          const newCards = col.cards.filter(card => card.id !== cardToInsert.id)

          return { ...col, cards: newCards }
        }

        if (col.id === id)
          return { ...col, cards: [...col.cards, cardToInsert] }

        return col
      })

      // must turn these off so that the desktop can listen for
      // drag + drop events again.
      setIsDraggingColumn(false)
      setIsDraggingCard(false)

      setColumns(newColumns)

      e.preventDefault()
      e.stopPropagation()
      return
    }

    const indexOfDragged = columns.findIndex(
      item => item.id === currentlyDraggingId
    )
    const indexOfTarget = columns.findIndex(item => item.id === id)

    // make sure no columns still have the appearance of being dragged over
    Array.from(
      document.querySelectorAll('.column-dragged-over')
    ).forEach(elem => elem.classList.remove('column-dragged-over'))

    const newColumns = columns.map((item, idx) => {
      if (idx === indexOfTarget) {
        return columns[indexOfDragged]
      } else if (idx === indexOfDragged) {
        return columns[indexOfTarget]
      }

      return item
    })

    setIsDraggingColumn(false)
    setIsDraggingCard(false)
    setColumns(newColumns)
  }

  const handleColumnDragEnter = e => {
    // ignore inappropriate events
    if (!isDraggingColumn && !isDraggingCard) return
    if (currentlyDraggingId === id) return

    e.target.classList.add('column-dragged-over')
  }

  const handleColumnDragLeave = e => {
    if (!isDraggingColumn && !isDraggingCard) return
    if (currentlyDraggingId === id) return
    if (!e.target.classList.contains('deck-card-column')) return

    // not sure if this is overkill still but keeping bc scared 2 remove
    if (
      e.nativeEvent.path[0].id === id &&
      !e.nativeEvent.fromElement.matches('.deck-card-column *')
    ) {
      e.target.classList.remove('column-dragged-over')
    }
  }

  return (
    <div
      id={id}
      draggable='true'
      onDragStart={handleColumnDragStart}
      onDragEnd={handleColumnDragEnd}
      onDrop={handleColumnDrop}
      onDragEnter={handleColumnDragEnter}
      onDragLeave={handleColumnDragLeave}
      className='deck-card-column'>
      <header>
        <span
          onClick={e => {
            e.stopPropagation()
            setEditing(!editing)
          }}>
          {editing ? (
            <input
              ref={inputRef}
              type='text'
              value={titleValue}
              onClick={e => e.stopPropagation()}
              onBlur={() => setEditing(false)}
              onKeyPress={e => {
                e.key.toLowerCase() === 'enter' && setEditing(false)
              }}
              onChange={e => {
                setTitleValue(e.target.value)
              }}
            />
          ) : (
            titleValue
          )}
        </span>{' '}
        <button onClick={addCard}>
          <span>+ add card</span>
        </button>
        <button onClick={() => removeColumn(id)} className='remove'>
          <span>- remove column</span>
        </button>
      </header>
      <ul>
        {cards.map(item => {
          return (
            <Card
              key={item.id}
              columns={columns}
              setColumns={setColumns}
              id={item.id}
              title={item.title}
              content={item.content}
            />
          )
        })}
      </ul>
    </div>
  )
}

export default memo(CardCol)
