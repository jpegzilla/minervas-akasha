/* eslint react-hooks/exhaustive-deps: off */

import React, {
  useReducer,
  useEffect,
  useContext,
  useRef,
  memo,
  useState
} from 'react'

import PropTypes from 'prop-types'

import { globalContext } from './../App'
import { getAverageColor } from './../../utils/misc'

import worker from './elements/utils/metadataWorker.worker'

let active = false
let currentX
let currentY
let initialX
let initialY
let xOffset = 0
let yOffset = 0

const ImageViewer = props => {
  const { src, alt, id, mime, humanSize } = props

  const imageRef = useRef()

  const altToShow =
    alt
      .split('\n')
      .splice(0, alt.split('\n').length - 1)
      .join('\n') + '\nscroll to zoom.'

  const titleToShow = alt.split('\n')[0]

  const [state, dispatch] = useReducer(imageViewerReducer, {
    source: null,
    error: false,
    found: false
  })

  const { source, error, found } = state

  const [inversion, setInversion] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [backgroundColor, setBackgroundColor] = useState({ r: 0, g: 0, b: 0 })
  const [translation, setTranslation] = useState({ x: 0, y: 0 })

  const { minerva, setStatusMessage, resetStatusText } = useContext(
    globalContext
  )

  const dragStart = e => {
    initialX = e.clientX - xOffset
    initialY = e.clientY - yOffset

    if (e.target === imageRef.current) {
      active = true
    }
  }

  const dragEnd = () => {
    initialX = currentX
    initialY = currentY

    imageRef.current.style.cursor = 'grab'

    active = false
  }

  const drag = e => {
    if (active) {
      e.preventDefault()

      e.target.style.cursor = 'grabbing'

      currentX = e.clientX - initialX
      currentY = e.clientY - initialY

      xOffset = currentX
      yOffset = currentY

      setTranslation({ x: currentX, y: currentY })
    }
  }

  useEffect(() => {
    if (id && found === true) {
      // remove the blob source from the component props. this is done because when the
      // app loads the next time, that blob url will no longer point to anything. it
      // will be replaced by a new one generated from the file stored in indexeddb.
      const newWindows = minerva.windows.map(w => {
        if (w.componentProps.id === id) {
          return {
            ...w,
            componentProps: {
              ...w.componentProps,
              src: false
            }
          }
        } else return w
      })

      minerva.setWindows([...newWindows])

      minerva.setApplicationWindows([...minerva.windows])

      // get the file using the id from the data structure
      getWithId(id)
    }
  }, [found, id])

  const getWithId = id => {
    // find the file using the data structure's id,
    // and use the retrieved data to construct an object url.
    minerva.findFileInRecord(id).then(res => {
      const workerInstance = new worker()

      workerInstance.postMessage({
        action: 'getObjectUrl',
        src: res.file,
        mime
      })

      workerInstance.onmessage = message => {
        if (message.data.status && message.data.status === 'failure') {
          throw new Error(message.data)
        }

        if (typeof message.data === 'string') {
          dispatch({ type: 'source', payload: message.data })
        }
      }
    })
  }

  // this function will run only when the image is first being loaded.
  // all it does is try to find the image by its stored url, and then
  // if it finds out that url doesn't exist, it will find the image
  // within indexeddb.
  useEffect(() => {
    if (!found) {
      fetch(src)
        .then(res => res.blob())
        .then(res => {
          if (res) {
            dispatch({ type: 'source', payload: src })
            dispatch({ type: 'found', payload: true })
          }
        })
        .catch(() => {
          // if no source is found at the specified blob url, then the url is no longer valid.
          // this happens when the page refreshes. so, take the given file id (id) and then
          // use it to find the correct id in the database.
          getWithId(id)
        })
    } else getWithId(id)
  }, [id, src])

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20image%20decoding%20issue%20with%20an%20${mime}%20encoded%20image`

  const handleKeyDown = e => {
    if (active) return

    const { key, ctrlKey } = e

    switch (key) {
      case 'ArrowUp':
        setTranslation({ ...translation, y: translation.y + 1 })
        break
      case 'ArrowDown':
        setTranslation({ ...translation, y: translation.y - 1 })
        break
      case 'ArrowLeft':
        setTranslation({ ...translation, x: translation.x + 1 })
        break
      case 'ArrowRight':
        setTranslation({ ...translation, x: translation.x - 1 })
        break

      case '=':
        if (ctrlKey) {
          e.preventDefault()
          setZoomLevel(zoomLevel + 1)
        }
        break
      case '-':
        if (ctrlKey) {
          e.preventDefault()
          setZoomLevel(zoomLevel - 1)
        }
        break
      default:
        return
    }
  }

  return typeof error === 'string' ? (
    <span className='image-error' onClick={e => void e.stopPropagation()}>
      there was an issue decoding this image. error message: {error}.{' '}
      <a rel='noopener noreferrer' target='_blank' href={reportUrl}>
        please click here to report this to jpegzilla so she can try to fix it.
      </a>{' '}
      p.s. you should never see this error. oops.
    </span>
  ) : (
    <section className='image-viewer-container'>
      <header className='image-viewer-container-controls'>
        <p>{`image viewer - ${titleToShow}, ${humanSize}, ${mime}`}</p>
      </header>
      <div className='control-buttons'>
        <button
          className='button-non-mutation'
          onClick={() => {
            setZoomLevel(zoomLevel + 1)
          }}>
          <span>zoom in</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            setZoomLevel(zoomLevel - 1)
          }}>
          <span>zoom out</span>
        </button>
        <button
          className='button-non-mutation'
          onMouseDown={() => setZoomLevel(100)}>
          <span>reset zoom</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => setInversion(!inversion)}>
          <span>invert</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => setTranslation({ x: 0, y: 0 })}>
          <span>reset pan</span>
        </button>
        <button
          className='button-non-mutation span-all'
          onClick={() => {
            currentX = 0
            currentY = 0
            initialX = 0
            initialY = 0
            xOffset = 0
            yOffset = 0

            dragEnd()
            setZoomLevel(100)
            setInversion(false)
            setTranslation({ x: 0, y: 0 })
          }}>
          <span>reset all</span>
        </button>
      </div>
      <div
        tabIndex='0'
        className='image-container'
        style={{
          backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, 0.5)`
        }}
        onKeyDown={handleKeyDown}
        onWheel={({ nativeEvent }) => {
          const { deltaY } = nativeEvent

          requestAnimationFrame(() => {
            setZoomLevel(zoomLevel + -parseInt(`${(deltaY / 100) * 5}`))
          })
        }}>
        {source ? (
          <img
            ref={imageRef}
            style={{
              transform: `scale(${zoomLevel / 100}) translate3d(${
                translation.x
              }px, ${translation.y}px, 0)`
            }}
            onDragStart={e => {
              e.preventDefault()
            }}
            onKeyDown={e => {
              console.log(e.key)
              handleKeyDown(e)
            }}
            onMouseDown={dragStart}
            onMouseUp={dragEnd}
            onMouseLeave={dragEnd}
            onMouseMove={drag}
            className={`${inversion ? 'inverted' : ''}`.trim()}
            src={source}
            alt={altToShow}
            title={altToShow}
            onLoad={e => {
              const bg = getAverageColor(e.target)
              setBackgroundColor(bg)
            }}
            onError={event => {
              console.error(event.type, event.message)

              setStatusMessage({
                display: true,
                text: `status: file failed to load: ${alt}`,
                type: 'warning'
              })

              setTimeout(resetStatusText, 5000)
              dispatch({
                type: 'error',
                payload: `image format not supported: ${mime}`
              })
            }}
          />
        ) : (
          'loading image...'
        )}
      </div>
    </section>
  )
}

export default memo(ImageViewer)

const imageViewerReducer = (state, action) => {
  const { type, payload } = action

  switch (type) {
    case 'source':
    case 'error':
    case 'found':
      return { ...state, [type]: payload }
    default:
      return state
  }
}

ImageViewer.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  alt: PropTypes.string,
  id: PropTypes.string,
  mime: PropTypes.string,
  humanSize: PropTypes.string
}
