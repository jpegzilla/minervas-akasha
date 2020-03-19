/* eslint no-useless-escape: 0 */
// import keySound from "./../assets/audio/computer/sine-small-quiet.wav";
import keySound from "./../assets/audio/computer/sine-short.wav";
import audiomanager from "./audiomanager";

const m = new audiomanager();

// load key sound into audio manager for typing sound
m.load([{ file: keySound, name: "key" }]);

/**
 * hasDatePassed - determines if a given iso-formatted date string has passed
 * the current date
 *
 * @param {string} date iso-formatted date string
 *
 * @returns {boolean} true if date has passed, false if not
 */
export const hasDatePassed = date => {
  const expiresOn = Date.parse(date);
  const currentDate = Date.parse(new Date().toISOString());

  // true if expiry date has been passed
  return expiresOn < currentDate;
};

/**
 * secondsToTime - convert seconds to an hh:mm:ss string
 *
 * @param {number} sec number of seconds to convert
 *
 * @returns {string} an hh:mm:ss string
 */
export const secondsToTime = sec => {
  let totalSeconds = sec;

  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  minutes = String(minutes).padStart(2, "0");
  hours = String(hours).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * bytesToSize - convert a number in bytes to a size with a unit
 *
 * @param {number} bytes number of bytes
 *
 * @returns {string} size with unit
 */
export const bytesToSize = bytes => {
  const sizes = ["bytes", "kb", "mb", "gb", "tb"];

  if (parseInt(bytes) === 0) return "0 bytes";

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return `${Math.round(bytes / Math.pow(1024, i), 2)}${sizes[i]}`;
};

/**
 * str2ab - converts a string to an array buffer.
 *
 * @param {string} str string to convert.
 *
 * @returns {ArrayBuffer} a buffer created from the string.
 */
export const str2ab = str => {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);

  for (let i = 0; i < str.length; i++) bufView[i] = str.charCodeAt(i);

  return buf;
};

/**
 * getRandomInt - get a random number from within a range
 *
 * @param {number} min minimum number that can be generated
 * @param {number} max maximum number that can be generated
 *
 * @returns {number} a random number within the provided range
 */
export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

/**
 * isElementInViewport - determines whether an element is in the viewport
 *
 * @param {HTMLElement} el the element to find in the viewport
 *
 * @returns {boolean} true if element is in view, false if not
 */
export const isElementInViewport = el => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Typist - class for creating typing animations
 */
export class Typist {
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

  scramble(sound = true) {
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890~!@#$%^&*";

    // random char from a string or array of strings
    const getRandomChar = chars => {
      return chars[getRandomInt(0, chars.length)];
    };

    let i = 0;

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
        clearInterval(typer);
      }

      i++;
    }, this.delay);
  }
}

/**
 * uuidv4 - generate a universally unique identifier under the version four spec
 *
 * @returns {string} a valid uuidv4
 */
export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    let r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * validateUUIDv4 - validate a uuidv4 for minerva's purposes.
 *
 * @param {string} id id string to validate.
 *
 * @returns {boolean} true if valid, false otherwise.
 */
export const validateUUIDv4 = id => {
  const uuidV4Regex = /^(?:[a-zA-Z0-9]{8}-(?:[a-zA-Z0-9]{4}-){3}[a-zA-Z0-9]{12})$/gi;

  return uuidV4Regex.test(id);
};

/**
 * stringSort - sort array by strings, alphabetically
 *
 * @param {array} arr  array to sort
 * @param {boolean} asc  sort strings ascending or descending
 * @param {string} prop property key to sort by if sorting array of objects
 *
 * @returns {array} sorted array
 */
export const stringSort = (arr, asc, prop) => {
  if (prop)
    return arr.sort(
      (a, b) =>
        asc ? a[prop].localeCompare(b[prop]) : b[prop].localeCompare(a[prop])
    );
  else
    return arr.sort((a, b) => (asc ? a.localeCompare(b) : b.localeCompare(a)));
};

/**
 * mobilecheck - checks to see if the current device is a mobile device
 *
 * @returns {boolean} true if the device is a mobile device, false if not.
 */
export const mobilecheck = () => {
  let a = !1,
    b = navigator.userAgent || navigator.vendor || window.opera;
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      b
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      b.substr(0, 4)
    )
  )
    a = !0;
  return a;
};
