import React, { memo, useState, useEffect, useRef } from 'react'

import Card from './Card'
import { uuidv4 } from './../../../utils/misc'

const CardCol = props => {
  const {
    currentlyDraggingId,
    setCurrentlyDraggingId,
    id,
    cards,
    title,
    columns,
    setColumns,
    removeColumn,
  } = props

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
            content: 'empty',
          },
        ]

        return { ...col, cards }
      }

      return col
    })

    setColumns(newColumns)
  }

  const [dragging, setDragging] = useState(false)

  const handleColumnDragStart = e => {
    if (currentlyDraggingId === id) return

    const { target } = e

    target.style.opacity = 0.5

    setCurrentlyDraggingId(target.id)
    setDragging(true)
    setInCandidateTarget(false)
  }

  const handleColumnDragEnd = e => {
    const { target } = e

    target.style.opacity = ''

    Array.from(
      document.querySelectorAll('.column-dragged-over')
    ).forEach(elem => elem.classList.remove('column-dragged-over'))

    setDragging(false)
    setInCandidateTarget(false)
  }

  const handleColumnDrop = e => {
    if (!inCandidateTarget) return
    if (currentlyDraggingId === id) return
    if (dragging) return

    const indexOfDragged = columns.findIndex(
      item => item.id === currentlyDraggingId
    )
    const indexOfTarget = columns.findIndex(item => item.id === id)

    console.log(`swap element ${indexOfTarget} with ${indexOfDragged}`)

    Array.from(
      document.querySelectorAll('.column-dragged-over')
    ).forEach(elem => elem.classList.remove('column-dragged-over'))

    console.log(columns)

    const newColumns = columns.map((item, idx) => {
      if (idx === indexOfTarget) {
        return columns[indexOfDragged]
      } else if (idx === indexOfDragged) {
        return columns[indexOfTarget]
      }

      return item
    })

    setColumns(newColumns)
    setInCandidateTarget(false)
  }

  const [inCandidateTarget, setInCandidateTarget] = useState(false)

  const handleColumnDragEnter = e => {
    if (inCandidateTarget) return
    if (currentlyDraggingId === id) return
    if (!e.target.classList.contains('deck-card-column')) return

    e.target.classList.add('column-dragged-over')

    setInCandidateTarget(true)
  }

  const handleColumnDragLeave = e => {
    if (currentlyDraggingId === id) return
    if (!e.target.classList.contains('deck-card-column')) return
    if (
      e.nativeEvent.path[0].id === id &&
      !e.nativeEvent.fromElement.matches('.deck-card-column *')
    ) {
      e.target.classList.remove('column-dragged-over')

      setInCandidateTarget(false)
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
          // console.log(item)
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
