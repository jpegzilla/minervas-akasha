import React, { useState, useEffect, useContext, useRef, memo } from 'react'
import MediaTagReader from './utils/MediaTagReader'

import worker from './utils/metadataWorker.worker'

import { uuidv4 } from './../../../utils/misc'

import { b64toBlob } from './utils/mediaUtils'

import PropTypes from 'prop-types'
import { globalContext } from './../../App'

// makes sure that the element doesn't repeatedly have to recreate object urls
const imageDataCache = {}

// read metadata
const Img = props => {
  const {
    src,
    title,
    humanSize,
    mime,
    setMetadata,
    onLoad,
    setLoadingFileData
  } = props

  const imageRef = useRef()

  const { minerva, useToast } = useContext(globalContext)

  const toast = useToast()
  const [error, setError] = useState(false)
  const [imageData, setImageData] = useState()

  const fileInfo = `title: ${title ||
    'no title provided'}\nsize: ${humanSize}\ntype: ${mime}\ndouble click to open in viewer.`

  useEffect(() => {
    setError(false)
    if (imageDataCache.title && imageDataCache.size) {
      if (
        imageDataCache.title === title &&
        imageDataCache.size === humanSize &&
        imageDataCache.url
      ) {
        return
      }
    }

    const data = URL.createObjectURL(b64toBlob(src.split(',')[1], mime))

    imageDataCache.url = data

    setImageData(data)
  }, [mime, src, fileInfo, humanSize, title])

  const altOnLoad = e => {
    const { naturalHeight, naturalWidth } = e.target

    if (imageDataCache.title && imageDataCache.size) {
      if (imageDataCache.title === title && imageDataCache.size === humanSize) {
        return
      }
    }

    imageDataCache.title = title
    imageDataCache.size = humanSize

    const reader = new MediaTagReader(src)
    reader.getFullImageInfo(mime).then(res => {
      if (
        Object.values(res).length === 0 &&
        !res['pixelxdimension'] &&
        !res['pixelydimension']
      ) {
        res = Object.assign(res, {
          height: naturalHeight,
          width: naturalWidth
        })
      }

      setMetadata(res)
    })
  }

  const onLoadAction = onLoad || altOnLoad

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20image%20decoding%20issue%20with%20an%20${mime}%20encoded%20image`

  const handleDoubleClick = () => {
    const workerInstance = new worker()

    workerInstance.postMessage({
      action: 'getObjectUrl',
      src,
      mime
    })

    workerInstance.onmessage = message => {
      if (message.data.status && message.data.status === 'failure') {
        return toast.add({
          duration: 5000,
          text: message.data,
          type: 'fail'
        })
      }

      if (typeof message.data === 'string') {
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

        const newImageViewer = {
          title: 'image viewer',
          state: 'restored',
          stringType: 'Window',
          component: 'ImageViewer',
          componentProps: {
            src: message.data,
            alt: fileInfo,
            id,
            mime,
            humanSize
          },
          belongsTo: minerva.user.id,
          id,
          position: {
            x: finalPosition,
            y: finalPosition
          }
        }

        minerva.addFileToRecord(id, src, { type: 'imageviewer' })

        minerva.setWindows([...minerva.windows, newImageViewer])

        minerva.setApplicationWindows(minerva.windows)

        // make the new window the active window
        minerva.setActiveWindowId(id)
      }
    }
  }

  return typeof error === 'string' ? (
    <span className='image-error' onClick={e => void e.stopPropagation()}>
      there was an issue decoding this image. error message: {error}.{' '}
      <a rel='noopener noreferrer' target='_blank' href={reportUrl}>
        please click here to report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <img
      decoding='async'
      loading='lazy'
      onDoubleClick={handleDoubleClick}
      ref={imageRef}
      onLoad={e => {
        setLoadingFileData(false)
        setError(false)
        onLoadAction(e)
      }}
      onError={() => {
        setLoadingFileData(false)

        toast.add({
          duration: 5000,
          text: `status: file failed to load: ${title}`,
          type: 'warning'
        })

        setMetadata(false)
        setError(`image format not supported: ${mime}`)
      }}
      src={imageData}
      title={fileInfo}
      alt={fileInfo}
    />
  )
}

export default memo(Img)

Img.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  humanSize: PropTypes.string,
  mime: PropTypes.string,
  setMetadata: PropTypes.func,
  setLoadingFileData: PropTypes.func,
  onLoad: PropTypes.func
}
