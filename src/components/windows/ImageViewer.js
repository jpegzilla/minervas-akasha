import React, { useState, useEffect, useContext } from "react";

import { globalContext } from "./../App";

import worker from "./elements/utils/metadataWorker.worker";

export const ImageViewer = props => {
  const { src, alt, id, mime } = props;

  const [source, setSource] = useState();
  const [error, setError] = useState(false);
  const [found, setFound] = useState(false);

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

        getWithId(id);
      }
    },
    [found, id]
  );

  const getWithId = id => {
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
          setSource(message.data);
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
              setSource(src);
              setFound(true);
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

              setError(`image format not supported: ${mime}`);
            }}
          />
        ) : (
          "loading image..."
        )}
      </div>
    </section>
  );
};
