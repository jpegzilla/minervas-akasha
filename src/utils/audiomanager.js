import { uuidv4 } from "./misc";

export default class AudioManager {
  constructor() {
    this.ctx = new AudioContext();
    this.sounds = {};
    this.sources = [];
  }

  playFile(file) {}

  play(name) {
    const id = uuidv4();

    const source = this.ctx.createBufferSource();
    const gainNode = this.ctx.createGain();
    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // add the new audio to the sources, and set it's state to running.
    this.sources.push({ name, id, source, state: "running" });
    source.buffer = this.sounds[name];
    source.connect(this.ctx.destination);

    // this is meant to prevent sounds from overlapping.
    // if there is a sound source with the same name as
    // a source that is still playing, the new sound
    // does not play.
    if (this.sources.find(item => item.name === name)) {
      if (this.sources.every(item => item.name === name).state === "running") {
        console.log("sound rejected.", name);
        return;
      }
    }

    // check settings in minerva.settings and set the correct volume here!
    // gainNode.gain.value = minerva.settings.volume
    source.start();

    // whenever a sound stops, it's state is set to stopped, and it is removed
    // from the array of sources. this is to help when detecting sounds that might
    // be inappropriately running at the same time and overlapping.
    source.addEventListener("ended", () => {
      this.sources = this.sources.map(i => {
        if (i.id === id)
          return {
            ...i,
            state: "stopped"
          };
        else return i;
      });

      this.sources.unshift();
      // console.log("sources", this.sources);
    });
  }

  // close the audio manager's audiocontext.
  close() {
    this.ctx.close();
  }

  // this could be used to refresh and reload the sound in the audiomanager's cache,
  // if that were for some reason needed.
  unload() {
    this.sources = {};
  }

  load(paths) {
    return new Promise((resolve, reject) => {
      paths.forEach(async (path, i) => {
        try {
          const res = await fetch(path.file);
          const buf = await res.arrayBuffer();
          await this.ctx.decodeAudioData(buf, buffer => {
            this.sounds[path.name] = buffer;
            if (i === paths.length - 1) resolve(this.sounds);
          });
        } catch (err) {
          console.log({ err });
          reject(err);
        }
      });
    });
  }
}
