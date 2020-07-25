import React, { useState, useEffect, useRef } from 'react'

const Card = props => {
  const { title, id, content, columns, setColumns } = props
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingContent, setEditingContent] = useState(false)
  const [titleValue, setTitleValue] = useState(title)
  const [contentValue, setContentValue] = useState(content)

  const valueRef = useRef()
  const titleRef = useRef()

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus()
    }

    if (editingContent === false || editingTitle === false) {
      changeCardContents(contentValue, titleValue)
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
    console.log('calling setColumns in Card.js - changeCardContents')
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

  return (
    <div className='deck-card'>
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
