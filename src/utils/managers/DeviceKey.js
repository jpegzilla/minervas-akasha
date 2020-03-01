/**
 * DeviceKey - class for generating and verifying keys that are used to authenticate users.
 * this is specifically for when a user wishes to log in and access their data on another
 * device. the user receives their key, and then uses it on the new device.
 */
class DeviceKey {
  constructor(string) {
    this.rawInput = string;
    this.input = string.split("-");
    this.nodash = string.replace(/-/gim, "");
    this.codes = DeviceKey.generateSync(this.nodash);
  }

  /**
   * @static shuffle - shuffles an array.
   *
   * @param {array}   arr          array to be shuffled
   * @param {number} [factor=0.25] factor to shuffle by
   *
   * @returns {string} a completed device key.
   */
  static shuffle(arr, factor = 0.25) {
    if (factor > 1) factor = 1;
    if (factor <= 0) factor = 0.15;

    factor = factor.toFixed(2);

    let curr = arr.length,
      temp,
      r;

    while (curr > 0) {
      r = Math.floor(factor * curr);
      curr--;

      temp = arr[curr];
      arr[curr] = arr[r];
      arr[r] = temp;
    }

    return `${arr.join("-")}.FAC${factor}`;
  }

  static generate(from) {
    return new Promise((resolve, reject) => {
      try {
        const codes = [...Array(6)].map((_item, i, a) => {
          return DeviceKey.shuffle(from.match(/.{1,4}/gim), i / a.length);
        });

        this.output = codes;

        resolve(codes);
      } catch (err) {
        reject(err);
      }
    });
  }

  static generateSync(from) {
    try {
      const codes = [...Array(6)].map((_item, i, a) => {
        return DeviceKey.shuffle(from.match(/.{1,4}/gim), i / a.length);
      });

      this.output = codes;

      return codes;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @static verify - verify a device key.
   *
   * @param {string} key    device key the user is using
   * @param {string} userId id of user who is verifying their key
   *
   * @returns {promise} promise that resolves true if the key is valid,
   * false if not. rejects on error.
   */
  static verify(key, userId) {
    return new Promise((resolve, reject) => {
      try {
        const fac = key.split(/.FAC/)[1];

        const compTo = DeviceKey.shuffle(
          userId.replace(/-/gim, "").match(/.{1,4}/gim),
          fac
        );

        resolve(key === compTo);
      } catch (err) {
        reject(err);
      }
    });
  }

  static verifySync(key, userId) {
    try {
      const fac = key.split(/.FAC/)[1];

      const compTo = DeviceKey.shuffle(
        userId.replace(/-/gim, "").match(/.{1,4}/gim),
        fac
      );

      return key === compTo;
    } catch (err) {
      throw err;
    }
  }
}
