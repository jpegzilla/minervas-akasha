import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  Fragment
} from "react";

import Img from "./elements/Img";
import Audio from "./elements/Audio";
import Paragraph from "./elements/Paragraph";
import Tag from "./elements/Tag";
import Video from "./elements/Video";

import { uuidv4, bytesToSize, ab2obj } from "./../../utils/misc";
import PropTypes from "prop-types";

import StructureMap, {
  StructureDescriptions
} from "./../../utils/managers/StructureMap";
import ColorCodes from "../../utils/structures/utils/colorcodes";

import { globalContext } from "./../App";

let timeouts = [];

export const DataStructure = props => {
  const {
    type,
    structId,
    handleWindowCommand,
    setWindows,
    droppedFiles
  } = props;

  // const [droppedFiles, setDroppedFiles] = useState();
  const [activeFileData, setActiveFileData] = useState();
  const [currentFileData, setCurrentFileData] = useState();
  const [deletionStarted, setDeletionStarted] = useState(false);
  const [FileDisplay, setFileDisplay] = useState(false);
  const [ImageDisplay, setImageDisplay] = useState(false);
  const [MetadataDisplay, setMetadataDisplay] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [showImage, setShowImage] = useState(true);

  const tagRef = useRef();
  const nameRef = useRef();

  const { minerva, setStatusMessage, setStatusText, audiomanager } = useContext(
    globalContext
  );

  const [info, setInfo] = useState(
    minerva.record.records[type].find(item => item.id === structId) || {}
  );

  // watch these to store the visual state of structures in minerva
  useEffect(
    () => {
      const newWindows = minerva.windows.map(item => {
        if (item.componentProps)
          if (
            item.componentProps.info &&
            item.componentProps.structId === structId
          ) {
            return {
              ...item,
              componentProps: {
                ...item.componentProps,
                MetadataDisplay,
                ImageDisplay
              }
            };
          }
        return item;
      });

      minerva.setWindows([...newWindows]);
    },
    [MetadataDisplay, ImageDisplay]
  );

  // add to minerva's record when first loading new data structure
  useEffect(
    () => {
      // ...add to record
      // console.log("adding item to record:", type);

      // if the structure already exists, do not add a new one
      const existingRecord = minerva.record.records[type].find(
        item => item.id === structId
      );

      if (existingRecord) {
        console.log("exists already");
        // here's where I check for filedisplay, metadatadisplay, etc. and set their hooks
        // appropriately
        setInfo(existingRecord);
        return;
      }

      const Struct = StructureMap[type];

      const structToAdd = new Struct(type, {
        tags: [],
        id: structId,
        connectedTo: [],
        colorCode: new Struct().colorCode,
        accepts: new Struct().accepts,
        belongsTo: minerva.user.id
      });

      console.log(structToAdd);

      minerva.addToRecord(structId, structToAdd);

      // in case there is existing file information
      // attached to a record, find it and render it.
      minerva.findFileInRecord(structId).then(e => {
        if (e)
          if (e.file) {
            console.log(
              `found a file for record ${structId}, attaching it.`,
              e.file
            );

            if (/image/gi.test(e.file.type)) {
              setFileDisplay(e.file);
            }

            setCurrentFileData(e.file);
          }
      });

      setWindows([...minerva.windows]);
    },
    [structId, minerva, setWindows, type]
  );

  useEffect(
    () => {
      // handle dropped file
      if (!droppedFiles) return;

      console.log("freshly dropped file:", droppedFiles);

      const f = droppedFiles;

      if (f.size > 5e7) {
        console.log("very large file detected. rejecting.");
        return;
      }

      const fileMime = f.type || "text/plain";
      const fileExt = f.name.slice(f.name.lastIndexOf("."));

      // if file mimetype indicates a text file
      if (/text/gi.test(fileMime)) {
        f.text().then(e => {
          console.log(e);
          setActiveFileData({
            text: e,
            title: f.name,
            type: f.type,
            mime: fileMime,
            size: f.size,
            ext: fileExt,
            humanSize: bytesToSize(f.size)
          });
        });

        return;
      }

      // function for reading audio only
      const readAudio = file => {
        const reader = new FileReader();

        reader.addEventListener("load", e => {
          const data = e.target.result;

          setActiveFileData({
            data: { enc: "base64", data },
            title: f.name,
            type: f.type,
            mime: fileMime,
            size: f.size,
            ext: fileExt,
            humanSize: bytesToSize(f.size)
          });
        });

        // reader.readAsArrayBuffer(file);
        reader.readAsDataURL(file);
      };

      if (/audio/gi.test(fileMime)) {
        readAudio(f);
      }

      // function for reading images only
      const readImg = file => {
        const reader = new FileReader();

        reader.addEventListener("load", e => {
          setActiveFileData({
            data: e.target.result,
            title: f.name,
            type: f.type,
            mime: fileMime,
            size: f.size,
            ext: fileExt,
            humanSize: bytesToSize(f.size)
          });
        });

        reader.readAsDataURL(file);
      };

      // function for reading videos only
      const readVideo = file => {
        const reader = new FileReader();

        reader.addEventListener("load", e => {
          setActiveFileData({
            data: { enc: "base64", data: e.target.result },
            title: f.name,
            type: f.type,
            mime: fileMime,
            size: f.size,
            ext: fileExt,
            humanSize: bytesToSize(f.size)
          });
        });

        reader.readAsDataURL(file);
      };

      if (/video/gi.test(fileMime)) {
        readVideo(f);
      }

      if (/image/gi.test(fileMime)) {
        readImg(f);
      }
    },
    [droppedFiles]
  );

  useEffect(
    () => {
      if (activeFileData) {
        console.log("current active file data", activeFileData);

        minerva.addFileToRecord(structId, activeFileData, { type });
      }

      // when active file data changes, make sure that the structure ui
      // updates to show the new file data.
      minerva.findFileInRecord(structId).then(e => {
        if (e)
          if (e.file) {
            // console.log(
            //   `found a file for record ${structId}, attaching it.`,
            //   e.file
            // );

            if (info) {
              const newWindows = minerva.windows.map(item => {
                if (item.componentProps)
                  if (
                    item.componentProps.info &&
                    item.componentProps.structId === structId
                  ) {
                    return {
                      ...item,
                      componentProps: {
                        ...item.componentProps,
                        info: {
                          ...info,
                          data: { dbId: e.id, dbUserId: e.userId }
                        }
                      }
                    };
                  }
                return item;
              });

              minerva.setWindows([...newWindows]);
              setWindows([...minerva.windows]);
            }
            setCurrentFileData(e.file);
          }
      });
    },
    [activeFileData, minerva, structId, type]
  );

  // fires when a file is correctly retrieved.
  useEffect(
    () => {
      if (currentFileData) {
        // console.log("new current file data object:", currentFileData);
        const { data, title, humanSize, mime } = currentFileData;

        let type;

        if (/audio/gi.test(currentFileData.type)) {
          type = (
            <Audio
              src={data}
              title={title}
              humanSize={humanSize}
              mime={mime}
              setMetadata={setMetadata}
            />
          );
        }

        if (/video/gi.test(currentFileData.type)) {
          type = (
            <Video
              src={data}
              title={title}
              humanSize={humanSize}
              mime={mime}
              setMetadata={setMetadata}
            />
          );
        }

        if (/image/gi.test(currentFileData.type)) {
          type = (
            <Img
              src={data}
              title={title}
              humanSize={humanSize}
              mime={mime}
              setMetadata={setMetadata}
            />
          );
        }
        if (/text/gi.test(currentFileData.type)) {
          console.log(currentFileData);
          type = (
            <Paragraph
              fullText={currentFileData.text}
              showText={currentFileData.text.substring(0, 300) + "…"}
              title={title}
              humanSize={humanSize}
              mime={mime}
            />
          );
        }

        setFileDisplay(type);
      }
    },
    [currentFileData]
  );

  // function that just clears the status message
  const t = () => {
    setStatusText("");
    setStatusMessage({ display: false, text: "", type: null });
  };

  // function to clear all running timeouts belonging to this component
  const clearAll = () => {
    for (let i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    }
  };

  const handleConnectRecord = () => {
    console.log("connecting record...");
  };

  const handleDisconnectRecord = () => {
    console.log("disconnecting record...");
  };

  // when user clicks confirm or deny, this is the function that handles the choice
  // to delete or not delete the structure.
  const onDeleteChoice = (e, confirm) => {
    setDeletionStarted(false);

    if (confirm) {
      console.log("removing item from record", structId);

      // remove the appropriate record from minerva and close the window.
      minerva.removeFromRecord(structId, type);
      handleWindowCommand(e, "close");
    }
  };

  const addName = () => {
    let errorMessage;

    if (!nameRef.current.value) errorMessage = "cannot set empty name.";

    if (errorMessage) {
      setStatusMessage({
        display: true,
        text: errorMessage,
        type: "fail"
      });

      audiomanager.play("e_one");

      clearAll();
      timeouts.push(setTimeout(t, 3000));

      return;
    }

    // update the name in minerva's record...
    minerva.editInRecord(structId, type, "name", nameRef.current.value);

    // ...then set the name in the ui.
    setInfo({ ...info, name: nameRef.current.value });

    setWindows([...minerva.windows]);

    nameRef.current.value = "";
  };

  const [showTagEditInterface, setShowTagEditInterface] = useState(false);
  const [currentTag, setCurrentTag] = useState();

  const editTag = tag => {
    setCurrentTag(tag);
    setShowTagEditInterface(true);
  };

  const changeTagColor = color => {
    const colorCode = Object.entries(ColorCodes).find(
      item => color === item[1]
    )[0];

    const newTags = info.tags.map(item => {
      if (item.name === currentTag.name) return { ...item, color: colorCode };
      return item;
    });

    setInfo({ ...info, tags: newTags });
    setCurrentTag(null);
    setShowTagEditInterface(false);
  };

  const addTag = () => {
    const newTag = { name: tagRef.current.value, color: "white" };

    let errorMessage;

    if (info.tags && info.tags.some(e => e.name === newTag.name))
      errorMessage = "cannot add duplicate tag.";
    if (!newTag.name) errorMessage = "cannot add empty tags.";

    if (errorMessage) {
      setStatusMessage({
        display: true,
        text: errorMessage,
        type: "fail"
      });

      audiomanager.play("e_one");

      clearAll();
      timeouts.push(setTimeout(t, 3000));

      return;
    }

    setInfo({
      ...info,
      tags: info.tags ? [...info.tags, newTag] : [newTag]
    });

    tagRef.current.value = "";
  };

  const removeTag = (tag, idx) => {
    if (info.tags) {
      console.log("removing", info.tags, tag, idx);

      const newTags = info.tags.filter(item => item.name !== tag.name);

      setInfo({ ...info, tags: newTags });
    }
  };

  // this effect watches the tags array and updates minerva's record
  // whenever it changes. this prevents the two from ever desyncing.
  useEffect(
    () => {
      if (info.tags) {
        if (info) {
          const newWindows = minerva.windows.map(item => {
            if (item.componentProps)
              if (
                item.componentProps.info &&
                item.componentProps.structId === structId
              ) {
                return {
                  ...item,
                  componentProps: {
                    ...item.componentProps,
                    info: {
                      ...info,
                      tags: [...info.tags]
                    }
                  }
                };
              }
            return item;
          });

          minerva.setWindows([...newWindows]);
          setWindows([...minerva.windows]);
        }

        minerva.editInRecord(structId, type, "tags", info.tags);

        setWindows([...minerva.windows]);
      }
    },
    [info.tags, minerva, type, setWindows, structId]
  );

  useEffect(
    () => {
      if (info && minerva.windows) {
        const newWindows = minerva.windows.map(item => {
          if (item.componentProps)
            if (item.componentProps.structId === structId) {
              return {
                ...item,
                componentProps: { ...item.componentProps, info }
              };
            }

          return item;
        });

        minerva.setWindows([...newWindows]);

        setWindows([...minerva.windows]);
      }
    },
    [info, structId, minerva, setWindows]
  );

  useEffect(
    () => {
      if (metadata) {
        if (
          metadata.pictureData &&
          metadata.pictureSize &&
          metadata.picture.data &&
          metadata.picture.format
        ) {
          const f = {
            data: metadata.pictureData,
            title: metadata.picture.description,
            humanSize: metadata.pictureSize,
            mime: metadata.picture.format
          };

          const component = (
            <Img
              src={f.data}
              title={f.title}
              humanSize={f.humanSize}
              mime={f.mime}
              setMetadata={setMetadata}
              onLoad={() => void false}
            />
          );

          const xdata = { ...metadata };
          const { title, humanSize, mime, ext } = currentFileData;

          delete xdata.pictureData;
          delete xdata.picture.data;

          minerva.editInRecord(structId, type, "data", {
            file: { title, humanSize, mime, ext },
            metadata: xdata
          });

          setImageDisplay(component);
        } else {
          const { title, humanSize, mime, ext } = currentFileData;

          minerva.editInRecord(structId, type, "data", {
            file: { title, humanSize, mime, ext },
            metadata
          });
        }
      }
    },
    [metadata]
  );

  return (
    <div className="structure-content">
      <header className="structure-header">
        <p>
          {info.type === info.name ? "untitled data structure" : info.name} -{" "}
          <span className="structure-type" title={StructureDescriptions[type]}>
            {type}
          </span>
        </p>
        <ul className="structure-taglist">
          {info.tags
            ? info.tags.map((t, i) => {
                return (
                  <Tag
                    t={t}
                    i={i}
                    key={`${t.name}-${i}`}
                    removeTag={removeTag}
                    editTag={editTag}
                  />
                );
              })
            : false}
        </ul>

        {showTagEditInterface && (
          <div className="structure-tag-editor">
            <div className="color-box">
              <ul>
                {[...Array(Object.values(ColorCodes).length)].map((c, i) => {
                  const [k, v] = Object.entries(ColorCodes)[i];
                  return (
                    <li
                      onClick={() => changeTagColor(v)}
                      key={`${v}-${i}`}
                      className={`${v}`}
                    >
                      {i}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </header>

      <section className="structure-data">
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
              <span>click to show image</span>
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
              <span>click to show metadata</span>
            </div>
          )
        ) : (
          false
        )}
      </section>

      <section className="structure-controls">
        <div>
          <input
            onKeyDown={e => {
              if (e.which === 13) addName();
            }}
            type="text"
            placeholder="enter a name"
            ref={nameRef}
          />
          <button onClick={addName}>set name</button>
        </div>

        <div>
          <input
            onKeyDown={e => {
              if (e.which === 13) addTag();
            }}
            type="text"
            placeholder="add custom tag"
            ref={tagRef}
          />
          <button onClick={addTag}>add tag</button>
        </div>

        <div>
          <button
            className="delete-button"
            onClick={() => setDeletionStarted(true)}
          >
            delete record
          </button>
          {deletionStarted && (
            <Fragment>
              <button onClick={e => onDeleteChoice(e, true)}>confirm</button>
              <button onClick={e => onDeleteChoice(e, false)}>deny</button>
            </Fragment>
          )}
        </div>

        <div>
          <button className="connect-button" onClick={handleConnectRecord}>
            connect record
          </button>
          <button className="connect-button" onClick={handleDisconnectRecord}>
            disconnect record
          </button>
        </div>
      </section>
    </div>
  );
};

DataStructure.propTypes = {
  type: PropTypes.string
};
