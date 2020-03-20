const logErrors = (message, rethrown = null) => {
  if (rethrown) {
    const errorObject = rethrown;

    const errors =
      JSON.parse(window.localStorage.getItem("minerva_errors")) || null;

    const newError = errors
      ? {
          ...errors,
          [new Date().toISOString()]: errorObject
        }
      : {
          [new Date().toISOString()]: errorObject
        };

    window.localStorage.setItem("minerva_errors", JSON.stringify(newError));
  }

  try {
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

    let errMsg;

    if (error === null) {
      console.log(message, "error was null.");

      const { message: msg, filename, error, type } = message;

      errMsg = {
        msg,
        filename: filename || "no filename provided",
        error: error || "no error provided",
        type: type || "error"
      };
    } else {
      errMsg = {
        stack: error.stack || "no stack available",
        message: error.message
      };
    }

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
  } catch (err) {
    logErrors({
      message: "an unknown script error was thrown. the message is included.",
      error: err
    });
  }
};

window.addEventListener("error", logErrors);

export default logErrors;
