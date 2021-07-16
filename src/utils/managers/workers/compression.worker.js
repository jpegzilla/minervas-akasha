/* eslint no-restricted-globals: off */

import * as LZUTF8 from './lzutf8.min'

self.onmessage = message => {
  console.log('MESSAGE TO COMPRESSION WORKER', message, self)
  const { action, toCompress, toDecompress } = message.data

  if (action) {
    let response

    switch (action) {
      case 'compress':
        response = LZUTF8.compress(toCompress, {
          outputEncoding: 'StorageBinaryString',
        })

        break

      case 'decompress':
        response = LZUTF8.decompress(toDecompress, {
          inputEncoding: 'StorageBinaryString',
        })
        break

      default:
        response = {
          status: 'failure',
          text: `unknown action passed to compression worker (${action}). you should never see this! please report this to jpegzilla so she can try to fix it.`,
        }
    }

    if (response) self.postMessage(response)
  }
}
