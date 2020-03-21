import React, { useState, useEffect, useContext } from "react";
import MediaTagReader from "./utils/MediaTagReader";
import { b64toBlob } from "./utils/mediaUtils";

import { globalContext } from "./../../App";

// read metadata
export default props => {
  const {
    src,
    title,
    humanSize,
    mime,
    setMetadata,
    onLoad,
    setLoadingFileData
  } = props;

  const { setStatusMessage, resetStatusText } = useContext(globalContext);

  const [error, setError] = useState(false);
  const [imageData, setImageData] = useState();

  const fileInfo = `title: ${title ||
    "no title provided"}\nsize: ${humanSize}\ntype: ${mime}`;

  useEffect(
    () => {
      setError(false);

      const data = URL.createObjectURL(b64toBlob(src.split(",")[1], mime));

      setImageData(data);
    },
    [fileInfo]
  );

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

  const reportUrl = `https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D%20image%20decoding%20issue%20with%20an%20${mime}%20encoded%20image`;

  return typeof error === "string" ? (
    <span className="image-error" onClick={e => void e.stopPropagation()}>
      there was an issue decoding this image. error message: {error}.{" "}
      <a target="_blank" href={reportUrl}>
        please report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <img
      decoding="async"
      loading="lazy"
      onLoad={e => {
        setLoadingFileData(false);
        setError(false);
        onLoadAction(e);
      }}
      onError={() => {
        setLoadingFileData(false);

        setStatusMessage({
          display: true,
          text: `status: file failed to load: ${title}`,
          type: "warning"
        });

        setTimeout(resetStatusText, 5000);

        setMetadata(false);
        setError(`image format not supported: ${mime}`);
      }}
      src={imageData}
      title={fileInfo}
      alt={fileInfo}
    />
  );
};
