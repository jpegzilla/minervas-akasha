import { useContext } from 'react'
import ToastContext from './../providers/ToastContext'

export default () => {
  const context = useContext(ToastContext)

  return { add: context.add, remove: context.remove }
}
