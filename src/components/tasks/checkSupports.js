import isPrivateMode from './isPrivateMode'

const privateMode = () => {
  return new Promise((resolve, reject) => {
    isPrivateMode().then(res => (res ? resolve() : reject()))
  })
}

const html5 = () => {
  if (typeof document.createElement('canvas').getContext === 'function')
    return true
  else throw new Error('this browser does not support html5.')
}

const localStorage = () => {
  if (window.localStorage) return true
  else throw new Error('localStorage is not supported in this browser.')
}

const safari = () => {
  const isSafari =
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') === -1 &&
    navigator.userAgent.indexOf('FxiOS') === -1

  if (!isSafari) return true
  else throw new Error('this application is not supported on safari.')
}

const composedPath = () => {
  if (Object.keys(Event.prototype).includes('composedPath')) {
    return true
  } else throw new Error('composedPath is not supported in this browser.')
}

const webGL = () => {
  const c = document.createElement('canvas')
  const g = c.getContext('webgl')

  if (g) return true
  else throw new Error('webGL is not supported in this browser.')
}

const webAudioAPI = () => {
  let context

  try {
    context = window.AudioContext || window.webkitAudioContext
    context = new AudioContext()
    context.close()
    return true
  } catch (err) {
    throw new Error('web audio api is not supported in this browser.')
  }
}

export const checkSupports = async () => {
  let errors = []

  const checkPrivateMode = await privateMode()

  if (!checkPrivateMode) {
    errors.push({
      message:
        'warning! this software will not behave as intended in private or incognito mode.'
    })
  }

  const toCheck = [
    composedPath,
    webAudioAPI,
    webGL,
    safari,
    localStorage,
    html5
  ]

  toCheck.forEach(item => {
    try {
      item()
    } catch (err) {
      errors.push(err)
    }
  })

  if (errors.length === 0) {
    return true
  } else
    throw new Error(
      JSON.stringify({
        errors,
        message: `errors: ${'\n' + errors.join('\n')}`
      })
    )
}
