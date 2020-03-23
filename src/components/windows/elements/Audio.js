import React, { useState, useEffect, useContext, useRef } from "react";
import MediaTagReader from "./utils/MediaTagReader";
import PropTypes from "prop-types";

import worker from "workerize-loader!./utils/metadataWorker"; // eslint-disable-line import/no-webpack-loader-syntax
import { globalContext } from "./../../App";

export default props => {
  const {
    src,
    title,
    humanSize,
    mime,
    setMetadata,
    setLoadingFileData
  } = props;

  const {
    minerva,
    globalVolume,
    setStatusMessage,
    resetStatusText
  } = useContext(globalContext);

  const audioRef = useRef();

  const { autoplayMedia: shouldAutoplay } = minerva.settings;

  useEffect(
    () => {
      if (audioRef.current)
        audioRef.current.volume =
          globalVolume.master / 100 || minerva.settings.volume.master / 100;
    },
    [minerva.settings.volume.master, minerva.settings.volume, minerva.settings]
  );

  const [error, setError] = useState(false);
  const [audioData, setAudioData] = useState();

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`;

  useEffect(
    () => {
      setError(false);

      const workerInstance = new worker();

      workerInstance.postMessage({
        action: "getObjectUrl",
        src,
        mime
      });

      workerInstance.onmessage = message => {
        console.log(message);
        if (message.data.status && message.data.status === "failure") {
          throw new Error(message.data);
        }

        if (typeof message.data === "string") setAudioData(message.data);
      };
    },
    [fileInfo]
  );

  const data = src;

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20audio%20decoding%20issue%20with%20an%20${mime}%20encoded%20audio%20file`;

  return typeof error === "string" ? (
    <span className="image-error" onClick={e => void e.stopPropagation()}>
      there was an issue decoding this audio. error message: {error}.{" "}
      <a target="_blank" href={reportUrl}>
        please report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <audio
      autoPlay={shouldAutoplay}
      onError={() => {
        setLoadingFileData(false);

        setStatusMessage({
          display: true,
          text: `status: file failed to load: ${title}`,
          type: "warning"
        });

        setTimeout(resetStatusText, 5000);

        setMetadata(false);
        setError(`audio format not supported: ${mime}`);
      }}
      onLoadStart={() => {
        setLoadingFileData(false);
        setError(false);
      }}
      ref={audioRef}
      onLoadedMetadata={e => {
        e.target.volume = minerva.settings.volume.master / 100;
        // hand off metadata reading to a worker here
        const metaDataReader = new MediaTagReader(data);

        metaDataReader.getFullAudioInfo(mime).then(res => {
          if (res.status === "success") {
            setMetadata(res.metadata);
          } else setMetadata(res.metadata);
        });
      }}
      onClick={e => void e.stopPropagation()}
      controls
      src={audioData}
      title={fileInfo}
    >
      audio element encountered an error.
    </audio>
  );
};

Audio.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  humanSize: PropTypes.string,
  mime: PropTypes.string,
  setMetadata: PropTypes.func,
  setLoadingFileData: PropTypes.func
};
