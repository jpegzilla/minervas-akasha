import { uuidv4 } from './misc'
import { Minerva } from './managers/Minerva'

export default class AudioManager {
  constructor(options) {
    this.ctx = new AudioContext()

    // contains sounds loaded via the load function
    this.sounds = {}

    // contains the current playing sounds
    this.sources = []

    // contains minerva's stored settings or the default ones
    this.settings = options ? options.settings : Minerva.defaultSettings
  }

  /**
   * play - play a sound from the instance's currently loaded files.
   *
   * @param {string}   name       name of loaded sound to play.
   * sound names are from the array of loaded sounds in this.sounds
   * @param {object} [options={}] options for playing the sound,
   * such as delay, panning, distortion, and other effects.
   *
   * @returns {undefined} void
   */
  play(name, options = {}) {
    const id = uuidv4()

    const source = this.ctx.createBufferSource()
    const gainNode = this.ctx.createGain()
    source.connect(gainNode)
    gainNode.connect(this.ctx.destination)

    // add the new audio to the sources, and set it's state to running.
    this.sources.push({ name, id, source, state: 'running' })
    source.buffer = this.sounds[name]
    source.connect(this.ctx.destination)

    // this is meant to prevent sounds from overlapping.
    // if there is a sound source with the same name as
    // a source that is still playing, the new sound
    // does not play.
    if (this.sources.find(item => item.name === name)) {
      if (this.sources.every(item => item.name === name).state === 'running') {
        console.log('sound rejected.', name)
        return
      }
    }

    // check settings in minerva.settings and set the correct volume here!
    const { effect } = this.settings.volume

    gainNode.gain.setValueAtTime(effect / 100, this.ctx.currentTime)

    if (gainNode.gain.value > 0) source.start()

    // whenever a sound stops, it's state is set to stopped, and it is removed
    // from the array of sources. this is to help when detecting sounds that might
    // be inappropriately running at the same time and overlapping.
    source.addEventListener('ended', () => {
      this.sources = this.sources.map(i => {
        if (i.id === id)
          return {
            ...i,
            state: 'stopped'
          }
        else return i
      })

      this.sources.unshift()
      // console.log("sources", this.sources);
    })
  }

  // close the audio manager's audiocontext.
  close() {
    this.ctx.close()
  }

  // this could be used to refresh and reload the sound in the audiomanager's cache,
  // if that were for some reason needed.
  unload() {
    this.sources = {}
  }

  /**
   * load - load an array of audio objects that the audiomanager
   * will need to play.
   *
   * @param {array} paths array of objects representing audio to load.
   * objects must take the format `{ file: sound, name: "sound" }`, where
   * `sound` is a reference to an imported sound file. the name can be whatever
   * you'd like.
   *
   * @returns {promise} promise that resolves when all audio loads.
   */
  load(paths) {
    return new Promise((resolve, reject) => {
      paths.forEach(async (path, i) => {
        try {
          const res = await fetch(path.file)
          const buf = await res.arrayBuffer()
          await this.ctx.decodeAudioData(buf, buffer => {
            this.sounds[path.name] = buffer
            if (i === paths.length - 1) resolve(this.sounds)
          })
        } catch (err) {
          console.log({ err })
          reject(err)
        }
      })
    })
  }
}
