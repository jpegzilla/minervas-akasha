import React, { useEffect, useContext } from 'react'

import { uuidv4 } from './../../../utils/misc'
import { globalContext } from './../../App'

const Paragraph = props => {
  const {
    fullText,
    showText,
    title,
    humanSize,
    mime,
    setMetadata,
    setLoadingFileData
  } = props

  const { minerva } = useContext(globalContext)

  const fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}\ndouble click to open in viewer.`

  useEffect(() => {
    setMetadata({
      title,
      size: humanSize,
      type: mime,
      'character count': fullText.length,
      'word count': fullText.split(/\b/gi).length,
      'line count': fullText.split(/\n/gi).length
    })

    setLoadingFileData(false)
  }, [humanSize, mime, setMetadata, title, fullText])

  const handleDoubleClick = () => {
    const id = uuidv4()

    const findWindowAtPosition = xy => {
      const allWindows = Object.values(minerva.windows).flat(Infinity)

      const windowToFind = allWindows.find(
        item => item.position.x === xy && item.position.y === xy
      )

      return windowToFind || false
    }

    let finalPosition = 100

    while (findWindowAtPosition(finalPosition)) {
      finalPosition += 10
    }

    const newTextViewer = {
      title: 'text viewer',
      state: 'restored',
      stringType: 'Window',
      component: 'TextViewer',
      componentProps: {
        text: fullText,
        title,
        humanSize,
        mime,
        alt: fileInfo
      },
      belongsTo: minerva.user.id,
      id,
      position: {
        x: finalPosition,
        y: finalPosition
      }
    }

    minerva.addFileToRecord(id, fullText, { type: 'textviewer' })

    minerva.setWindows([...minerva.windows, newTextViewer])

    minerva.setApplicationWindows(minerva.windows)

    // make the new window the active window
    minerva.setActiveWindowId(id)
  }

  return (
    <section
      className='paragraph-container'
      onDoubleClick={handleDoubleClick}
      title={fileInfo}>
      <pre>{showText}</pre>
    </section>
  )
}

export default Paragraph
