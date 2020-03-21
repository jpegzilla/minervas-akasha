import React, { useState, useContext, useEffect, Fragment } from "react";

export const StructureData = props => {
  const {
    currentFileData,
    showImage,
    FileDisplay,
    ImageDisplay,
    setShowImage,
    MetadataDisplay,
    metadata,
    setMetadataDisplay
  } = props;

  return (
    <Fragment>
      <header>
        {currentFileData ? currentFileData.title : "no current file data"}
      </header>
      {FileDisplay && currentFileData ? <div>{FileDisplay}</div> : false}
      {FileDisplay && ImageDisplay ? (
        showImage ? (
          <div className="structure-data-meta-display">
            <p onClick={() => setShowImage(false)}>
              {ImageDisplay ? ImageDisplay : "cannot display image."}
              <span>click to hide image</span>
            </p>
          </div>
        ) : (
          <div
            className="structure-data-meta-display"
            onClick={() => setShowImage(true)}
          >
            <span>
              {ImageDisplay ? "click to show image" : "no image to show."}
            </span>
          </div>
        )
      ) : (
        false
      )}
      {FileDisplay ? (
        MetadataDisplay && metadata ? (
          <div className="structure-metadata">
            {typeof metadata === "string" ? (
              <p>{metadata}</p>
            ) : (
              <div className="structure-data-meta-display">
                <ul>
                  {Object.keys(metadata).map((k, i) => {
                    if (["picture", "pictureData", "pictureSize"].includes(k))
                      return false;

                    return (
                      <li title={`${k}: ${metadata[k]}`} key={`${k}-${i}`}>
                        {k}: {metadata[k]}
                      </li>
                    );
                  })}
                </ul>
                <span onClick={() => setMetadataDisplay(false)}>
                  click to hide metadata
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            className="structure-data-meta-display"
            onClick={() => setMetadataDisplay(true)}
          >
            <span>
              {metadata ? "click to show metadata" : "no file metadata"}
            </span>
          </div>
        )
      ) : (
        false
      )}
    </Fragment>
  );
};