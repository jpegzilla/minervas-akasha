/* eslint no-restricted-globals: off */

self.onmessage = message => {
  console.log('MESSAGE TO EXPORT WORKER', message, self)
  const { data, action } = message.data

  switch (action) {
    case 'stringify':
      const dbString = JSON.stringify(data)

      const exportObject = {
        minerva_db: dbString,
      }

      self.postMessage(exportObject)
      break
    case 'stringifyandblob':
      const exportString = JSON.stringify(data)

      const blob = new Blob([exportString], { type: 'application/json' })

      const reader = new FileReader()

      reader.addEventListener('load', e => {
        const dataUrl = e.target.result

        self.postMessage(dataUrl)
      })

      reader.readAsDataURL(blob)
      break
    case 'parse':
      const parser = new FileReader()

      parser.addEventListener('load', e => {
        const json = e.target.result

        const object = JSON.parse(json)

        self.postMessage(object)
      })

      parser.readAsText(data)

      break
    case 'jsonParse':
      self.postMessage(JSON.parse(data))
      break
    default:
      self.postMessage({
        status: 'failure',
        text: `unknown action passed to export worker (${action}). you should never see this! please report this to jpegzilla so she can try to fix it.`,
      })
  }
}
