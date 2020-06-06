import paletteCommands from './utils/paletteCommands'
import searchAllRecords from './utils/searchAllRecords'

export default (minerva, searchterm, type = 'any', mime = 'any') => {
  const { prefixes, commands } = paletteCommands

  console.log(minerva.record.records)
  console.log('searching for', searchterm)

  const result = searchAllRecords(
    minerva,
    {
      query: searchterm,
      type: type,
      mime: mime,
    },
    {
      usingMimeOption: mime !== 'any',
      usingTypeOption: type !== 'any',
    }
  )

  console.log(result)

  return result.records
}
