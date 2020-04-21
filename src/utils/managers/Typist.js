// import keySound from "./../assets/audio/computer/sine-small-quiet.wav";
import keySound from "./../../assets/audio/computer/sine-short.wav";
import audiomanager from "./../audiomanager";
import { getRandomInt } from "./../misc";

const m = new audiomanager();

// load key sound into audio manager for typing sound
m.load([{ file: keySound, name: "key" }]);

/**
 * Typist - class for creating typing animations
 */
export default class Typist {
  constructor(setter, string, delay = 50) {
    this.delay = delay;
    this.setter = setter;
    this.string = string;
    this.complete = false;
  }

  type(sound = true) {
    let i = 0;

    const typer = setInterval(() => {
      if (i < this.string.length) this.setter(this.string.slice(0, i + 1));
      if (i === this.string.length - 1) {
        this.complete = true;
        clearInterval(typer);
      }

      if (sound) m.play("key");
      i++;
    }, this.delay);
  }

  talkType(minerva) {
    let i = 0;

    return new Promise(resolve => {
      const typer = setInterval(() => {
        if (i < this.string.length) this.setter(this.string.slice(0, i + 1));
        if (i === this.string.length - 1) {
          this.complete = true;
          clearInterval(typer);
          resolve();
        }

        // minerva.voice.say(this.string[i]);

        i++;
      }, this.delay);
    });
  }

  scramble(sound = true) {
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890~!@#$%^&*";

    // random char from a string or array of strings
    const getRandomChar = chars => {
      return chars[getRandomInt(0, chars.length)];
    };

    let i = 0;

    return new Promise(resolve => {
      const typer = setInterval(() => {
        const next = i + 1;

        if (i < this.string.length) {
          // this is true if we are at the end of the string.
          const c = this.string.length - 1 === i;

          if (sound) m.play("key");

          // if we are at the end of the string as determined above,
          // return an empty string to avoid adding a random char at
          // the end of the typing process. otherwise, return a random
          // character.
          const a = c ? "" : getRandomChar(chars);

          // pass the string up to this point (plus a random char or an
          // empty string, based on the above two constants) into the
          // state setter function
          this.setter(this.string.slice(0, next) + a);
        }

        if (i === this.string.length) {
          this.complete = true;

          resolve(this.complete);
          clearInterval(typer);
        }

        i++;
      }, this.delay);
    });
  }
}
