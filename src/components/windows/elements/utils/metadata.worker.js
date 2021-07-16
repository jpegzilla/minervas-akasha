/* eslint no-restricted-globals: off */

import { b64toBlob } from './mediaUtils'

self.onmessage = message => {
  console.log('MESSAGE TO METADATA WORKER', message, self)
  const { action, src, mime } = message.data

  let response

  switch (action) {
    case 'getObjectUrl':
      response = URL.createObjectURL(b64toBlob(src.split(',')[1], mime))

      break
    default:
      response = {
        status: 'failure',
        text: `unknown action passed to metadata worker (${action}). you should never see this! please report this to jpegzilla so she can try to fix it.`,
      }
  }

  if (response) self.postMessage(response)
}
