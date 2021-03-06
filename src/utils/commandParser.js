import add from './commands/add'
import help from './commands/help'
import listrecords from './commands/listrecords'
import find from './commands/find'
import resetrecords from './commands/resetrecords'

export const parseCommand = (command, setWindows, minerva, log) => {
  command = command.toLowerCase()

  const username = minerva.user.name
  const lastCommand = [...log].pop() || {}

  if (lastCommand.request && lastCommand.request === 'confirm') {
    return resetrecords(command, false)
  }

  if (['reset records', 'reset record'].includes(command)) {
    return resetrecords(command, true)
  }

  if (lastCommand.request === 'confirm') {
    resetrecords(command, false)
  }

  if (/^add?(\s|$)/gi.test(command)) return add(command, minerva, setWindows)
  if (/^find?(\s|$)/gi.test(command)) return find(minerva, command)

  switch (command) {
    case 'hello':
    case 'hi':
    case 'hey':
      return 'hello to you too!'
    case username:
      return "that's your name!"
    case 'minerva':
      return "that's my name!"
    case 'list records':
    case 'list record':
    case 'ls':
      return listrecords(minerva)
    case 'help':
    case 'h':
      return help()
    default:
      return false
  }
}
