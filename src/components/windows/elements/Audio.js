import React from "react";
import MediaTagReader from "./utils/MediaTagReader";

export default props => {
  const { src, title, humanSize, mime, setMetadata } = props;

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`;

  const data = src;

  return (
    <audio
      onLoadedMetadata={() => {
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
