import React, { useState, useEffect, useContext, useRef } from "react";

import { videoTagSchema } from "./utils/mediaTagSchema";
import { globalContext } from "./../../App";

import PropTypes from "prop-types";

import worker from "./utils/metadataWorker.worker";

const Video = props => {
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
    resetStatusText,
    setStatusMessage
  } = useContext(globalContext);

  const videoRef = useRef();

  const { autoplayMedia: shouldAutoplay } = minerva.settings;

  const [error, setError] = useState(false);
  const [videoData, setVideoData] = useState();

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
        if (message.data.status && message.data.status === "failure") {
          throw new Error(message.data);
        }

        if (typeof message.data === "string") setVideoData(message.data);
      };
    },
    [mime, src, fileInfo]
  );

  useEffect(
    () => {
      videoRef.current.volume =
        globalVolume.master / 100 || minerva.settings.volume.master / 100;
    },
    [globalVolume, videoRef, minerva.settings.volume.master]
  );

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20video%20decoding%20issue%20with%20an%20${mime}%20encoded%20video`;

  // if there is an error, a link to a new issue on minerva's github will be shown with
  // an error message. otherwise, render a video element.
  return typeof error === "string" ? (
    <span className="image-error" onClick={e => void e.stopPropagation()}>
      there was an issue decoding this video. error message: {error}.{" "}
      <a rel="noopener noreferrer" target="_blank" href={reportUrl}>
        please click here to report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <video
      ref={videoRef}
      autoPlay={shouldAutoplay}
      onLoadedData={() => void setLoadingFileData(false)}
      onError={() => {
        setLoadingFileData(false);

        setStatusMessage({
          display: true,
          text: `status: file failed to load: ${title}`,
          type: "warning"
        });

        setTimeout(resetStatusText, 5000);

        setMetadata(false);
        setError(`video format not supported: ${mime}`);
      }}
      onLoadedMetadata={e => {
        const { duration, videoWidth, videoHeight } = e.target;

        e.target.volume = minerva.settings.volume.master / 100;

        videoTagSchema({ duration, videoWidth, videoHeight }).then(tags => {
          setMetadata({ ...tags, type: mime });
        });
      }}
      controls
      type={mime}
      src={videoData}
      title={fileInfo}
    />
  );
};

export default Video;

Video.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  humanSize: PropTypes.string,
  mime: PropTypes.string,
  setMetadata: PropTypes.func,
  setLoadingFileData: PropTypes.func
};
