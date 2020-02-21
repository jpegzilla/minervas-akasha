import { minerva } from "./../components/App";
import { uuidv4 } from "./misc";

export default class AudioManager {
  constructor() {
    this.ctx = new AudioContext();
    this.sounds = {};
    this.sources = [];
  }

  playFile(file) {}

  play(name) {
    // check settings in minerva.settings
    const id = uuidv4();

    const source = this.ctx.createBufferSource();
    this.sources.push({ name, id, source, state: "running" });
    source.buffer = this.sounds[name];
    source.connect(this.ctx.destination);

    if (this.sources.find(item => item.name === name)) {
      if (this.sources.every(item => item.name === name).state === "running") {
        console.log("sound rejected.", name);
        return;
      }
    }

    source.start();
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

  stop() {}

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
