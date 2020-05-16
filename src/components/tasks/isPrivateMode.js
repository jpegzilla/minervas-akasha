/* eslint no-useless-escape: off */
/**
 * Lightweight script to detect whether the browser is running in Private mode.
 * @returns {Promise<boolean>}
 *
 * Live demo:
 * @see https://output.jsbin.com/tazuwif
 *
 * This snippet uses Promises. If you want to run it in old browsers, polyfill it:
 * @see https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js
 *
 * More Promise Polyfills:
 * @see https://ourcodeworld.com/articles/read/316/top-5-best-javascript-promises-polyfills
 */
export default () => {
  return new Promise(resolve => {
    const yes = () => {
      resolve(true)
    } // is in private mode
    const not = () => {
      resolve(false)
    } // not in private mode

    const detectChromeOpera = () => {
      // https://developers.google.com/web/updates/2017/08/estimating-available-storage-space
      const isChromeOpera =
        /(?=.*(opera|chrome)).*/i.test(navigator.userAgent) &&
        navigator.storage &&
        navigator.storage.estimate
      if (isChromeOpera) {
        navigator.storage.estimate().then(function(data) {
          return data.quota < 120000000 ? yes() : not()
        })
      }
      return !!isChromeOpera
    }

    const detectFirefox = () => {
      const isMozillaFirefox = 'MozAppearance' in document.documentElement.style
      if (isMozillaFirefox) {
        if (indexedDB == null) yes()
        else {
          const db = indexedDB.open('inPrivate')
          db.onsuccess = not
          db.onerror = yes
        }
      }
      return isMozillaFirefox
    }

    const detectSafari = () => {
      const isSafari = navigator.userAgent.match(/Version\/([0-9\._]+).*Safari/)
      if (isSafari) {
        const testLocalStorage = () => {
          try {
            if (localStorage.length) not()
            else {
              localStorage.setItem('inPrivate', '0')
              localStorage.removeItem('inPrivate')
              not()
            }
          } catch (_) {
            // Safari only enables cookie in private mode
            // if cookie is disabled, then all client side storage is disabled
            // if all client side storage is disabled, then there is no point
            // in using private mode
            navigator.cookieEnabled ? yes() : not()
          }
          return true
        }

        const version = parseInt(isSafari[1], 10)
        if (version < 11) return testLocalStorage()
        try {
          window.openDatabase(null, null, null, null)
          not()
        } catch (_) {
          yes()
        }
      }
      return !!isSafari
    }

    const detectEdgeIE10 = () => {
      const isEdgeIE10 =
        !window.indexedDB && (window.PointerEvent || window.MSPointerEvent)
      if (isEdgeIE10) yes()
      return !!isEdgeIE10
    }

    // when a browser is detected, it runs tests for that browser
    // and skips pointless testing for other browsers.
    if (detectChromeOpera()) return
    if (detectFirefox()) return
    if (detectSafari()) return
    if (detectEdgeIE10()) return

    // default navigation mode
    return not()
  })
}
