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

import { secondsToTime } from './../../utils/misc'

import worker from './elements/utils/metadataWorker.worker'

let isPlaying = false,
  interval,
  timer,
  fadeInBuffer = false

const VideoViewer = props => {
  const { src, alt, id, mime, humanSize } = props

  const videoRef = useRef()

  const altToShow = alt
    .split('\n')
    .splice(0, alt.split('\n').length - 1)
    .join('\n')

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
  const [showExtras, setShowExtras] = useState(false)

  const { minerva, useToast, globalVolume } = useContext(globalContext)

  const toast = useToast()

  useEffect(() => {
    if (videoRef.current)
      videoRef.current.volume =
        globalVolume.master / 100 || minerva.settings.volume.master / 100
  }, [globalVolume, videoRef, minerva.settings.volume.master])

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
          return toast.add({
            duration: 5000,
            text: message.data,
            type: 'fail'
          })
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
    e.stopPropagation()

    const { key } = e

    // the skip times are off by two seconds becuse the
    // default action of the video element on arrow key
    // presses is to skip 2 seconds. it seems impossible
    // to prevent this action.

    switch (key.toLowerCase()) {
      case 'arrowright': // skip forward five seconds
        videoRef.current.currentTime += 3
        break
      case 'arrowleft': // skip backward five seconds
        videoRef.current.currentTime -= 3
        break
      case 'l': // skip forward ten seconds
        videoRef.current.currentTime += 10
        break
      case 'j': // skip backward ten seconds
        videoRef.current.currentTime -= 10
        break
      case 'm':
        if (videoRef.current) videoRef.current.muted = !videoRef.current.muted
        break
      case 'p':
      case 'k': // yes I like youtube's video player ok
        if (videoRef.current)
          videoRef.current.paused
            ? videoRef.current.play()
            : videoRef.current.pause()
        break
      case 'r':
        resetAll()
        break
      case 'i':
        setInversion(!inversion)
        break
      case 'e':
      case 'd':
      case 's': // all these just show the extra data, like youtube's 'stats for nerds'
        setShowExtras(!showExtras)
        break
      default:
        return
    }
  }

  const resetAll = () => {
    if (videoRef.current) {
      videoRef.current.loop = false
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      videoRef.current.muted = false
      setTime(videoRef.current.currentTime)

      setInversion(false)
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

      <div tabIndex='0' className='image-container' onKeyDown={handleKeyDown}>
        {source ? (
          <video
            controls
            ref={videoRef}
            onPlaying={() => {
              setWaiting(false)
              isPlaying = true
              interval = setInterval(() => {
                requestAnimationFrame(() => {
                  if (videoRef.current) setTime(videoRef.current.currentTime)
                })
              }, 100)
            }}
            onSeeked={() => {
              if (videoRef.current) setTime(videoRef.current.currentTime)
            }}
            onPause={() => {
              isPlaying = false
              clearInterval(interval)
            }}
            onWaiting={() => {
              setWaiting(true)
              clearInterval(interval)
            }}
            onEnded={() => {
              clearInterval(interval)
            }}
            onMouseMove={() => {
              if (!fadeInBuffer && timer) {
                clearTimeout(timer)
                timer = 0

                if (videoRef.current) videoRef.current.style.cursor = ''
              } else {
                if (videoRef.current) videoRef.current.style.cursor = 'default'
                fadeInBuffer = false
              }

              timer = setTimeout(() => {
                if (videoRef.current) videoRef.current.style.cursor = 'none'

                fadeInBuffer = true
              }, 2000)
            }}
            className={`${inversion ? 'inverted' : ''}`.trim()}
            src={source}
            alt={altToShow}
            title={altToShow}
            onKeyDown={handleKeyDown}
            preload='auto'
            onLoadedMetadata={e => {
              clearInterval(interval)
              e.target.volume = minerva.settings.volume.master / 100
            }}
            onError={event => {
              console.error(event.type, event.message)

              toast.add({
                duration: 5000,
                text: `status: file failed to load: ${alt}`,
                type: 'warning'
              })

              dispatch({
                type: 'error',
                payload: `image format not supported: ${mime}`
              })
            }}></video>
        ) : (
          'loading video...'
        )}
      </div>
      <div className='video-control-buttons control-buttons'>
        <button
          title='hotkeys: e / s / d'
          className='button-non-mutation span-v-2'
          onClick={() => {
            setShowExtras(!showExtras)
          }}>
          <span>{showExtras ? 'hide' : 'show'} data</span>
        </button>
        <button
          title='hotkey: m'
          className='button-non-mutation span-v-2'
          onClick={() => {
            if (videoRef.current)
              videoRef.current.muted = !videoRef.current.muted
          }}>
          <span>
            {videoRef.current && videoRef.current.muted ? 'unmute' : 'mute'}{' '}
            video
          </span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => setInversion(!inversion)}>
          <span>invert</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            if (videoRef.current.paused && !isPlaying) {
              videoRef.current.play()
              isPlaying = true
            }
          }}>
          <span>play</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            if (!videoRef.current.paused && isPlaying) {
              videoRef.current.pause()
            }
          }}>
          <span>pause</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            videoRef.current.currentTime -= 5
            setTime(videoRef.current.currentTime)
          }}>
          <span>skip -5s</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            videoRef.current.currentTime += 5
            setTime(videoRef.current.currentTime)
          }}>
          <span>skip +5s</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => (videoRef.current.loop = !videoRef.current.loop)}>
          <span>loop</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() =>
            (videoRef.current.controls = !videoRef.current.controls)
          }>
          <span>
            {videoRef.current
              ? videoRef.current.controls
                ? 'hide controls'
                : 'show controls'
              : 'hide controls'}
          </span>
        </button>
        <button
          title='shows the load state of the video.'
          className='button-non-mutation disabled-status'
          disabled>
          <span>{waiting ? 'loading...' : 'ready'}</span>
        </button>
        <button
          title='shows whether looping is on or off.'
          className='button-non-mutation disabled-status'
          disabled>
          <span>
            loop: {videoRef.current && videoRef.current.loop ? ' on' : ' off'}
          </span>
        </button>
        <button
          title='shows the current time in the video.'
          className='button-non-mutation disabled-status'
          disabled>
          <span>{secondsToTime(time).substring(0, 13)}</span>
        </button>
        <button className='button-non-mutation span-all' onClick={resetAll}>
          <span>reset all</span>
        </button>
      </div>
      {source && showExtras && (
        <div className='viewer-stat-box'>
          <div>
            <p>
              time {videoRef.current && videoRef.current.currentTime.toFixed(6)}
              s
            </p>
            <p>
              duration{' '}
              {videoRef.current
                ? secondsToTime(Math.floor(videoRef.current.duration))
                : '0'}
            </p>
            <p>
              remaining{' '}
              {videoRef.current
                ? secondsToTime(
                    Math.floor(
                      videoRef.current.duration - videoRef.current.currentTime
                    )
                  )
                : '0'}
            </p>
            <p>
              vol{' '}
              {videoRef.current && (videoRef.current.volume * 100).toFixed(2)}%
            </p>
            <p>
              loop {videoRef.current && videoRef.current.loop ? 'on' : 'off'}
            </p>
            <p>inverted {inversion ? 'true' : 'false'}</p>
            <p>
              height {videoRef.current ? videoRef.current.videoHeight : '0'}px
            </p>
            <p>
              width {videoRef.current ? videoRef.current.videoWidth : '0'}px
            </p>
            <p>muted {videoRef.current && videoRef.current.muted.toString()}</p>
          </div>
        </div>
      )}
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
