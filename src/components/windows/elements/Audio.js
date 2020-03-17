import React from "react";
import MediaTagReader from "./utils/MediaTagReader";

export default props => {
  const { src, title, humanSize, mime, setMetadata } = props;

  let fileInfo = `title: ${title}\nsize: ${humanSize}\ntype: ${mime}`;

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
      console.log("unknown audio encoding");
      fileInfo =
        "this file type is unknown. please report this error so I can add support for this file type.";
      break;
  }

  return (
    <audio
      onLoadedMetadata={e => {
        // hand off metadata reading to a worker here
        const metaDataReader = new MediaTagReader(data);

        metaDataReader.getFullAudioInfo(mime).then(res => {
          if (res.status === "success") {
            setMetadata(res.metadata);
          } else setMetadata(res.metadata);
        });
      }}
      controls
      src={url}
      title={fileInfo}
    >
      audio element encountered an error.
    </audio>
  );
};
