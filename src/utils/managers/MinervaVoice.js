// import all voice clips
// voice clips that I need to record:

// vowels: a i u e o - done
// consonants: b, d, f, j, k, g, m, p, r, s, t, v, w, y, z

// import vowels
import a from "./../../assets/audio/voice/letters/v4/a.wav";
import i from "./../../assets/audio/voice/letters/v4/i.wav";
import u from "./../../assets/audio/voice/letters/v4/u.wav";
import e from "./../../assets/audio/voice/letters/v4/e.wav";
import o from "./../../assets/audio/voice/letters/v4/o.wav";

// import consonants
import b from "./../../assets/audio/voice/letters/v4/b.wav";
import d from "./../../assets/audio/voice/letters/v4/d.wav";
import f from "./../../assets/audio/voice/letters/v4/f.wav";
import g from "./../../assets/audio/voice/letters/v4/g.wav";
import k from "./../../assets/audio/voice/letters/v4/k.wav";
import m from "./../../assets/audio/voice/letters/v4/m.wav";
import s from "./../../assets/audio/voice/letters/v4/s.wav";
import p from "./../../assets/audio/voice/letters/v4/p.wav";
import r from "./../../assets/audio/voice/letters/v4/r.wav";
import j from "./../../assets/audio/voice/letters/v4/j.wav";
import t from "./../../assets/audio/voice/letters/v4/t.wav";
import v from "./../../assets/audio/voice/letters/v4/v.wav";
import w from "./../../assets/audio/voice/letters/v4/w.wav";
import y from "./../../assets/audio/voice/letters/v4/y.wav";
import z from "./../../assets/audio/voice/letters/v4/z.wav";
import silent from "./../../assets/audio/voice/letters/v4/silent.wav";

import { getRandomInt, getRandomFloat } from "./../misc";

const letters = {
  b: "b",
  c: "k",
  d: "d",
  f: "f",
  h: "f",
  j: "j",
  k: "k",
  g: "g",
  m: "m",
  n: "m",
  p: "p",
  l: "r",
  r: "r",
  s: "s",
  t: "t",
  v: "v",
  q: "k",
  w: "w",
  y: "y",
  z: "z",
  a: "a",
  i: "i",
  u: "u",
  e: "e",
  o: "o",
  x: "s",
  " ": "silent",
  ",": "silent",
  "!": "silent",
  ".": "silent",
  "?": "silent"
};

export default class MinervaVoice {
  constructor(minerva) {
    this.ctx = new AudioContext();
    this.dest = this.ctx.destination;

    this.voiceSamples = [
      { file: a, name: "a" },
      { file: i, name: "i" },
      { file: u, name: "u" },
      { file: e, name: "e" },
      { file: o, name: "o" },
      { file: b, name: "b" },
      { file: d, name: "d" },
      { file: f, name: "f" },
      { file: g, name: "g" },
      { file: k, name: "k" },
      { file: m, name: "m" },
      { file: s, name: "s" },
      { file: p, name: "p" },
      { file: r, name: "r" },
      { file: j, name: "j" },
      { file: t, name: "t" },
      { file: v, name: "v" },
      { file: w, name: "w" },
      { file: y, name: "y" },
      { file: z, name: "z" },
      { file: silent, name: "silent" }
    ];

    this.sources = [];
    this.sounds = {};
    this.minerva = minerva;
  }

  distort(amount = 400, oversample = "4x") {
    if (typeof amount !== "number" || typeof oversample !== "string") {
      throw new TypeError("invalid arguments to MinervaVoice.distort");
    }

    this.distortion = this.ctx.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve(amount);
    this.distortion.oversample = oversample;
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
  play(name, options) {
    const { playbackRate, distortionLevel } = options;
    const source = this.ctx.createBufferSource();
    source.playbackRate.value = playbackRate;
    this.distort(0);

    if (distortionLevel < 0) {
      this.distort(distortionLevel);
    }

    const gainNode = this.ctx.createGain();

    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // add the new audio to the sources, and set it's state to running.
    this.sources.push({ name, source, state: "running" });
    source.buffer = this.sounds[name];

    source.connect(this.ctx.destination);

    // check settings in minerva.settings and set the correct volume here!
    const { voice } = this.minerva.settings.volume;

    gainNode.gain.setValueAtTime(voice / 100, this.ctx.currentTime);

    if (gainNode.gain.value > 0) source.start();

    return new Promise((resolve, _reject) => {
      source.addEventListener("ended", () => {
        resolve(true);
      });
    });
  }

  load(paths) {
    return new Promise((resolve, reject) => {
      // temporary
      if (paths.length === 0) resolve();

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

  say(letter, pitchFactor = 1.09) {
    const pitchLevel =
      (getRandomInt(pitchFactor * 100, pitchFactor * 1.2 * 100) / 100) *
      getRandomFloat(0.775, 1.385);

    this.play(letter, { playbackRate: pitchLevel });
  }

  speak(phrase, pitchFactor = 1.09, distortionFactor = 100) {
    let count = 0;
    const sentence = phrase.toLowerCase();

    let pitchLevel = 1.25; //getRandomInt(pitchFactor, pitchFactor + 1);
    let distLevel = 0; //getRandomInt(distortionFactor, distortionFactor + 200);

    const playLetter = (letter, options) => {
      this.play(letter, options).then(() => {
        if (count !== sentence.length) {
          // randomly change pitch / distortion effects
          pitchLevel =
            (getRandomInt(pitchFactor * 100, pitchFactor * 1.2 * 100) / 100) *
            getRandomFloat(0.775, 1.385);

          const distLevel = getRandomInt(
            distortionFactor,
            distortionFactor + 400
          );

          // if sentence ends in "?" raise the pitchlevel for the last three characters.
          // if sentence ends in "!" lower the pitchlevel for the last three characters, and the
          if (count === sentence.length - 1 || count === sentence.length - 2) {
            if (sentence.endsWith("?")) {
              pitchLevel *= 1.25;
            } else if (sentence.endsWith("!")) {
              pitchLevel *= 0.8;
            }
          }

          console.clear();
          console.log(
            `${count} / ${sentence.length - 1}, ${sentence.substring(count)}`
          );

          // playLetter will call itself recursively until the sentence is complete
          playLetter(letters[sentence[count]], {
            playbackRate: pitchLevel,
            distortionLevel: distLevel
          });

          count++;
        }
      });
    };

    console.log(letters, sentence[count]);

    // play the first letter sound in the sentence when the function is called
    if (count === 0) {
      playLetter(letters[sentence[count]], {
        playbackRate: pitchLevel,
        distortionLevel: distLevel
      });

      count++;
    }
  }

  makeDistortionCurve(amount) {
    let k = typeof amount === "number" ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;

    for (; i < n_samples; ++i) {
      x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    return curve;
  }
}
