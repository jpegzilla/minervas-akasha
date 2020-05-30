import React, {
  useEffect,
  useContext,
  useReducer,
  useRef,
  memo,
  useState,
} from 'react'

import PropTypes from 'prop-types'

import { globalContext } from './../App'

import { secondsToTime } from './../../utils/misc'
import worker from './elements/utils/metadataWorker.worker'

let isPlaying = false,
  interval

const AudioViewer = props => {
  const { src, alt, id, mime, humanSize } = props
  const { minerva } = useContext(globalContext)

  const audioRef = useRef()

  const altToShow = alt
    .split('\n')
    .splice(0, alt.split('\n').length - 1)
    .join('\n')

  const titleToShow = alt.split('\n')[0]

  const [state, dispatch] = useReducer(audioViewerReducer, {
    source: null,
    error: false,
    found: false,
  })

  const { source, error, found } = state

  const [waiting, setWaiting] = useState(false)
  const [time, setTime] = useState(0)
  const [showExtras, setShowExtras] = useState(false)

  const { globalVolume, useToast } = useContext(globalContext)

  const toast = useToast()

  useEffect(() => {
    if (audioRef.current)
      audioRef.current.volume =
        globalVolume.master / 100 || minerva.settings.volume.master / 100
  }, [globalVolume, audioRef, minerva.settings.volume.master])

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

  const getWithId = id => {
    // find the file using the data structure's id,
    // and use the retrieved data to construct an object url.
    minerva.findFileInRecord(id).then(res => {
      const workerInstance = new worker()

      workerInstance.postMessage({
        action: 'getObjectUrl',
        src: res.file,
        mime,
      })

      workerInstance.onmessage = message => {
        if (message.data.status && message.data.status === 'failure') {
          toast.add({
            duration: 3000,
            text: message.data,
            type: 'fail',
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

  const handleKeyDown = e => {
    const { key } = e

    switch (key) {
      case 'ArrowRight':
        audioRef.current.currentTime += 5
        break
      case 'ArrowLeft':
        audioRef.current.currentTime -= 5
        break
      case 'e':
        setShowExtras(!showExtras)
        break
      default:
        return
    }
  }

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20audio%20decoding%20issue%20with%20an%20${mime}%20encoded%20audio%20file`

  return typeof error === 'string' ? (
    <span className='image-error' onClick={e => void e.stopPropagation()}>
      there was an issue decoding this image. error message: {error}.{' '}
      <a rel='noopener noreferrer' target='_blank' href={reportUrl}>
        please click here to report this to jpegzilla so she can try to fix it.
      </a>{' '}
      p.s. you should never see this error. oops.
    </span>
  ) : (
    <section className='audio-viewer-container'>
      <header className='audio-viewer-container-controls'>
        <span>{`audio vizualizer - ${titleToShow}, ${humanSize}, ${mime}`}</span>
      </header>

      <div>
        <div>vizualizer here</div>
        <div>
          <audio
            src={source}
            ref={audioRef}
            alt={altToShow}
            title={altToShow}
            onKeyDown={handleKeyDown}
            onPlaying={() => {
              setWaiting(false)
              isPlaying = true
              interval = setInterval(() => {
                requestAnimationFrame(() => {
                  if (audioRef.current) setTime(audioRef.current.currentTime)
                })
              }, 100)
            }}
            onSeeked={() => {
              if (audioRef.current) setTime(audioRef.current.currentTime)
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
            onLoadedMetadata={e => {
              clearInterval(interval)
              e.target.volume = minerva.settings.volume.master / 100
            }}
            onError={event => {
              console.error(event.type, event.message)

              toast.add({
                duration: 5000,
                text: `status: file failed to load: ${alt}`,
                type: 'warning',
              })

              clearInterval(interval)

              dispatch({
                type: 'error',
                payload: `image format not supported: ${mime}`,
              })
            }}></audio>
        </div>
      </div>
      <div className='audio-control-buttons control-buttons'>
        <button
          className='button-non-mutation'
          onClick={() => {
            if (audioRef.current.paused && !isPlaying) {
              audioRef.current.play()
              isPlaying = true
            }
          }}>
          <span>play</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            if (!audioRef.current.paused && isPlaying) {
              audioRef.current.pause()
              clearInterval(interval)
            }
          }}>
          <span>pause</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            audioRef.current.currentTime -= 5
            setTime(audioRef.current.currentTime)
          }}>
          <span>skip -5s</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            audioRef.current.currentTime += 5
            setTime(audioRef.current.currentTime)
          }}>
          <span>skip +5s</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => (audioRef.current.loop = !audioRef.current.loop)}>
          <span>loop</span>
        </button>
        <button
          title='hotkey: e'
          className='button-non-mutation span-v-2'
          onClick={() => {
            setShowExtras(!showExtras)
          }}>
          <span>{showExtras ? 'hide' : 'show'} data</span>
        </button>
      </div>
      {source && showExtras && (
        <div className='viewer-stat-box'>
          <div>
            <p>
              time {audioRef.current && audioRef.current.currentTime.toFixed(6)}
              s
            </p>
            <p>
              vol{' '}
              {audioRef.current && (audioRef.current.volume * 100).toFixed(2)}%
            </p>
            <p>
              loop {audioRef.current && audioRef.current.loop ? 'on' : 'off'}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default memo(AudioViewer)

const audioViewerReducer = (state, action) => {
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

AudioViewer.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  alt: PropTypes.string,
  id: PropTypes.string,
  mime: PropTypes.string,
  humanSize: PropTypes.string,
}
