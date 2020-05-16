import jsmediatags from 'jsmediatags'
import * as musicMetadata from 'music-metadata-browser'
import { audioTagSchema, imageTagSchema } from './mediaTagSchema'
import EXIF from 'exif-js'

export default class MediaTagReader {
  constructor(mediaString) {
    this.mediaString = mediaString
  }

  /**
   * dataURItoBlob - convert a base64 data uri into a blob.
   * in the database, images and audio are stored as base64 data.
   * performance suffers if large base64 strings have to be loaded,
   * so a web worker uses this function to convert the long strings
   * to object urls, which are much, much faster to load.
   *
   * @param {string} dataURI base64 data uri.
   *
   * @returns {object} object containing both a blob and a buffer.
   */
  async dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    const byteString = atob(dataURI.split(',')[1])

    // separate out the mime component
    const mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length)

    // create a view into the buffer
    const ia = new Uint8Array(ab)

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    // write the ArrayBuffer to a blob, and you're done
    const blob = new Blob([ab], { type: mimeString })
    const buf = await blob.arrayBuffer()

    return { blob, buffer: buf }
  }

  /**
   * getFullAudioInfo - get audio information / metadata.
   *
   * @param {string} mime the mime type of the audio.
   *
   * @returns {Promise} resolves on successful tag retrieval,
   * rejects on error.
   */
  getFullAudioInfo(mime) {
    const { mediaString } = this
    // fix this so that whatever lib is used to pull tags, the resulting tags
    // are formatted in identically structured objects

    return new Promise((resolve, reject) => {
      this.dataURItoBlob(mediaString)
        .then(res => {
          // console.log("reading a file with type", mime);
          // console.log("buffer is:", res.blob);

          const parseWithJSMedia = [/mp3/gi, /image/gi, /video/gi]

          if (parseWithJSMedia.some(e => e.test(mime))) {
            jsmediatags.read(res.blob, {
              onSuccess: meta => {
                audioTagSchema(meta).then(res => {
                  resolve({ status: 'success', metadata: res })
                })
              },
              onError: err => {
                console.log(err)
              }
            })
          } else {
            // use this mainly for ogg / flac support
            musicMetadata.parseBlob(res.blob).then(meta => {
              audioTagSchema(meta).then(res => {
                resolve({ status: 'success', metadata: res })
              })
            })
          }
        })
        .catch(err => {
          console.log(err)
          reject({ status: 'failure', message: err })
        })
    })
  }

  /**
   * getFullImageInfo - get image information / metadata.
   *
   * @param {string} mime the mime type of the audio.
   *
   * @returns {Promise} resolves on successful tag retrieval,
   * rejects on error.
   */
  getFullImageInfo() {
    const { mediaString } = this
    // fix this so that whatever lib is used to pull tags, the resulting tags
    // are formatted in identically structured objects

    return new Promise((resolve, reject) => {
      this.dataURItoBlob(mediaString)
        .then(res => {
          // console.log("reading a file with type", mime);
          // console.log("buffer is:", res.blob);

          EXIF.getData(res.blob, function() {
            const tags = {}

            // make sure everything is in correct case
            for (const [k, v] of Object.entries(this.exifdata)) {
              tags[k.toString().toLowerCase()] = v.toString().toLowerCase()
            }

            imageTagSchema(tags).then(res => {
              resolve(res)
            })
          })
        })
        .catch(err => {
          console.log(err)
          reject({ status: 'failure', message: err })
        })
    })
  }

  /**
   * @static arrayBufferToBase64 - convert array buffer to base64.
   * this is mainly used when getting album covers from audio metadata.
   *
   * @param {ArrayBuffer} buffer array buffer to convert
   *
   * @returns {string} base64 encoded string.
   */
  static arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    return window.btoa(binary)
  }
}
