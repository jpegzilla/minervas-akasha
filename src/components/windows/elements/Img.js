import React, { useState, useEffect, useContext, useRef } from "react";
import MediaTagReader from "./utils/MediaTagReader";

import { uuidv4 } from "./../../../utils/misc";

import { b64toBlob } from "./utils/mediaUtils";

import PropTypes from "prop-types";
import { globalContext } from "./../../App";

// read metadata
const Img = props => {
  const {
    src,
    title,
    humanSize,
    mime,
    setMetadata,
    onLoad,
    setLoadingFileData
  } = props;

  const imageRef = useRef();

  const { setStatusMessage, resetStatusText, minerva, setWindows } = useContext(
    globalContext
  );

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
    [mime, src, fileInfo]
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

  const handleDoubleClick = () => {
    console.log("opening image viewer");
    const reader = new FileReader();
    let base64;

    fetch(imageData)
      .then(res => res.blob())
      .then(body => {
        reader.readAsDataURL(body);

        reader.addEventListener("load", e => {
          base64 = e.target.result;

          const newImageViewer = {
            title: "image viewer",
            state: "restored",
            stringType: "Window",
            component: "ImageViewer",
            componentProps: {
              src: base64,
              alt: fileInfo
            },
            belongsTo: minerva.user.id,
            id: uuidv4(),
            position: {
              x: 100,
              y: 100
            }
          };

          minerva.setWindows([...minerva.windows, newImageViewer]);

          minerva.setApplicationWindows(minerva.windows);
        });
      });
  };

  return typeof error === "string" ? (
    <span className="image-error" onClick={e => void e.stopPropagation()}>
      there was an issue decoding this image. error message: {error}.{" "}
      <a rel="noopener noreferrer" target="_blank" href={reportUrl}>
        please report this to jpegzilla so she can try to fix it.
      </a>
    </span>
  ) : (
    <img
      decoding="async"
      loading="lazy"
      onDoubleClick={handleDoubleClick}
      ref={imageRef}
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

export default Img;

Img.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  humanSize: PropTypes.string,
  mime: PropTypes.string,
  setMetadata: PropTypes.func,
  setLoadingFileData: PropTypes.func,
  onLoad: PropTypes.func
};
