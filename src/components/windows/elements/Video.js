import React, { useState, useEffect, useContext, useRef, memo } from 'react'

import { videoTagSchema } from './utils/mediaTagSchema'
import { globalContext } from './../../App'
import { uuidv4 } from './../../../utils/misc'

import PropTypes from 'prop-types'

import worker from './utils/metadataWorker.worker'

let timer,
  fadeInBuffer = false

const Video = props => {
  const { src, title, humanSize, mime, setMetadata, setLoadingFileData } = props

  const { minerva, globalVolume, useToast } = useContext(globalContext)

  const toast = useToast()

  const videoRef = useRef()

  const { autoplayMedia: shouldAutoplay } = minerva.settings

  const [error, setError] = useState(false)
  const [videoData, setVideoData] = useState()

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}\ndouble click to open in viewer.`

  useEffect(() => {
    setError(false)

    // creating a worker instance that will be used to turn the raw video base64
    // into an object url that will serve as the video source
    const workerInstance = new worker()

    workerInstance.postMessage({
      action: 'getObjectUrl',
      src,
      mime
    })

    workerInstance.onmessage = message => {
      if (message.data.status && message.data.status === 'failure') {
        throw new Error(message.data)
      }

      if (typeof message.data === 'string') setVideoData(message.data)
    }
  }, [mime, src, fileInfo])

  // keep the volume set correctly, in sync with global volume
  useEffect(() => {
    videoRef.current.volume =
      globalVolume.master / 100 || minerva.settings.volume.master / 100
  }, [globalVolume, videoRef, minerva.settings.volume.master])

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20video%20decoding%20issue%20with%20an%20${mime}%20encoded%20video`

  const handleDoubleClick = () => {
    const workerInstance = new worker()

    workerInstance.postMessage({
      action: 'getObjectUrl',
      src,
      mime
    })

    workerInstance.onmessage = message => {
      if (message.data.status && message.data.status === 'failure') {
        throw new Error(message.data)
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

        const newVideoViewer = {
          title: 'video viewer',
          state: 'restored',
          stringType: 'Window',
          component: 'VideoViewer',
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

        minerva.addFileToRecord(id, src, { type: 'videoviewer' })

        minerva.setWindows([...minerva.windows, newVideoViewer])

        minerva.setApplicationWindows(minerva.windows)

        // make the new window the active window
        minerva.setActiveWindowId(id)
      }
    }
  }

  // if there is an error, a link to a new issue on minerva's github will be shown with
  // an error message. otherwise, render a video element.
  return typeof error === 'string' ? (
    <span className='image-error' onClick={e => void e.stopPropagation()}>
      there was an issue decoding this video. error message: {error}.{' '}
      <a rel='noopener noreferrer' target='_blank' href={reportUrl}>
        please click here to report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <video
      onDoubleClick={handleDoubleClick}
      ref={videoRef}
      autoPlay={shouldAutoplay}
      onLoadedData={() => void setLoadingFileData(false)}
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
      onError={() => {
        setLoadingFileData(false)

        toast.add({
          duration: 5000,
          text: `status: file failed to load: ${title}`,
          type: 'warning'
        })

        setMetadata(false)
        setError(`video format not supported: ${mime}`)
      }}
      onLoadedMetadata={e => {
        const { duration, videoWidth, videoHeight } = e.target

        e.target.volume = minerva.settings.volume.master / 100

        videoTagSchema({ duration, videoWidth, videoHeight }).then(tags => {
          setMetadata({ ...tags, type: mime })
        })
      }}
      controls
      type={mime}
      src={videoData}
      title={fileInfo}
    />
  )
}

export default memo(Video)

Video.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  humanSize: PropTypes.string,
  mime: PropTypes.string,
  setMetadata: PropTypes.func,
  setLoadingFileData: PropTypes.func
}
