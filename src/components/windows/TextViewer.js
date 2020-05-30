import React from 'react'

export default props => {
  const { text, humanSize, mime, title, alt } = props

  const altToShow = alt
    .split('\n')
    .splice(0, alt.split('\n').length - 1)
    .join('\n')

  const titleToShow = title.substring(0, 30).padEnd('0', 35)

  return (
    <section className='text-viewer-container'>
      <header className='text-viewer-header'>
        <span>{`text viewer - ${titleToShow}, ${humanSize}, ${mime}`}</span>
      </header>
      <div>
        <pre className='text-viewer-text' title={altToShow}>
          {text}
        </pre>
      </div>
    </section>
  )
}
