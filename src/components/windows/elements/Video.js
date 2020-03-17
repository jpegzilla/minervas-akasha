import React from "react";

import { videoTagSchema } from "./utils/mediaTagSchema";

export default props => {
  const { src, title, humanSize, mime, setMetadata } = props;

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`;

  console.log("in video component", props);

  const { enc, data } = src;
  let arr, url, blob;

  switch (enc) {
    case "Float64Array":
      arr = new Float64Array(data);

      blob = new Blob([arr], { type: mime });
      url = window.URL.createObjectURL(blob);

      break;

    case "base64":
      url = data;
      break;

    default:
      console.log("unknown video encoding");
      fileInfo =
        "this file type is unknown. please report this error so I can add support for this file type.";
      break;
  }

  return (
    <video
      onLoadedMetadata={e => {
        const { duration, videoWidth, videoHeight } = e.target;

        videoTagSchema({ duration, videoWidth, videoHeight }).then(tags => {
          setMetadata({ ...tags, type: mime });
        });
      }}
      controls
      src={url}
      title={fileInfo}
    />
  );
};
