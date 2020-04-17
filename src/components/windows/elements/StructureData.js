import React, { Fragment, useState, useContext, useEffect, memo } from "react";

import PropTypes from "prop-types";
import { uuidv4 } from "./../../../utils/misc";
import { makeStruct } from "./../../../utils/managers/StructureMap";
import { globalContext } from "./../../App";

// this component is the data display part of a DataStructure window
const StructureDataComponent = props => {
  const {
    currentFileData,
    showImage,
    FileDisplay,
    ImageDisplay,
    setShowImage,
    MetadataDisplay,
    metadata,
    setMetadataDisplay,
    type,
    structId,
    disconnectionOptions,
    connectionOptions,
    setWindows
  } = props;

  const { minerva, renderConList } = useContext(globalContext);

  // if the record is one that can contain records (anything that's not a shard)
  // then find out if there are records attached to it.
  const [connections, setConnections] = useState();

  useEffect(
    () => {
      const record = minerva.record.findRecordById(structId);

      if (!record) return;

      const connectedToObjects = Object.values(minerva.record.records)
        .flat(Infinity)
        .filter(item => Object.keys(record.connectedTo).includes(item.id));

      setConnections(connectedToObjects);
    },
    [
      minerva.record,
      renderConList,
      type,
      disconnectionOptions,
      structId,
      connectionOptions,
      minerva.record.records
    ]
  );

  // if this is not a structure that needs to contain data / files, then return an interface
  // that is not meant to contain files, but a list of stored structures.
  if (type !== "shard") {
    return connections ? (
      <ul className="datastructure-connection-list">
        {connections.map(rec => {
          const { id, tags, name, createdAt, updatedAt, type } = rec;

          const created = new Date(createdAt).toLocaleDateString(
            minerva.settings.dateFormat
          );

          const updated = new Date(updatedAt).toLocaleDateString(
            minerva.settings.dateFormat
          );

          const tagString = tags.map(t => t.name).join(", ");

          // title just to help identify what's in the stored structure
          const title = `name: ${name}\ntype: ${type}\ncreated on ${created}\nupdated on ${updated}\ntags: ${tagString}`;

          // this is to determine what should be displayed in the connection list
          const record = minerva.record.findRecordById(structId);
          const connectsTo = record.connectsTo;

          if (rec.type === connectsTo) return false;

          return (
            <li
              onDoubleClick={e => {
                // open the clicked-on record
                e.stopPropagation();

                console.log(rec);

                const handleOpenRecord = item => {
                  // make sure the window isn't already open
                  const foundItem = minerva.windows.find(
                    i =>
                      i.component === "DataStructure" &&
                      i.componentProps.structId === item.id
                  );

                  if (foundItem) return;

                  const itemToOpen = minerva.record.records[item.type].find(
                    i => i.id === item.id
                  );

                  const { id, type } = itemToOpen;

                  const struct = makeStruct(type, id, minerva, uuidv4);

                  minerva.setWindows([...minerva.windows, struct]);

                  setWindows([...minerva.windows]);

                  minerva.setActiveWindowId(id);
                };

                handleOpenRecord(rec);
              }}
              className="datastructure-connection"
              title={title}
              key={id}
            >
              {name}
            </li>
          );
        })}
      </ul>
    ) : (
      "no records"
    );
  }

  // filedisplay is the actual element file that is currently loaded into the structure,
  // such as and <Img> component, an <Audio> component, or a <Video> component.
  // the imagedisplay comes into play when a file has an image attached to it. this
  // usually occurs with audio files that have album covers embedded in them.
  // metadata display is all of the metadata about the file.
  else
    return (
      <Fragment>
        <header>
          {currentFileData
            ? currentFileData.title
            : type === "shard" && "no current file data"}
        </header>
        {FileDisplay && currentFileData ? <div>{FileDisplay}</div> : false}
        {FileDisplay && ImageDisplay ? (
          showImage ? (
            <div className="structure-data-meta-display">
              <p>
                {ImageDisplay ? ImageDisplay : "cannot display image."}
                <span onClick={() => setShowImage(false)}>
                  click to hide image
                </span>
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
                      // if metadata has pictures in it, leave that picture data out.
                      // the picture will be rendered above the metadata anyway.
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

export default memo(StructureDataComponent);

StructureDataComponent.propTypes = {
  currentFileData: PropTypes.object,
  showImage: PropTypes.any,
  FileDisplay: PropTypes.any,
  ImageDisplay: PropTypes.any,
  setShowImage: PropTypes.func,
  MetadataDisplay: PropTypes.any,
  metadata: PropTypes.any,
  type: PropTypes.string,
  structId: PropTypes.string
};
