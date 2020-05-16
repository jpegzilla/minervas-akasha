export const infoGatherer = () => {
  // get information about the browser's language,
  // user's time zone, etc. so minerva can use appropriate formats

  // attempt to get languages
  const l = navigator.languages
    ? navigator.languages
    : navigator.language || navigator.userLanguage

  const langList = [l].flat(Infinity)

  // get time zone / offset in hours
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone // i.e. america/new_york
  const offset = -(new Date().getTimezoneOffset() / 60) // i.e. -4 (utc offset)

  return {
    languages: langList,
    timeZone,
    utcTimeZone: `utc ${offset}`,
    utcOffset: offset
  }
}
