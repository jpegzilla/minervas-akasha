import searchAllRecords from './utils/searchAllRecords'

export default (minerva, command) => {
  command = command.toLowerCase()
  const params = command.split(' ')
  params.splice(0, 1)

  let usingTypeOption = false,
    usingMimeOption = false

  const validIdents = [
    'shard',
    'node',
    'grimoire',
    'athenaeum',
    'hypostasis',
    'all',
    'any'
  ]

  // get the name of the structure as well as the type. default is any.
  let mime = 'any',
    type = 'any'

  // look for options
  if (params.includes('--mime')) {
    mime = params[params.indexOf('--mime') + 1]

    params.splice(params.indexOf('--mime'), 2)

    usingMimeOption = true

    if (!mime) {
      return {
        state: 'error',
        message: 'if using the --mime option, please specify a mime type.'
      }
    }
  }

  if (params.includes('--type')) {
    type = params[params.indexOf('--type') + 1]

    params.splice(params.indexOf('--type'), 2)

    usingTypeOption = true

    if (!type || !validIdents.includes(type)) {
      return {
        state: 'error',
        message: 'if using the --type option, please specify a structure type.'
      }
    }
  }

  // the remaining item should just be the search query
  const query = params.join(' ')

  const search = {
    query,
    type,
    mime
  }

  if (type && !validIdents.includes(type))
    return {
      state: 'error',
      message:
        'invalid parameter passed to find. first parameter must be a structure type.'
    }

  let recordMessage = 'found '

  const foundRecords = searchAllRecords(minerva, search, {
    usingMimeOption,
    usingTypeOption
  })

  if (foundRecords.count === 0)
    return 'no results. check your spelling, and try using the --mime\nor --type options for more specific results.'

  recordMessage += `${foundRecords.count} ${
    foundRecords.count !== 1 ? 'records' : 'record'
  }. search parameters: [mime: ${mime}, type: ${type}]

  \n`

  foundRecords.records.forEach((record, i) => {
    const {
      name,
      id,
      createdAt,
      updatedAt,
      connectedTo,
      foundInObject,
      type: recType
    } = record

    // create the results string
    const matchingProps =
      Object.entries(foundInObject)
        .map(([k, v]) => (v ? k : false))
        .filter(Boolean)
        .map((item, i, a) => {
          if (item === 'type') item = `type (${type})`
          if (item === 'mime') item = `type (${record.data.file.mime})`

          return a.length > 2
            ? i === a.length - 1
              ? 'and ' + item
              : item + ','
            : a.length !== 1
            ? i === a.length - 1
              ? 'and ' + item
              : item
            : item
        })
        .join(' ') + '.'

    const created = new Date(createdAt).toLocaleString(
      minerva.settings.dateFormat
    )
    const updated = new Date(updatedAt).toLocaleString(
      minerva.settings.dateFormat
    )

    recordMessage += `\n  ${i + 1}   name: ${name} (${id.substring(
      0,
      8
    )})\n      created at: ${created}\n      type: ${recType}\n      updated: ${updated}\n      connected to ${
      Object.keys(connectedTo).length
    } ${
      Object.keys(connectedTo).length === 1 ? 'record' : 'records'
    }\n\n      properties matched: ${matchingProps}\r\n\n`

    recordMessage += `

    \n`
  })

  return recordMessage
}
