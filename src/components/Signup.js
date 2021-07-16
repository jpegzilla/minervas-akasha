import React, { useState, useEffect, useRef, useContext, memo } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Minerva, MinervaArchive } from './../utils/managers/Minerva'
import PropTypes from 'prop-types'
import { uuidv4 } from './../utils/misc'
import Typist from './../utils/managers/Typist'
import { globalContext } from './App'
import bcrypt from 'bcryptjs'
import useToast from './../hooks/useToast'
import exportWorker from './../utils/managers/workers/export.worker'

// text for when the form is complete or incomplete
const text = {
  pre: 'incomplete...',
  post: 'enter',
}

// container for all timeouts. this way, if all timeouts need to be cleared,
// I can loop through this array to clear them all.
let timeouts = []

const SignupComponent = props => {
  const { loginScreenInstead, routeProps } = props
  const toast = useToast()

  const { location } = routeProps
  const [droppedFiles, setDroppedFiles] = useState()
  const clearAll = () => timeouts.forEach(t => clearTimeout(t))

  const [finished, setFinished] = useState(false)
  const [userValid, setUserValid] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)
  const [confirmValid, setConfirmValid] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [allValid, setAllValid] = useState(false)

  const [shake, setShake] = useState(false)
  const [enterText, setEnterText] = useState('')

  // if fields are valid, write the confirmation text. if not, write the denial text.
  useEffect(() => {
    if (!allValid) {
      new Typist(setEnterText, text.pre).scramble()
    } else {
      new Typist(setEnterText, text.post).scramble()
    }
  }, [allValid])

  const { minerva, audiomanager } = useContext(globalContext)

  // error function that just shakes the form and plays an error sound
  const shakeAnim = (type = 'error') => {
    if (shake) setShake(false)

    if (type === 'warn') audiomanager.play('w_one')
    if (type === 'error') audiomanager.play('e_one')

    setShake(true)

    setTimeout(() => setShake(false), 250)
  }

  // if this page has been reached from somewhere where the intro sound should not play,
  // location.state.playaudio will be false. this prevents the intro sound from playing.
  useEffect(() => {
    if (location.state) if (!location.state.playaudio) return

    audiomanager.play('i_one')
  }, [audiomanager, location.state])

  // determine whether all fields are valid or not.
  useEffect(() => {
    if (userValid && passwordValid && confirmValid) setAllValid(true)
    else if (userValid && passwordValid && loginScreenInstead) setAllValid(true)
    else setAllValid(false)
  }, [loginScreenInstead, userValid, passwordValid, confirmValid])

  const passwordInput = useRef(null)
  const usernameInput = useRef(null)

  const onSubmitForm = e => {
    e.preventDefault()

    if (e.repeat) return

    let shouldSubmit

    if (loginScreenInstead) shouldSubmit = userValid && passwordValid
    else shouldSubmit = userValid && passwordValid && confirmValid

    if (loginScreenInstead) {
      if (shouldSubmit) {
        // submit form
        // login user
        const user = {
          name: usernameInput.current.value,
          password: passwordInput.current.value,
        }

        minerva.search(user).then(u => {
          console.log(u, user)

          if (!u) {
            toast.add({
              duration: 3000,
              text: 'user does not exist.',
              type: 'fail',
            })

            shakeAnim()
            clearAll()
          } else {
            bcrypt.compare(user.password, u.password, (err, res) => {
              console.log({ err, res })

              if (res) {
                audiomanager.play('s_two')

                // set akashic record with stored data here!!
                // AkashicRecord

                // create user's minerva instance
                minerva.login(u)

                // set minervas_akasha, a key made in order to determine the current
                // signed-in user
                MinervaArchive.set('minervas_akasha', {
                  user: minerva.user,
                  id: minerva.userId,
                })

                setFadeOut(true)

                setTimeout(() => setFinished(true), 500)
              } else {
                toast.add({
                  duration: 3000,
                  text: 'incorrect credentials.',
                  type: 'fail',
                })

                shakeAnim()

                clearAll()
              }
            })
          }
        })
      } else {
        // popup message
        toast.add({
          duration: 3000,
          text: 'please enter a valid username and password.',
          type: 'fail',
        })

        shakeAnim()

        clearAll()
      }
    } else {
      if (shouldSubmit) {
        // submit form if all necessary inputs are valid
        // create new user
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            console.log(err)

            return toast.add({
              duration: 3000,
              text: err,
              type: 'fail',
            })
          }

          bcrypt.hash(passwordInput.current.value, salt, (err, hash) => {
            if (err)
              return toast.add({
                duration: 3000,
                text: err,
                type: 'fail',
              })

            // this object is only created once, on initial signup. it is important that
            // the id and datecreated never change after initial creation.
            const newUser = {
              dateCreated: new Date().toISOString(),
              password: hash,
              id: uuidv4(),
              name: usernameInput.current.value,
            }

            // minerva search in order to make sure the user actually exists
            minerva.search(newUser).then(user => {
              // if user doesn't exist after attempting to sign up
              // (which it should not)
              if (!user) {
                minerva.set(`${newUser.name}`, newUser)

                // create user's minerva instance
                minerva.login(newUser, true)

                audiomanager.play('s_two')

                setFadeOut(true)

                setTimeout(() => {
                  setFinished(true)
                }, 500)
              } else {
                // if user exists in localstorage, warn the user to just go ahead and log in
                toast.add({
                  duration: 6000,
                  text: `that username is taken. if you are ${newUser.name}, please log in!`,
                  type: 'warning',
                })

                shakeAnim('warn')

                clearAll()
              }
            })
          })
        })
      } else {
        // this block is sort of a catch-all for any mistakes the user made in the form
        shakeAnim()

        toast.add({
          duration: 3000,
          text: 'error: invalid form',
          type: 'fail',
        })

        clearAll()
      }
    }
  }

  useEffect(() => {
    if (droppedFiles) {
      // detect if file is a minerva's akasha save file
      console.log(droppedFiles)
      const { name, type } = droppedFiles
      if (name.startsWith('minerva_sd_') || type === 'application/json') {
        const worker = new exportWorker()

        worker.postMessage({ data: droppedFiles, action: 'parse' })

        worker.addEventListener('message', e => {
          console.log(e)
          if (e.data) {
            if (e.data.minerva_file_header === Minerva.fileHeader) {
              setDroppedFiles()

              toast.add({
                duration: 6000,
                text: 'importing data from json file...',
                type: 'warning',
              })

              minerva
                .importDataFromJsonFile(e.data)
                .then(() => {
                  toast.add({
                    duration: 3000,
                    text: 'data successfully imported.',
                    type: 'success',
                  })
                })
                .catch(err => {
                  toast.add({
                    duration: 6000,
                    text: `${err.message}. please report this to jpegzilla.`, // should be a domexception
                    type: 'fail',
                  })
                })

              return
            }
          }
        })
      }
    }
  }, [droppedFiles, minerva, toast])

  const handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    setDroppedFiles(e.dataTransfer.files[0])
  }

  // necessary to prevent the browser from trying to load the file
  const handleDragOver = e => {
    e.stopPropagation()
    e.preventDefault()
  }

  // function that fires on input. validates all fields and plays
  // warnings if input is invalid in some way.
  const manageInput = e => {
    const { name, value } = e.target
    const { value: confirm } = passwordInput.current

    switch (name) {
      case 'username':
        if (value.length >= 3 && !/\s/gi.test(value)) setUserValid(true)

        // detect any spaces in username
        if (/\s/gi.test(value)) {
          shakeAnim('warn')

          toast.add({
            duration: 3000,
            text: 'warning: username cannot contain spaces',
            type: 'warning',
          })

          clearAll()
        } else if (value.length < 3) setUserValid(false)

        break
      case 'password':
        if (value.length >= 8 && !/\s/gi.test(value)) setPasswordValid(true)

        // detect any spaces in password
        if (/\s/gi.test(value)) {
          shakeAnim('warn')

          toast.add({
            duration: 3000,
            text: 'warning: password cannot contain spaces',
            type: 'warning',
          })

          clearAll()
        } else if (value.length < 8) setPasswordValid(false)

        break
      case 'confirm':
        // detect any spaces in confirmation
        if (/\s/gi.test(value)) {
          shakeAnim('warn')

          toast.add({
            duration: 3000,
            text: 'warning: password cannot contain spaces',
            type: 'warning',
          })

          clearAll()
        } else if (value === confirm && confirm.length > 0 && passwordValid)
          setConfirmValid(true)
        else setConfirmValid(false)

        break

      default:
        throw new Error(
          "this error should only show if there were another input on the form that wasn't a username or password input. how did you even get this to happen...?",
        )
    }
  }

  // if finished, and all is good, redirect to the home screen.
  // otherwise, render the signup screen or the login screen
  // depending on the path ('/login' or '/signup').

  if (finished) {
    return (
      <Redirect
        to={{ pathname: '/', state: loginScreenInstead ? 'login' : 'signup' }}
      />
    )
  }

  return (
    <section
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={fadeOut ? 'fadeout' : ''}
      id='login-signup'>
      <section className='spinning-squares'>
        <div />
        <div />
        <div />
        <div />
      </section>

      <section className={shake ? 'shake' : ''} id='form-container'>
        {loginScreenInstead ? (
          <form>
            <div className={userValid ? 'valid' : ''}>
              <input
                ref={usernameInput}
                autoComplete='off'
                onInput={manageInput}
                type='text'
                name='username'
                placeholder='name'
                id='username'
              />
            </div>
            <b>
              <b />
            </b>
            <div className={passwordValid ? 'valid' : ''}>
              <input
                ref={passwordInput}
                autoComplete='current-password'
                onInput={manageInput}
                type='password'
                name='password'
                placeholder='password'
                id='password'
              />
            </div>
            <b>
              <b />
            </b>
            <div>
              <button
                onClick={onSubmitForm}
                className={allValid ? 'valid' : ''}
                type='submit'>
                <span>{enterText}</span>
                <b />
              </button>
            </div>
          </form>
        ) : (
          <form>
            <div className={userValid ? 'valid' : ''}>
              <input
                ref={usernameInput}
                autoComplete='off'
                onInput={manageInput}
                type='text'
                name='username'
                placeholder='name'
                id='username'
              />
            </div>
            <b>
              <b />
            </b>
            <div className={passwordValid ? 'valid' : ''}>
              <input
                ref={passwordInput}
                autoComplete='current-password'
                onInput={manageInput}
                type='password'
                name='password'
                placeholder='password'
                id='password'
              />
            </div>
            <b>
              <b />
            </b>
            <div className={confirmValid ? 'valid' : ''}>
              <input
                onInput={manageInput}
                autoComplete='current-password'
                type='password'
                name='confirm'
                placeholder='confirm password'
                id='confirm-pass'
              />
            </div>
            <b>
              <b />
            </b>
            <div>
              <button
                onClick={onSubmitForm}
                className={allValid ? 'valid' : ''}
                type='submit'>
                <span>{enterText}</span>
                <b />
              </button>
            </div>
          </form>
        )}

        <div className='login-link'>
          <Link to={loginScreenInstead ? '/signup' : '/login'}>
            or {loginScreenInstead ? 'sign up' : 'log in'} here
          </Link>
        </div>
      </section>
    </section>
  )
}

export default memo(SignupComponent)

SignupComponent.propTypes = {
  loginScreenInstead: PropTypes.bool,
  routeProps: PropTypes.object,
}
