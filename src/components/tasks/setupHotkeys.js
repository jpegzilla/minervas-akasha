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

  [testHotkey].forEach(c => c.start());

  document.addEventListener("keydown", e => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const {
      ctrlKey,
      shiftKey
      // altKey,
      //metaKey
    } = e;

    switch (key) {
      case "c":
        if (ctrlKey && shiftKey) {
          e.preventDefault();
          console.log("command palette opened");
        }

        return;
      default:
        return;
    }
  });
};
