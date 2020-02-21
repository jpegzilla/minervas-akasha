const html5 = () => {};
const localStorage = () => {};

const composedPath = () => {
  if (Object.keys(Event.prototype).includes("composedPath")) {
    return true;
  } else throw "composedPath is not supported in this browser.";
};

const webGL = () => {
  const c = document.createElement("canvas");
  const g = c.getContext("webgl");

  if (g) return true;
  else throw "webGL is not supported in this browser.";
};

const webAudioAPI = () => {
  let context;

  try {
    context = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    context.close();
    return true;
  } catch (err) {
    throw "web audio api is not supported in this browser.";
  }
};

export const checkSupports = () => {
  const toCheck = [composedPath, webAudioAPI, webGL];

  let errors = [];

  toCheck.forEach(item => {
    try {
      return item();
    } catch (err) {
      errors.push(err);
    }
  });

  if (errors.length === 0) {
    return true;
  } else
    throw new Error(
      JSON.stringify({
        errors,
        message: `errors: ${"\n" + errors.join("\n")}`
      })
    );
};
