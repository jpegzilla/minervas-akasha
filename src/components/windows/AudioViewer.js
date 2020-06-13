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
  interval,
  hasConnected = false

const audioCtx = new AudioContext()
const analyser = audioCtx.createAnalyser()
const freqanalyser = audioCtx.createAnalyser()

const AudioViewer = props => {
  const { src, alt, id, mime, humanSize } = props
  const { minerva } = useContext(globalContext)

  const audioRef = useRef()
  const canvasRef = useRef()
  const canvasFreqRef = useRef()

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
  const [oscData, setOscData] = useState()
  const [freqData, setFreqData] = useState()
  const [canvas, setCanvas] = useState()
  const [canvasFreq, setCanvasFreq] = useState()

  const { globalVolume, useToast } = useContext(globalContext)

  const toast = useToast()

  useEffect(() => {
    if (audioRef.current && !hasConnected) {
      const audioSource = audioCtx.createMediaElementSource(audioRef.current)

      // if the audioref exists, the canvas one does too
      setCanvas(canvasRef.current)
      setCanvasFreq(canvasFreqRef.current)

      audioSource.connect(analyser)
      analyser.connect(freqanalyser)
      freqanalyser.connect(audioCtx.destination)

      hasConnected = true

      setOscData(new Uint8Array(analyser.frequencyBinCount))
      setFreqData(new Uint8Array(freqanalyser.frequencyBinCount))
    }
  }, [audioRef])

  useEffect(() => {
    return () => {
      hasConnected = false
    }
  })

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

  const renderFrame = () => {
    analyser.getByteFrequencyData(
      oscData || new Uint8Array(analyser.frequencyBinCount)
    )
    analyser.fftSize = 16384

    const bufferLen = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLen)

    const canvasCtx = canvas.getContext('2d')

    const width = canvas.width
    const height = canvas.height

    canvasCtx.clearRect(0, 0, width, height)

    const draw = () => {
      if (!isPlaying) return

      requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      canvasCtx.clearRect(0, 0, width, height)
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)'
      canvasCtx.fillRect(0, 0, width, height)
      canvasCtx.lineWidth = 2
      canvasCtx.strokeStyle = 'rgb(254, 254, 254)'
      canvasCtx.beginPath()

      const sliceWidth = 1
      let x = 0

      for (let i = 0; i < bufferLen; i++) {
        const v = dataArray[i] / 128
        const y = (v * height) / 2

        if (i === 0) canvasCtx.moveTo(x, y)
        else canvasCtx.lineTo(x, y)

        x += sliceWidth
      }

      canvasCtx.lineTo(width, height / 2)
      canvasCtx.stroke()
    }

    draw()
  }

  const renderFreqFrame = () => {
    freqanalyser.getByteFrequencyData(
      freqData || new Uint8Array(freqanalyser.frequencyBinCount)
    )
    freqanalyser.fftSize = 2048

    const bufferLen = freqanalyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLen)

    const canvasFreqCtx = canvasFreq.getContext('2d')

    const width = canvasFreq.width
    const height = canvasFreq.height

    canvasFreqCtx.clearRect(0, 0, width, height)

    const draw = () => {
      if (!isPlaying) return

      requestAnimationFrame(draw)

      freqanalyser.getByteFrequencyData(dataArray)

      canvasFreqCtx.clearRect(0, 0, width, height)
      canvasFreqCtx.fillStyle = 'rgba(0, 0, 0, 0)'
      canvasFreqCtx.fillRect(0, 0, width, height)

      const barWidth = 1
      let barHeight
      let x = 0

      // for (let i = 0; i < bufferLen; i++) {
      for (let i = 0; i < freqanalyser.fftSize; i++) {
        barHeight = (dataArray[i] / 2) * 0.75

        canvasFreqCtx.fillStyle = 'rgb(254, 254, 254)'
        canvasFreqCtx.fillRect(x, height - barHeight, barWidth, barHeight)

        x += barWidth + 2
      }
    }

    draw()
  }

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
            if (src) dispatch({ type: 'source', payload: src })
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

  const resetAll = () => {
    if (audioRef.current) {
      audioRef.current.playbackRate = 1
      audioRef.current.currentTime = 0
      audioRef.current.loop = false
      audioRef.current.pause()
      isPlaying = false
      setWaiting(false)
    }
  }

  const handleKeyDown = e => {
    e.stopPropagation()

    const { key } = e

    switch (key.toLowerCase()) {
      case 'arrowright': // skip forward three seconds
        audioRef.current.currentTime += 3
        break
      case 'arrowleft': // skip backward three seconds
        audioRef.current.currentTime -= 3
        break
      case 'arrowup':
        audioRef.current.volume += 0.05
        break
      case 'arrowdown':
        audioRef.current.volume -= 0.05
        break
      case 'l': // skip forward ten seconds
        audioRef.current.currentTime += 10
        break
      case 'j': // skip backward ten seconds
        audioRef.current.currentTime -= 10
        break
      case 'm':
        if (audioRef.current) audioRef.current.muted = !audioRef.current.muted
        break
      case 'p':
      case 'k': // yes I like youtube's video player ok
        if (audioRef.current)
          audioRef.current.paused
            ? audioRef.current.play()
            : audioRef.current.pause()
        break
      case 'r':
        resetAll()
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
    <section
      tabIndex='-1'
      className='audio-viewer-container'
      onKeyDown={handleKeyDown}>
      <header className='audio-viewer-container-controls'>
        <span>{`audio vizualizer - ${titleToShow}, ${humanSize}, ${mime}`}</span>
      </header>

      <div className='audio-viewer-vizualizer-container'>
        <div className='audio-viewer-vizualizer'>
          <div className='canvas-container'>
            <canvas className='oscilloscope' ref={canvasRef}></canvas>
          </div>
          <div className='canvas-container'>
            <canvas className='frequency' ref={canvasFreqRef}></canvas>
          </div>
        </div>
        <div>
          <audio
            src={source}
            ref={audioRef}
            alt={altToShow}
            title={altToShow}
            controls
            onPlaying={() => {
              setWaiting(false)
              isPlaying = true
              interval = setInterval(() => {
                requestAnimationFrame(() => {
                  if (audioRef.current) {
                    setTime(audioRef.current.currentTime)
                  }
                })
              }, 100)
            }}
            onPlay={() => {
              isPlaying = true
              renderFrame()
              renderFreqFrame()
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
          title='hotkey: e'
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
            if (audioRef.current)
              audioRef.current.muted = !audioRef.current.muted
          }}>
          <span>
            {audioRef.current && audioRef.current.muted ? 'unmute' : 'mute'}{' '}
            audio
          </span>
        </button>
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
            audioRef.current.playbackRate -= 0.05
          }}>
          <span>rate -</span>
        </button>
        <button
          className='button-non-mutation'
          onClick={() => {
            audioRef.current.playbackRate += 0.05
          }}>
          <span>rate +</span>
        </button>

        <button
          className='button-non-mutation'
          onClick={() => (audioRef.current.loop = !audioRef.current.loop)}>
          <span>loop</span>
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
          title='shows the load state of the audio file.'
          className='button-non-mutation disabled-status'
          disabled>
          <span>{waiting ? 'loading...' : 'ready'}</span>
        </button>
        <button
          title='shows whether looping is on or off.'
          className='button-non-mutation disabled-status'
          disabled>
          <span>
            loop: {audioRef.current && audioRef.current.loop ? ' on' : ' off'}
          </span>
        </button>
        <button
          title='shows the current time in the audio file.'
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
            <p>
              playback rate{' '}
              {audioRef.current && audioRef.current.playbackRate.toFixed(2)}
            </p>
            <p>
              time remaining{' '}
              {audioRef.current &&
              !isNaN(audioRef.current.duration) &&
              !isNaN(audioRef.current.currentTime)
                ? secondsToTime(
                    Math.floor(
                      audioRef.current.duration - audioRef.current.currentTime
                    )
                  )
                : '0'}
            </p>
            <p>
              full duration{' '}
              {audioRef.current && !isNaN(audioRef.current.duration)
                ? secondsToTime(audioRef.current.duration)
                : '0'}
            </p>
            <p>waiting? {waiting.toString()}</p>
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
