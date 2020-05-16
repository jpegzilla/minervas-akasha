export default (e, options) => {
  const {
    setNoteText,
    textArea,
    textHistory,
    historyIndex,
    // setHistoryIndex,
    runAfterUpdate
  } = options

  const key = e.key.toLowerCase()
  const {
    ctrlKey,
    shiftKey
    // altKey,
    //metaKey
  } = e

  switch (key) {
    case 'tab':
      // insert two spaces into the text field at the cursor position, and then
      // move the cursor directly after the inserted spaces
      e.preventDefault()
      console.log('current textarea value:')
      console.log(e.target.value)

      // if the textarea ref is ready
      if (textArea.current) {
        const el = e.target
        const text = el.value

        const start = el.selectionStart
        const end = el.selectionEnd

        // from where the selection starts to the cursor
        const beforeCursor = text.slice(0, start)
        // from where the selection ends is to the end of the text
        const afterCursor = text.slice(end, text.length)

        const tabChar = '  '

        const newText = beforeCursor + tabChar + afterCursor

        const newCursorPosition = beforeCursor.length + tabChar.length

        setNoteText(newText)

        runAfterUpdate(() => {
          el.selectionStart = newCursorPosition
          el.selectionEnd = newCursorPosition
        })
      }

      break

    case 's':
      if (ctrlKey) {
        // prevent accidentally hitting save and bringing up the dialog to save the entire
        // web page. I hit ctrl+s while typing no matter what out of habit, so I put this
        // in so I can hit save as much as I'd like and not be bothered with the dialog
        // popping up.
        e.preventDefault()
        return false
      }
      break

    case 'z':
      console.log('current history:', textHistory)
      console.log('history index:', historyIndex)

      if (shiftKey && ctrlKey) {
        // redo case
      } else if (ctrlKey) {
        // undo case
      }

      break
    default:
      return
  }
}
