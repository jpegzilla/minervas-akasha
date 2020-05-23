import { bytesToSize } from './../../../../utils/misc'

// file parsing has to go on in here. this is the function in which support must
// be added for new filetypes.
export default (
  droppedFiles,
  setStatusMessage,
  resetStatusText,
  setLoadingFileData,
  setActiveFileData
) => {
  // handle dropped file
  if (!droppedFiles) return

  console.log('freshly dropped file:', droppedFiles)

  // f is a file object.
  const f = droppedFiles

  // currently rejects files above 100mb, and warns above 50mb
  if (f.size > 5e7) {
    setStatusMessage({
      display: true,
      text: `status: files above 50mb may take some time to load, please wait...`,
      type: 'warning'
    })

    setTimeout(resetStatusText, 6000)
  }

  if (f.size > 10e7) {
    setStatusMessage({
      display: true,
      text: `status: large files (size >= 100mb) currently not supported.`,
      type: 'fail'
    })

    setTimeout(resetStatusText, 6000)

    console.log('very large file detected. rejecting.')

    // instead, possibly set a flag to add the file to the database as a compressed string
    // rather than uncompressed.
    return
  }

  // if a loading indicator can be displayed, display it
  if (setLoadingFileData) setLoadingFileData(true)

  // if a file has a certain extension but no mime type, then I will assign
  // one based on the extension.
  let assignedType
  let fileMime = f.type || 'text/plain'
  const fileExt = f.name.slice(f.name.lastIndexOf('.'))

  // this is a list of extensions that I think need to be manually assigned mimetypes.
  // it is currently incomplete, and also none of these formats are supported on the
  // web. I may figure out a way to convert them to web-friendly formats in the future.
  const videoExtensions = ['y4m', 'mkv', 'yuv', 'flv']
  const audioExtensions = ['8svx', '16svx', 'bwf']

  if (videoExtensions.find(item => new RegExp(item, 'gi').test(fileExt))) {
    fileMime = `video/${videoExtensions.find(item =>
      new RegExp(item, 'gi').test(fileExt)
    )}`

    assignedType = fileMime
  } else if (
    audioExtensions.find(item => new RegExp(item, 'gi').test(fileExt))
  ) {
    fileMime = `audio/${audioExtensions.find(item =>
      new RegExp(item, 'gi').test(fileExt)
    )}`

    assignedType = fileMime
  }

  // if file mimetype indicates a text file
  if (/text/gi.test(fileMime)) {
    f.text().then(e => {
      setActiveFileData({
        data: e,
        title: f.name,
        type: fileMime,
        mime: fileMime,
        size: f.size,
        ext: fileExt,
        humanSize: bytesToSize(f.size)
      })
    })

    return
  }

  if (/audio/gi.test(fileMime)) {
    // function for reading audio only
    const readAudio = file => {
      const reader = new FileReader()

      reader.addEventListener('load', e => {
        const data = e.target.result

        setActiveFileData({
          data,
          title: f.name,
          type: assignedType || f.type,
          mime: fileMime,
          size: f.size,
          ext: fileExt,
          humanSize: bytesToSize(f.size)
        })
      })

      reader.readAsDataURL(file)
    }

    readAudio(f)
  }

  if (/image/gi.test(fileMime)) {
    // function for reading images only
    const readImg = file => {
      const reader = new FileReader()

      reader.addEventListener('load', e => {
        setActiveFileData({
          data: e.target.result,
          title: f.name,
          type: f.type,
          mime: fileMime,
          size: f.size,
          ext: fileExt,
          humanSize: bytesToSize(f.size)
        })
      })

      reader.readAsDataURL(file)
    }

    readImg(f)
  }

  if (/video/gi.test(fileMime)) {
    // function for reading videos only
    const readVideo = file => {
      const reader = new FileReader()

      reader.addEventListener('load', e => {
        setActiveFileData({
          data: e.target.result,
          title: f.name,
          type: assignedType || f.type,
          mime: fileMime,
          size: f.size,
          ext: fileExt,
          humanSize: bytesToSize(f.size)
        })
      })

      reader.readAsDataURL(file)
    }

    readVideo(f)
  }
}
