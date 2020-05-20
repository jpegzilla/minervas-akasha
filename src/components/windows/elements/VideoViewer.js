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

import { globalContext } from './../../App'

import { secondsToTime } from './../../../utils/misc'

import worker from './utils/metadataWorker.worker'

let isPlaying = false,
  interval

const VideoViewer = props => {
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
  const [waiting, setWaiting] = useState(false)
  const [time, setTime] = useState(0)

  const { minerva, setStatusMessage, resetStatusText } = useContext(
    globalContext
  )

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
    const { key } = e

    switch (key) {
      case 'ArrowRight':
        imageRef.current.currentTime += 5
        break
      case 'ArrowLeft':
        imageRef.current.currentTime -= 5
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
          onClick={() => setInversion(!inversion)}>
          <span>invert</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            if (imageRef.current.paused && !isPlaying) {
              imageRef.current.play()
              isPlaying = true
            }
          }}>
          <span>play</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            if (!imageRef.current.paused && isPlaying) {
              imageRef.current.pause()
            }
          }}>
          <span>pause</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            imageRef.current.currentTime -= 5
            setTime(imageRef.current.currentTime)
          }}>
          <span>skip -5s</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            imageRef.current.currentTime += 5
            setTime(imageRef.current.currentTime)
          }}>
          <span>skip +5s</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => (imageRef.current.loop = !imageRef.current.loop)}>
          <span>loop</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() =>
            (imageRef.current.controls = !imageRef.current.controls)
          }>
          <span>
            {imageRef.current
              ? imageRef.current.controls
                ? 'hide controls'
                : 'show controls'
              : 'hide controls'}
          </span>
        </button>
        <button className='button-non-mutation disabled-status' disabled>
          <span>{waiting ? 'loading...' : 'ready'}</span>
        </button>
        <button className='button-non-mutation disabled-status' disabled>
          <span>
            loop: {imageRef.current && imageRef.current.loop ? ' on' : ' off'}
          </span>
        </button>
        <button className='button-non-mutation disabled-status' disabled>
          <span>{secondsToTime(time).substring(0, 12)}</span>
        </button>
        <button
          className='button-non-mutation span-all'
          onClick={() => {
            imageRef.current.loop = false
            imageRef.current.pause()
            imageRef.current.currentTime = 0
            setTime(imageRef.current.currentTime)

            setInversion(false)
          }}>
          <span>reset all</span>
        </button>
      </div>
      <div tabIndex='0' className='image-container' onKeyDown={handleKeyDown}>
        {source ? (
          <video
            controls
            ref={imageRef}
            onPlaying={() => {
              setWaiting(false)
              isPlaying = true
              interval = setInterval(() => {
                requestAnimationFrame(() => {
                  setTime(imageRef.current.currentTime)
                })
              }, 100)
            }}
            onSeeked={() => {
              setTime(imageRef.current.currentTime)
            }}
            onPause={() => {
              isPlaying = false
              clearInterval(interval)
            }}
            onWaiting={() => {
              setWaiting(true)
              clearInterval(interval)
            }}
            onDragStart={e => {
              e.preventDefault()
            }}
            onKeyDown={e => {
              handleKeyDown(e)
            }}
            onEnded={() => {
              clearInterval(interval)
            }}
            className={`${inversion ? 'inverted' : ''}`.trim()}
            src={source}
            alt={altToShow}
            title={altToShow}
            preload='auto'
            onLoadedMetadata={e => {
              clearInterval(interval)
              e.target.volume = minerva.settings.volume.master / 100
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
            }}></video>
        ) : (
          'loading video...'
        )}
      </div>
    </section>
  )
}

export default memo(VideoViewer)

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

VideoViewer.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  alt: PropTypes.string,
  id: PropTypes.string,
  mime: PropTypes.string,
  humanSize: PropTypes.string
}
