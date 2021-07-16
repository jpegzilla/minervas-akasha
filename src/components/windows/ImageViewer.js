/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  useReducer,
  useEffect,
  useContext,
  useRef,
  memo,
  useState,
} from 'react'

import PropTypes from 'prop-types'

import { globalContext } from './../App'
import { getAverageColor } from './../../utils/misc'

import mdWorker from './elements/utils/metadata.worker'

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
    found: false,
  })

  const { source, error, found } = state

  const [inversion, setInversion] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [backgroundColor, setBackgroundColor] = useState({ r: 0, g: 0, b: 0 })
  const [translation, setTranslation] = useState({ x: 0, y: 0 })
  const [rotationAngle, setRotationAngle] = useState(0)
  const [showExtras, setShowExtras] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)

  const { minerva, useToast } = useContext(globalContext)

  const toast = useToast()

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
              src: false,
            },
          }
        } else return w
      })

      minerva.setWindows([...newWindows])

      minerva.setApplicationWindows([...minerva.windows])

      // get the file using the id from the data structure
      getWithId(id)
    }
  }, [found, id])

  const getObjectUrlFromWorker = ({ file }) => {
    const workerInstance = new mdWorker()

    workerInstance.postMessage({
      action: 'getObjectUrl',
      src: file,
      mime,
    })

    workerInstance.onmessage = message => {
      if (message.data.status && message.data.status === 'failure') {
        return toast.add({
          duration: 5000,
          text: message.data.text,
          type: 'fail',
        })
      }

      if (typeof message.data === 'string') {
        dispatch({ type: 'source', payload: message.data })
      }
    }
  }

  const getWithId = id => {
    // find the file using the data structure's id,
    // and use the retrieved data to construct an object url.
    minerva.findFileInRecord(id).then(res => {
      getObjectUrlFromWorker(res)
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

    e.stopPropagation()

    switch (key) {
      case 'ArrowUp':
        setTranslation({ ...translation, y: translation.y + 1 })
        break
      case 'ArrowDown':
        setTranslation({ ...translation, y: translation.y - 1 })
        break
      case 'ArrowLeft':
        if (ctrlKey) return setRotationAngle(rotationAngle - 1)
        setTranslation({ ...translation, x: translation.x + 1 })
        break
      case 'ArrowRight':
        if (ctrlKey) return setRotationAngle(rotationAngle + 1)
        setTranslation({ ...translation, x: translation.x - 1 })
        break
      case 'PageUp':
        e.preventDefault()
        setZoomLevel(zoomLevel + 1)
        break
      case 'PageDown':
        e.preventDefault()
        setZoomLevel(zoomLevel - 1)
        break
      case '=':
        if (ctrlKey) {
          e.preventDefault()
          setZoomLevel(zoomLevel + 10)
        }
        break
      case '-':
        if (ctrlKey) {
          e.preventDefault()
          setZoomLevel(zoomLevel - 10)
        }
        break
      case 'r':
        resetAll()
        break
      case 'i':
        setInversion(!inversion)
        break
      case 'e':
        setShowExtras(!showExtras)
        break
      case 'h':
      case 'b':
        setShowHighlight(!showHighlight)
        break
      default:
        return
    }
  }

  const resetAll = () => {
    currentX = 0
    currentY = 0
    initialX = 0
    initialY = 0
    xOffset = 0
    yOffset = 0

    dragEnd()
    setZoomLevel(100)
    setRotationAngle(0)
    setInversion(false)
    setTranslation({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (rotationAngle <= -360) setRotationAngle(0)
    if (rotationAngle >= 360) setRotationAngle(0)
  }, [rotationAngle])

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
        <p>{`${titleToShow}, ${humanSize}, ${mime}`}</p>
      </header>
      <div
        tabIndex='-1'
        className='image-container'
        style={{
          backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, 0.5)`,
        }}
        onKeyDown={handleKeyDown}
        onWheel={({ nativeEvent }) => {
          const { deltaY } = nativeEvent

          // these clauses are here because for some fucking reason, deltaY
          // (scroll distance) comes out to like, THREE on firefox and
          // ONE HUNDRED on chrome. why?

          if (Math.abs(deltaY) < 100)
            // figure out whether to make the number negative or positive and then
            // stick on a five
            setZoomLevel(zoomLevel + -parseInt(`${deltaY < 0 ? '-' : ''}${5}`))
          else if (Math.abs(deltaY) >= 100)
            setZoomLevel(zoomLevel + -parseInt(`${(deltaY / 100) * 5}`))
        }}>
        {source ? (
          <img
            ref={imageRef}
            style={{
              transform: `scale(${zoomLevel /
                100}) rotateZ(${rotationAngle}deg) translate3d(${
                translation.x
              }px, ${translation.y}px, 0)`,
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
            className={`${inversion ? 'inverted' : ''} ${
              showHighlight ? 'highlight' : ''
            }`.trim()}
            src={source}
            alt={altToShow}
            title={altToShow}
            onLoad={e => {
              const bg = getAverageColor(e.target)
              setBackgroundColor(bg)
            }}
            onError={event => {
              console.error(event.type, event.message)

              toast.add({
                duration: 5000,
                text: `status: file failed to load: ${alt}`,
                type: 'warning',
              })

              dispatch({
                type: 'error',
                payload: `image format not supported: ${mime}`,
              })
            }}
          />
        ) : (
          'loading image...'
        )}
      </div>
      <div className='image-control-buttons control-buttons'>
        <button
          title='hotkey: e'
          className='button-non-mutation span-v-2'
          onClick={() => {
            setShowExtras(!showExtras)
          }}>
          <span>{showExtras ? 'hide' : 'show'} data</span>
        </button>
        <button
          title='hotkeys: h / b'
          className='button-non-mutation span-v-2'
          onClick={() => {
            setShowHighlight(!showHighlight)
          }}>
          <span>{showHighlight ? 'hide' : 'show'} box</span>
        </button>
        <button
          title='hotkeys: ctrl + plus / page up'
          className='button-non-mutation'
          onClick={() => {
            setZoomLevel(zoomLevel + 1)
          }}>
          <span>zoom in</span>
        </button>
        <button
          title='hotkeys: ctrl + minus / page down'
          className='button-non-mutation'
          onClick={() => {
            setZoomLevel(zoomLevel - 1)
          }}>
          <span>zoom out</span>
        </button>
        <button
          title='hotkey: ctrl + left arrow key'
          className='button-non-mutation'
          onClick={() => {
            if (rotationAngle < -360) setRotationAngle(0)
            else setRotationAngle(rotationAngle - 1)
          }}>
          <span>rotate ccw</span>
        </button>
        <button
          title='hotkey: ctrl + right arrow key'
          className='button-non-mutation'
          onClick={() => {
            if (rotationAngle > 360) setRotationAngle(0)
            else setRotationAngle(rotationAngle + 1)
          }}>
          <span>rotate cw</span>
        </button>

        <button
          title='hotkey: i'
          className='button-non-mutation'
          onClick={() => setInversion(!inversion)}>
          <span>invert</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            setRotationAngle(0)
          }}>
          <span>reset rotation</span>
        </button>
        <button
          className='button-non-mutation'
          onMouseDown={() => setZoomLevel(100)}>
          <span>reset zoom</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => setTranslation({ x: 0, y: 0 })}>
          <span>reset pan</span>
        </button>
        <button
          title='hotkey: r'
          className='button-non-mutation span-all'
          onClick={resetAll}>
          <span>reset all</span>
        </button>
      </div>
      {source && showExtras && (
        <div className='viewer-stat-box'>
          <div>
            <p>x {translation.x}px</p>
            <p>y {translation.y}px</p>
            <p>zoom {zoomLevel}%</p>
            <p>inverted {inversion ? 'true' : 'false'}</p>
            <p>rot {rotationAngle}deg</p>
            <p>
              height {imageRef.current ? imageRef.current.naturalHeight : '0'}px
            </p>
            <p>
              width {imageRef.current ? imageRef.current.naturalWidth : '0'}px
            </p>
          </div>
        </div>
      )}
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
  humanSize: PropTypes.string,
}
