import React, { memo, useState, useEffect, useContext } from 'react'

import { globalContext } from './../App'

import { uuidv4 } from './../../utils/misc'

import CardCol from './elements/CardCol'

const Deck = () => {
  const { minerva } = useContext(globalContext)

  const [columns, setColumns] = useState(
    minerva.projects.length > 0
      ? minerva.projects
      : [
          {
            title: 'untitled column',
            id: uuidv4(),
            cards: [
              {
                id: 'defaultcard',
                type: 'card',
                title: 'untitled card',
                content: 'hello',
              },
            ],
          },
        ]
  )

  useEffect(() => {
    // console.log(columns)
    minerva.updateProjectData(columns)
  }, [columns, minerva])

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        title: `untitled column ${columns.length}`,
        id: uuidv4(),
        cards: [],
      },
    ])
  }

  const removeColumn = id => {
    setColumns([...columns.filter(item => item.id !== id)])
  }

  const [currentlyDraggingId, setCurrentlyDraggingId] = useState()

  return (
    <section className='deck-viewer-window'>
      <header>
        <button onClick={addColumn} className='add'>
          <span>+ add column</span>
        </button>
      </header>
      <div className='deck-viewer-content'>
        {columns.map((col, i) => {
          // console.log(col)
          return (
            <CardCol
              currentlyDraggingId={currentlyDraggingId}
              setCurrentlyDraggingId={setCurrentlyDraggingId}
              removeColumn={removeColumn}
              key={`${col.title}-${i}`}
              id={col.id}
              columns={columns}
              setColumns={setColumns}
              title={col.title}
              cards={col.cards}
            />
          )
        })}
      </div>
    </section>
  )
}

Deck.propTypes = {}

export default memo(Deck)
