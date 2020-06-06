const windowSearch = (minerva, query) => {
  const windows = minerva.windows

  console.log(`searching for ${query}`)
  console.log(windows)

  if (query) {
    const searchResults = windows.filter(w => {
      console.log(w)

      if (w.title.includes(query)) return true

      return false
    })

    return searchResults
  }

  return windows
}

export default windowSearch
