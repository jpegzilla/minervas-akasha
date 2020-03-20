import React from "react";

import { videoTagSchema } from "./utils/mediaTagSchema";

export default props => {
  const { src, title, humanSize, mime, setMetadata } = props;

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`;

  console.log("in video component", props);

  const data = src;

  return (
    <video
      onLoadedMetadata={e => {
        const { duration, videoWidth, videoHeight } = e.target;

        videoTagSchema({ duration, videoWidth, videoHeight }).then(tags => {
          setMetadata({ ...tags, type: mime });
        });
      }}
      controls
      src={data}
      title={fileInfo}
    />
  );
};
