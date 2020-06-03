/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useMemo } from 'react'

import { uuidv4 } from './../utils/misc'
import ToastContext from './ToastContext'
import Toast from './../components/Toast'

export default Component => {
  const WithToastProvider = props => {
    const [toasts, setToasts] = useState([])

    const add = ({ text, duration, type, sound }) => {
      const id = uuidv4()

      setToasts([
        ...toasts,
        {
          id,
          text,
          duration,
          type,
          sound,
          audiomanager: props.initialContext.audiomanager,
        },
      ])
    }

    const remove = id => setToasts(toasts.filter(t => t.id !== id))

    const providerValue = useMemo(() => {
      return { add, remove }
    }, [toasts])

    return (
      <ToastContext.Provider value={providerValue}>
        <Component {...props} />
        <section id='status-message'>
          {toasts.map(t => (
            <Toast
              id={t.id}
              sound={t.sound}
              audiomanager={t.audiomanager}
              type={t.type}
              key={t.id}
              text={t.text}
              duration={t.duration}
              remove={() => remove(t.id)}
            />
          ))}
        </section>
      </ToastContext.Provider>
    )
  }

  return WithToastProvider
}
