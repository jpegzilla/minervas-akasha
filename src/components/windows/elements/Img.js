import React from "react";
import MediaTagReader from "./utils/MediaTagReader";

// read metadata
export default props => {
  const { src, title, humanSize, mime, setMetadata, onLoad } = props;

  const fileInfo = `title: ${title ||
    "no title provided"}\nsize: ${humanSize}\ntype: ${mime}`;

  const altOnLoad = e => {
    const { naturalHeight, naturalWidth } = e.target;

    const reader = new MediaTagReader(src);
    reader.getFullImageInfo(mime).then(res => {
      if (
        Object.values(res).length === 0 &&
        !res["pixelxdimension"] &&
        !res["pixelydimension"]
      ) {
        res = Object.assign(res, {
          height: naturalHeight,
          width: naturalWidth
        });
      }

      setMetadata(res);
    });
  };

  const onLoadAction = onLoad || altOnLoad;

  return (
    <img
      decoding="async"
      loading="lazy"
      onLoad={onLoadAction}
      src={src}
      title={fileInfo}
      alt={fileInfo}
    />
  );
};
