import { commandDirectory } from './commandList'

export default () => {
  let helpMessage = `minerva's akasha - command list:


\r\n`

  Object.entries(commandDirectory).forEach(([k, v], i, a) => {
    if (i !== a.length - 1) helpMessage += `  \n${k}: ${v}\r\n`
    else helpMessage += `  \n${k}: ${v}`
  })

  return helpMessage
}
