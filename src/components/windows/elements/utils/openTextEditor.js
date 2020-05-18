import { uuidv4 } from './../../../../utils/misc'

export default (minerva, initialText) => {
  const id = uuidv4()

  const findWindowAtPosition = xy => {
    const allWindows = Object.values(minerva.windows).flat(Infinity)

    const windowToFind = allWindows.find(
      item => item.position.x === xy && item.position.y === xy
    )

    return windowToFind || false
  }

  let finalPosition = 100

  while (findWindowAtPosition(finalPosition)) {
    finalPosition += 10
  }

  const newTextEditor = {
    title: 'text editor',
    state: 'restored',
    stringType: 'Window',
    component: 'TextEditor',
    componentProps: {
      text: initialText,
      id
    },
    belongsTo: minerva.user.id,
    id,
    position: {
      x: finalPosition,
      y: finalPosition
    }
  }

  minerva.setWindows([...minerva.windows, newTextEditor])

  minerva.setApplicationWindows(minerva.windows)

  // make the new window the active window
  minerva.setActiveWindowId(id)
}
