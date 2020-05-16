/* eslint no-restricted-globals: off */

import { b64toBlob } from './mediaUtils'

self.addEventListener('message', async message => {
  const { action, src, mime } = message.data

  let response

  switch (action) {
    case 'getObjectUrl':
      response = URL.createObjectURL(b64toBlob(src.split(',')[1], mime))

      break
    default:
      throw new Error('unknown action passed to metadataWorker.')
  }

  if (response) self.postMessage(response)
})
