const logErrors = (message, rethrown = null) => {
  /**
   * some error messages are not able to be displayed cross-origin (script errors).
   * so, I catch them and then throw them back through this function to get the full error.
   * see: https://stackoverflow.com/questions/44815172/log-shows-error-object-istrustedtrue-instead-of-actual-error-data
   **/
  if (rethrown) {
    const errorObject = rethrown

    // get currently stored list of errors
    const errors =
      JSON.parse(window.localStorage.getItem('minerva_errors')) || null

    // if there are existing errors, then attach the new error object to the existing ones.
    // otherwise, just set the new error.
    const newError = errors
      ? {
          ...errors,
          [new Date().toISOString()]: errorObject
        }
      : {
          [new Date().toISOString()]: errorObject
        }

    // store in localstorage.
    window.localStorage.setItem('minerva_errors', JSON.stringify(newError))
  }

  // this code is run if the current error being processed was not rethrown, and is not
  // a script error.
  try {
    const errors =
      JSON.parse(window.localStorage.getItem('minerva_errors')) || null

    // get the information needed from the error message object.
    const {
      message: msg,
      filename,
      lineno,
      colno,
      error,
      timeStamp,
      type
    } = message

    // navigator props to get
    const {
      appName,
      userAgent,
      language,
      platform,
      product,
      productSub,
      onLine
    } = window.navigator

    let errMsg

    // check to see if there was an error property in the error message
    if (error === null) {
      console.log(message, 'error was null.')

      const { message: msg, filename, error, type } = message

      errMsg = {
        msg,
        filename: filename || 'no filename provided',
        error: error || 'no error provided',
        type: type || 'error'
      }
    } else {
      errMsg = {
        stack: error.stack || 'no stack available',
        message: error.message
      }
    }

    // get window sizes
    const { innerHeight, innerWidth, scrollX, scrollY } = window

    // finish setting up compound error object. this is done in order to gather as much
    // error information as possible to aid in debugging.
    const errorObject = {
      msg,
      filename,
      timeStamp,
      lineno,
      type,
      colno,
      errorWithStack: errMsg,
      screen: { innerHeight, innerWidth, scrollX, scrollY },
      naviagtor: {
        appName,
        userAgent,
        language,
        platform,
        product,
        productSub,
        onLine
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      date: new Date().toString()
    }

    const newError = errors
      ? {
          ...errors,
          [new Date().toISOString()]: errorObject
        }
      : {
          [new Date().toISOString()]: errorObject
        }

    window.localStorage.setItem('minerva_errors', JSON.stringify(newError))
  } catch (err) {
    // this is where I catch script errors and re-process them as a new error.
    logErrors({
      message: 'an unknown script error was thrown. the message is included.',
      error: err
    })
  }
}

window.addEventListener('error', logErrors)

if (window.localStorage.getItem('minerva_errors')) {
  const errs = JSON.parse(window.localStorage.getItem('minerva_errors'))
  const len = Object.keys(errs).length

  if (len > 50) {
    window.localStorage.removeItem('minerva_errors')

    const newErrs = {}

    Object.entries(errs).forEach(([k, v], i) => {
      if (i > 49) {
        newErrs[k] = v
      }
    })

    window.localStorage.setItem('minerva_errors', JSON.stringify(newErrs))
  }
}

export default logErrors
