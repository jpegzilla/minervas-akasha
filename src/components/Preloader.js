import React, { useState, useEffect, useContext, useRef } from 'react'
import Typist from './../utils/managers/Typist'
import { globalContext } from './App'
import PropTypes from 'prop-types'

// audio files
import click from './../assets/audio/computer/click-short.wav'
import noise from './../assets/audio/computer/click-noise.wav'
import e_one from './../assets/audio/computer/error-one.wav'
import s_one from './../assets/audio/computer/success-dist.wav'
import s_two from './../assets/audio/computer/success-two.wav'
import k_one from './../assets/audio/computer/keypress-one.wav'
import w_one from './../assets/audio/computer/warn-one.wav'
import su_two from './../assets/audio/computer/startup-two.wav'
import c_one from './../assets/audio/computer/close-one.wav'
import o_one from './../assets/audio/computer/open-one.wav'
import i_one from './../assets/audio/computer/intro.wav'

// tasks
import { setup } from './tasks/setupSfx'

const text = "minerva's akasha."

let panelsActiveFlag = false
let shouldUpdateFlag = true
let winLoadedFlag = false

const setPanelsActive = val => void (panelsActiveFlag = val)

const Preloader = props => {
  const { setWindowLoaded } = props
  const { audiomanager, minervaVoice, minerva } = useContext(globalContext)

  const centerPanel = useRef()

  const [preloaderText, setPreloaderText] = useState('')

  // this is what makes the panels do their animation

  // when the following three are true, then the preloader is complete
  const [audioLoaded, setAudioLoaded] = useState(false) // after this one, set panels to active
  const [voiceLoaded, setVoiceLoaded] = useState(false)
  const [winLoaded, setWinLoaded] = useState(false)

  const [finished, setFinished] = useState(false)

  // on window load, set winloaded to true. both this and
  // audioloaded must be true in order to end the preloader.

  window.addEventListener('load', () => {
    if (shouldUpdateFlag && winLoadedFlag === false) {
      setWinLoaded(true)
      winLoadedFlag = true
    }
  })

  if (centerPanel.current && shouldUpdateFlag) {
    centerPanel.current.addEventListener('animationend', () => {
      if (
        winLoaded === true &&
        finished === true &&
        voiceLoaded === true &&
        audioLoaded === true &&
        shouldUpdateFlag
      ) {
        shouldUpdateFlag = false

        console.log('minerva at loading screen end', minerva)

        setTimeout(() => {
          setWindowLoaded(true)
        }, 500)
      }
    })
  }

  if (minerva.dbReq) {
    minerva.dbReq.addEventListener('success', e => {
      if (e.target instanceof IDBOpenDBRequest) {
        if (shouldUpdateFlag) {
          delete minerva.dbReq
          if (!panelsActiveFlag) {
            setPanelsActive(true)
          } else {
            setFinished(true)
          }
        }
      }
    })
  }

  // scramble the loading screen text.
  useEffect(() => {
    let loadingTypist = new Typist(setPreloaderText, text)
    loadingTypist.scramble(false).then(() => {
      setTimeout(() => {
        let secondTypist = new Typist(setPreloaderText, 'loading...')
        secondTypist.scramble(false)
      }, 1000)
    })

    // load all audio files
    const files = [
      { file: click, name: 'click' },
      { file: noise, name: 'noise' },
      { file: e_one, name: 'e_one' },
      { file: s_one, name: 's_one' },
      { file: s_two, name: 's_two' },
      { file: k_one, name: 'k_one' },
      { file: w_one, name: 'w_one' },
      { file: c_one, name: 'c_one' },
      { file: o_one, name: 'o_one' },
      { file: su_two, name: 'su_two' },
      { file: i_one, name: 'i_one' }
    ]

    // longest running load time is here. must load all these files
    audiomanager
      .load(files)
      .then(() => {
        setAudioLoaded(true)
        if (shouldUpdateFlag) {
          if (!panelsActiveFlag) {
            setPanelsActive(true)
          } else {
            setFinished(true)
          }
        }
      })
      .catch(e => {
        console.log(e)
      })

    // this one is shorter
    minervaVoice
      .load(minervaVoice.voiceSamples)
      .then(() => {
        setVoiceLoaded(true)
        if (shouldUpdateFlag) {
          if (!panelsActiveFlag) {
            setPanelsActive(true)
          } else {
            setFinished(true)
          }
        }
      })
      .catch(e => {
        console.log(e)
      })

    setup(audiomanager)

    return () => {
      console.log('preloader dismounting')
    }
  }, [audiomanager, minervaVoice])

  // TODO: remove this timeout hell
  // setTimeout(() => {
  //   setPanelsActive(true);
  //
  //   setTimeout(() => {
  //     setPreloaderText("complete.");
  //     setTimeout(() => {
  //       if (audioLoaded && winLoaded && voiceLoaded) setFinished(true);
  //       setWindowLoaded(true);
  //     }, 2400);
  //   }, 5500);
  // }, 2000);
  //

  useEffect(() => {
    if (panelsActiveFlag) {
      setTimeout(() => {
        let complete = new Typist(setPreloaderText, 'complete.')
        complete.scramble(false)
      }, 4000)
    }
  }, [])

  return (
    <section
      id='preloader-container'
      className={panelsActiveFlag ? 'active' : 'inactive'}>
      <section id='filters'>
        <div id='crt-overlay' />
      </section>

      <section
        className={
          panelsActiveFlag
            ? 'preloader-background active'
            : 'preloader-background'
        }>
        <div />
        <div />
      </section>
      <section
        className={
          panelsActiveFlag
            ? 'preloader-middleground active'
            : 'preloader-middleground'
        }>
        <div className='preloader-row-top'>{preloaderText}</div>
        <div className='preloader-row-top'>{preloaderText}</div>
        <div className='preloader-row-top'>{preloaderText}</div>
        <div className='preloader-row-middle'>{preloaderText}</div>
        <div ref={centerPanel} className='preloader-row-middle'>
          {preloaderText}
        </div>
        <div className='preloader-row-middle'>{preloaderText}</div>
        <div className='preloader-row-bottom'>{preloaderText}</div>
        <div className='preloader-row-bottom'>{preloaderText}</div>
        <div className='preloader-row-bottom'>{preloaderText}</div>
      </section>
      <section
        className={
          panelsActiveFlag
            ? 'preloader-foreground active'
            : 'preloader-foreground'
        }>
        <div
          className={
            panelsActiveFlag
              ? 'loading-indicator-container active'
              : 'loading-indicator-container'
          }>
          <div className='loading-spinner' />
        </div>
      </section>
    </section>
  )
}

export default Preloader

Preloader.propTypes = {
  setWindowLoaded: PropTypes.func
}
