/* eslint react-hooks/exhaustive-deps: off */

import React, { useReducer, useEffect, useContext, memo } from "react";

import PropTypes from "prop-types";

import { globalContext } from "./../App";

import worker from "./elements/utils/metadataWorker.worker";

const ImageViewer = props => {
  const { src, alt, id, mime } = props;

  const [state, dispatch] = useReducer(imageViewerReducer, {
    source: null,
    error: false,
    found: false
  });

  const { source, error, found } = state;

  const { minerva, setStatusMessage, resetStatusText } = useContext(
    globalContext
  );

  useEffect(
    () => {
      if (id && found === true) {
        // remove the blob source from the component props. this is done because when the
        // app loads the next time, that blob url will no longer point to anything. it
        // will be replaced by a new one generated from the file stored in indexeddb.
        const newWindows = minerva.windows.map(w => {
          if (w.componentProps.id === id) {
            return {
              ...w,
              componentProps: {
                ...w.componentProps,
                src: false
              }
            };
          } else return w;
        });

        minerva.setWindows([...newWindows]);

        minerva.setApplicationWindows([...minerva.windows]);

        // get the file using the id from the data structure
        getWithId(id);
      }
    },
    [found, id]
  );

  const getWithId = id => {
    // find the file using the data structure's id,
    // and use the retrieved data to construct an object url.
    minerva.findFileInRecord(id).then(res => {
      const workerInstance = new worker();

      workerInstance.postMessage({
        action: "getObjectUrl",
        src: res.file,
        mime
      });

      workerInstance.onmessage = message => {
        if (message.data.status && message.data.status === "failure") {
          throw new Error(message.data);
        }

        if (typeof message.data === "string") {
          dispatch({ type: "source", payload: message.data });
        }
      };
    });
  };

  // this function will run only when the image is first being loaded.
  // all it does is try to find the image by its stored url, and then
  // if it finds out that url doesn't exist, it will find the image
  // within indexeddb.
  useEffect(
    () => {
      if (!found) {
        fetch(src)
          .then(res => res.blob())
          .then(res => {
            if (res) {
              dispatch({ type: "source", payload: src });
              dispatch({ type: "found", payload: true });
            }
          })
          .catch(() => {
            // if no source is found at the specified blob url, then the url is no longer valid.
            // this happens when the page refreshes. so, take the given file id (id) and then
            // use it to find the correct id in the database.
            getWithId(id);
          });
      } else getWithId(id);
    },
    [id, src]
  );

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20image%20decoding%20issue%20with%20an%20${mime}%20encoded%20image`;

  return typeof error === "string" ? (
    <span className="image-error" onClick={e => void e.stopPropagation()}>
      there was an issue decoding this image. error message: {error}.{" "}
      <a rel="noopener noreferrer" target="_blank" href={reportUrl}>
        please click here to report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <section className="image-viewer-window">
      <header className="image-viewer-window-controls">controls</header>
      <div>
        {source ? (
          <img
            src={source}
            alt={alt}
            title={alt}
            onError={event => {
              console.error(event.type, event.message);

              setStatusMessage({
                display: true,
                text: `status: file failed to load: ${alt}`,
                type: "warning"
              });

              setTimeout(resetStatusText, 5000);
              dispatch({
                type: "error",
                payload: `image format not supported: ${mime}`
              });
            }}
          />
        ) : (
          "loading image..."
        )}
      </div>
    </section>
  );
};

export default memo(ImageViewer);

const imageViewerReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case "source":
      return { ...state, source: payload };
    case "error":
      return { ...state, error: payload };
    case "found":
      return { ...state, found: payload };
    default:
      return state;
  }
};

ImageViewer.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  alt: PropTypes.string,
  id: PropTypes.string,
  mime: PropTypes.string
};
