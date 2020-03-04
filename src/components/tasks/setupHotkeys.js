import cheatcode from "./../../utils/cheatcodes";

import keySound from "./../../assets/audio/computer/sine-short.wav";
import audiomanager from "./../../utils/audiomanager";

const m = new audiomanager();
// load key sound into audio manager for typing sound
m.load([{ file: keySound, name: "key" }]);

export default () => {
  const testHotkey = new cheatcode("a, s, d", () => {
    console.log("hotkey working!");
  });

  const sound = new cheatcode("a", () => {
    m.play("key");
  });

  [testHotkey, sound].forEach(c => c.start());
};
