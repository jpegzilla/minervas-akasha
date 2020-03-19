const logErrors = message => {
  const errors =
    JSON.parse(window.localStorage.getItem("minerva_errors")) || null;

  const {
    message: msg,
    filename,
    lineno,
    colno,
    error,
    timeStamp,
    type
  } = message;

  // navigator props to get
  const {
    appName,
    userAgent,
    language,
    platform,
    product,
    productSub,
    onLine
  } = window.navigator;
  const errMsg = { stack: error.stack, message: error.message };

  const { innerHeight, innerWidth, scrollX, scrollY } = window;

  const errorObject = {
    msg,
    filename,
    timeStamp,
    lineno,
    type,
    colno,
    errorWithStack: errMsg,
    screen: { innerHeight, innerWidth, scrollX, scrollY },
    naviagtor: {
      appName,
      userAgent,
      language,
      platform,
      product,
      productSub,
      onLine
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    date: new Date().toString()
  };

  const newError = errors
    ? {
        ...errors,
        [new Date().toISOString()]: errorObject
      }
    : {
        [new Date().toISOString()]: errorObject
      };

  window.localStorage.setItem("minerva_errors", JSON.stringify(newError));
};

window.addEventListener("error", logErrors);

export default logErrors;
