import cheatcode from "./../../utils/cheatcodes";

export default () => {
  const testHotkey = new cheatcode("a, s, d", () => {
    console.log("hotkey working!");
  });

  [testHotkey].forEach(c => c.start());
};
