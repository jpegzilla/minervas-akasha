import React, { useState, useEffect, useContext, useRef } from "react";
import MediaTagReader from "./utils/MediaTagReader";

import { globalContext } from "./../../App";

export default props => {
  const { src, title, humanSize, mime, setMetadata } = props;
  const { minerva, globalVolume } = useContext(globalContext);

  const audioRef = useRef();

  const { autoplayMedia: shouldAutoplay } = minerva.settings;

  useEffect(
    () => {
      audioRef.current.volume =
        globalVolume.master / 100 || minerva.settings.volume.master / 100;
    },
    [minerva.settings.volume.master, minerva.settings.volume, minerva.settings]
  );

  const [error, setError] = useState(false);

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`;

  useEffect(
    () => {
      setError(false);
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
        setMetadata(false);
        setError(`audio format not supported: ${mime}`);
      }}
      onLoadStart={() => void setError(false)}
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
      controls
      src={data}
      title={fileInfo}
    >
      audio element encountered an error.
    </audio>
  );
};
