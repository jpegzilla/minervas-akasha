import React, { useState, useEffect, useContext, useRef } from "react";

import { videoTagSchema } from "./utils/mediaTagSchema";
import { globalContext } from "./../../App";

export default props => {
  const { src, title, humanSize, mime, setMetadata } = props;
  const { minerva, globalVolume } = useContext(globalContext);

  const videoRef = useRef();

  const { autoplayMedia: shouldAutoplay } = minerva.settings;

  const [error, setError] = useState(false);

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`;

  useEffect(
    () => {
      setError(false);
    },
    [fileInfo]
  );

  useEffect(
    () => {
      videoRef.current.volume =
        globalVolume.master / 100 || minerva.settings.volume.master / 100;
    },
    [minerva.settings.volume.master, minerva.settings.volume, minerva.settings]
  );

  const data = src;

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20video%20decoding%20issue%20with%20an%20${mime}%20encoded%20video`;

  return typeof error === "string" ? (
    <span className="image-error" onClick={e => void e.stopPropagation()}>
      there was an issue decoding this video. error message: {error}.{" "}
      <a target="_blank" href={reportUrl}>
        please report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <video
      ref={videoRef}
      autoPlay={shouldAutoplay}
      onLoadStart={() => void setError(false)}
      onError={() => {
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
      src={data}
      title={fileInfo}
    />
  );
};
