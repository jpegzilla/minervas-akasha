import MediaTagReader from './MediaTagReader'
import { bytesToSize, secondsToTime } from './../../../../utils/misc'

/**
 * imageTagSchema - generate image metadata tag object.
 *
 * @param {object} tags an object containing the raw tags passed
 * from MediaTagReader.
 *
 * @returns {object} an object containing the uniformly formatted tags.
 */
export const imageTagSchema = tags => {
  const tagSchema = {}
  const msg = {}

  // the arrays like this that are in each of these schema functions are used
  // to determine the properties to retrieve from media metadata.
  const neededTags = [
    'software',
    'datetime',
    'pixelxdimension',
    'pixelydimension',
    'xresolution',
    'yresolution'
  ]

  try {
    neededTags.forEach(item => {
      if (item in tags) {
        tagSchema[item] = tags[item]
      }
    })
  } catch (err) {
    msg.status = 'failure'
    msg.message = err
  }

  if (msg.status !== 'failure') {
    msg.status = 'success'
    msg.message = tagSchema
  }

  return new Promise((resolve, reject) => {
    if (msg.status === 'failure') reject(msg.message)
    else resolve(msg.message)
  })
}

/**
 * videoTagSchema - generate video metadata tag object.
 *
 * @param {object} tags an object containing the raw tags passed
 * from MediaTagReader.
 *
 * @returns {object} an object containing the uniformly formatted tags.
 */
export const videoTagSchema = tags => {
  const tagSchema = {}
  const msg = {}

  const neededTags = ['videoWidth', 'videoHeight', 'duration']

  try {
    neededTags.forEach(item => {
      if (item in tags) {
        tagSchema[item] = tags[item]

        if (item === 'videoWidth') tagSchema['width'] = `${tags[item]}px`

        if (item === 'videoHeight') tagSchema['height'] = `${tags[item]}px`
      }
    })
  } catch (err) {
    msg.status = 'failure'
    msg.message = err
  }

  tagSchema.duration = secondsToTime(parseInt(tagSchema.duration))

  delete tagSchema['videoWidth']
  delete tagSchema['videoHeight']

  if (msg.status !== 'failure') {
    msg.status = 'success'
    msg.message = tagSchema
  }

  return new Promise((resolve, reject) => {
    if (msg.status === 'failure') reject(msg.message)
    else resolve(msg.message)
  })
}

/**
 * audioTagSchema - generate video metadata tag object.
 *
 * @param {object} tags an object containing the raw tags passed
 * from MediaTagReader.
 *
 * @returns {object} an object containing the uniformly formatted tags.
 */
export const audioTagSchema = tags => {
  const tagSchema = {}
  const msg = {}

  const neededTags = [
    'track',
    'title',
    'artist',
    'year',
    'date',
    'albumartist',
    'artists',
    'album',
    'picture',
    'genre'
  ]

  try {
    neededTags.forEach(item => {
      if ('common' in tags) {
        if (item in tags.common) {
          if (item === 'track')
            tagSchema[item] = tags.common[item].no
              ? tags.common[item].no.toString().padStart(2, '0')
              : 'no track information'
          else if (item === 'picture') tagSchema[item] = tags.common[item][0]
          else tagSchema[item] = tags.common[item]
        }
      } else if ('tags' in tags) {
        if (item in tags.tags) {
          tagSchema[item] = tags.tags[item]
        }
      }

      // if a record has a date, delete the year...
      if ('date' in tagSchema) {
        delete tagSchema.year
      }

      // ...and if it has a year, delete the date. no need for both
      if ('year' in tagSchema) {
        tagSchema['date'] = tagSchema['year']
        delete tagSchema.year
      }

      // if there are multiple entries for a certain tag, which usually happens when
      // there are multiple artists attached to a file, list them with commas.
      if (Array.isArray(tagSchema[item])) {
        tagSchema[item] = tagSchema[item].join(', ')
      }
    })
  } catch (err) {
    msg.status = 'failure'
    msg.message = err
  }

  if (msg.status !== 'failure') {
    msg.status = 'success'
    msg.message = tagSchema
  }

  // if there is an album image attached to the audio metadata
  if (tagSchema.picture) {
    if (!(tagSchema.picture.data instanceof Uint8Array))
      tagSchema.picture.data = Uint8Array.from(tagSchema.picture.data)

    // .buffer is a property on the TypedArray prototype
    const pictureBase64 =
      'data:image/png;base64,' +
      MediaTagReader.arrayBufferToBase64(tagSchema.picture.data.buffer)

    tagSchema.pictureData = pictureBase64
    tagSchema.pictureSize = bytesToSize(tagSchema.picture.data.byteLength)
  }

  return new Promise((resolve, reject) => {
    if (msg.status === 'failure') reject(msg.message)
    else resolve(msg.message)
  })
}
