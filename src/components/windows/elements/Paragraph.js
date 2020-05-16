import React, { useEffect } from 'react'

export default props => {
  const { fullText, showText, title, humanSize, mime, setMetadata } = props

  const fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`

  useEffect(() => {
    setMetadata({
      title,
      size: humanSize,
      type: mime,
      'character count': fullText.length,
      'word count': fullText.split(/\b/gi).length,
      'line count': fullText.split(/\n/gi).length
    })
  }, [humanSize, mime, setMetadata, title, fullText])

  return (
    <div title={fileInfo}>
      <pre>{showText}</pre>
    </div>
  )
}
