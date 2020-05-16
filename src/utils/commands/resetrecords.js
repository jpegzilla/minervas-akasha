import { MinervaMethods } from './methods'

export default (command, confirm = true) => {
  if (!confirm) return MinervaMethods.verifyUser(confirm, command)

  return MinervaMethods.verifyUser(confirm, null)
}
