import { uuidv4 } from './../../utils/misc'
import { makeStruct } from './../../utils/managers/StructureMap'

const { REACT_APP_MINERVA_ADMIN_KEY: ADMIN_KEY } = process.env

// methods that are for use by anyone, including regular users.
export const UserMethods = {
  addStructure(type, name, setWindows, minerva) {
    // add new window to list
    const struct = makeStruct(type, uuidv4(), minerva, uuidv4, name)

    minerva.setWindows([...minerva.windows, struct])

    setWindows([...minerva.windows])
  }
}

// methods that are only for use by the system and privileged users.
export const MinervaMethods = {
  verifyUser(confirm, key) {
    if (confirm)
      return {
        state: 'password',
        request: 'confirm',
        message: 'enter admin key'
      }
    else if (key) {
      return key === ADMIN_KEY
        ? {
            state: 'update',
            message: 'resetting record',
            action: 'reset records'
          }
        : { state: 'error', message: 'invalid key provided.' }
    }
  }
}
