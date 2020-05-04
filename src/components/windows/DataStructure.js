/* eslint react-hooks/exhaustive-deps: off */

import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  Fragment,
  memo
} from "react";

import Img from "./elements/Img";
import Audio from "./elements/Audio";
import Paragraph from "./elements/Paragraph";
import Tag from "./elements/Tag";
import Video from "./elements/Video";
import Notes from "./elements/Notes";
import DataDisplay from "./elements/DataDisplay";
import dataStructureFileParser from "./elements/utils/dataStructureFileParser";
import ConnectionList from "./elements/ConnectionList";

import { uuidv4 } from "./../../utils/misc";
import StructureMap, {
  StructureDescriptions
} from "./../../utils/managers/StructureMap";

import ColorCodes from "../../utils/structures/utils/colorcodes";
import PropTypes from "prop-types";

import { globalContext } from "./../App";

let timeouts = [];

const DataStructure = props => {
  const {
    type,
    structId,
    handleWindowCommand,
    setWindows,
    droppedFiles
  } = props;

  const {
    minerva,
    setStatusMessage,
    setStatusText,
    audiomanager,
    resetStatusText,
    setRenderConList
  } = useContext(globalContext);

  const currentWindow = minerva.windows.find(item => {
    return item.componentProps.structId === structId;
  });

  // if minerva is holding file data, use it here. this happens when a file is loaded
  // by being dragged into the desktop
  const [activeFileData, setActiveFileData] = useState(
    minerva.activeFileData || null
  );

  const [currentFileData, setCurrentFileData] = useState();
  const [deletionStarted, setDeletionStarted] = useState(false);
  const [FileDisplay, setFileDisplay] = useState(false);
  const [ImageDisplay, setImageDisplay] = useState(false);
  const [MetadataDisplay, setMetadataDisplay] = useState(
    currentWindow.componentProps.MetadataDisplay
  );

  const [loadingFileData, setLoadingFileData] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [showImage, setShowImage] = useState(
    currentWindow.componentProps.ImageDisplay === false ? false : true
  );

  const tagRef = useRef();
  const nameRef = useRef();

  const [info, setInfo] = useState(
    minerva.record.records[type].find(item => item.id === structId) || {} || {}
  );

  // watch these to store the visual state of structures in minerva
  useEffect(
    () => {
      const newWindows = minerva.windows.map(item => {
        if (item.componentProps) {
          if (
            item.componentProps.info &&
            item.componentProps.structId === structId
          ) {
            return {
              ...item,
              componentProps: {
                ...item.componentProps,
                MetadataDisplay,
                ImageDisplay: showImage
              }
            };
          }
        }
        return item;
      });

      minerva.setWindows([...newWindows]);
    },
    [minerva, structId, MetadataDisplay, showImage, ImageDisplay]
  );

  // add to minerva's record when first loading new data structure
  useEffect(
    () => {
      // ...add to record

      // if the structure already exists, do not add a new one
      const existingRecord = minerva.record.records[type].find(
        item => item.id === structId
      );

      if (existingRecord) {
        // here's where I check for filedisplay, metadatadisplay, etc. and set their hooks
        setInfo(existingRecord);
        return;
      }

      const Struct = StructureMap[type];

      // create an actual instance of the correct structure to add to the record
      const structToAdd = new Struct(props.info.name || info.name || type, {
        tags: [],
        id: structId,
        connectedTo: {},
        colorCode: new Struct().colorCode,
        accepts: new Struct().accepts,
        connectsTo: new Struct().connectsTo,
        belongsTo: minerva.user.id
      });

      minerva.addToRecord(structId, structToAdd);

      setRenderConList(uuidv4());

      setInfo(structToAdd);

      // in case there is existing file information
      // attached to a record, find it and render it.
      minerva.findFileInRecord(structId).then(e => {
        console.log(structId, e);
        if (e)
          if (e.file) {
            console.log(
              `found a file for record ${structId}, attaching it.`,
              e.file
            );

            setLoadingFileData(true);

            // if there's an image to show, display it.
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
      // parse the file
      dataStructureFileParser(
        droppedFiles,
        setStatusMessage,
        resetStatusText,
        setLoadingFileData,
        setActiveFileData
      );
    },
    [droppedFiles]
  );

  useEffect(
    () => {
      if (activeFileData) {
        console.log("current active file data", activeFileData);

        minerva.activeFileData = null; // remove the file data from minerva, she doesn't need it

        // the image display and metadata needs to reset here.
        // if a file is loaded that has an image attached,
        // such as a song with an album cover, the next time a
        // file is loaded that does not have an image, the image
        // from the last file will remain attached - without these two lines:
        setImageDisplay(false);
        setFileDisplay(false);

        // when new file data is detected, minerva will immediately add the file to the record
        minerva.addFileToRecord(structId, activeFileData, { type });
      }

      // when active file data changes, make sure that the structure ui
      // updates to show the new file data.
      minerva.findFileInRecord(structId).then(e => {
        if (e)
          if (e.file) {
            setLoadingFileData(true);

            console.log(
              `found a file for record ${structId}, attaching it.`,
              e.file
            );

            // if a structure has info attached to it (tags, etc.), then add that
            // info object into the structure's window object inside the window
            // array. data such as the database id and user id are also inserted.
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
                          data: {
                            ...item.componentProps.info.data,
                            dbId: e.id,
                            dbUserId: e.userId
                          }
                        }
                      }
                    };
                  }

                return item;
              });

              // this code 'commits' the new window object and rerenders the windows
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
        const { data, title, humanSize, mime } = currentFileData;

        let type;

        // here I test to figure out what type of file I'm trying to process.
        // currently only audio, video, images, and text are supported.
        if (/audio/gi.test(currentFileData.type)) {
          type = (
            <Audio
              src={data}
              title={title}
              humanSize={humanSize}
              mime={mime}
              setMetadata={setMetadata}
              setLoadingFileData={setLoadingFileData}
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
              setLoadingFileData={setLoadingFileData}
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
              setLoadingFileData={setLoadingFileData}
            />
          );
        }

        if (/text/gi.test(currentFileData.type)) {
          type = (
            <Paragraph
              fullText={currentFileData.data}
              showText={currentFileData.data.substring(0, 300) + "…"}
              title={title}
              humanSize={humanSize}
              mime={mime}
              setMetadata={setMetadata}
            />
          );
        }

        // this will set the file display to the correct element created above based on
        // the file's type.
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

  // when the user wants to connect a record to another one
  const [makingConnection, setMakingConnection] = useState(false);
  const [makingDisconnection, setMakingDisconnection] = useState(false);
  const [connectionOptions, setConnectionOptions] = useState(false);
  const [disconnectionOptions, setDisconnectionOptions] = useState(false);

  // handle connecting a record to another record.
  const handleConnectRecord = () => {
    // find out what the record can actually connect to. all connections are bidirectional
    const canConnectTo = new StructureMap[type]().connectsTo;

    // find all the possible connections, meaning find every structure that this structure
    // 1. can connect to, as defined above
    // 2. is not already connected to.

    const possibleConnections = Object.entries(minerva.record.records)
      .map(([k, v]) => {
        if (canConnectTo.includes(k)) {
          return v;
        } else return false;
      })
      .filter(Boolean)
      .flat(Infinity)
      .filter(item => {
        if (Object.values(item.connectedTo).includes(structId)) return false;
        else return true;
      });

    // set the ui to indicate that a connection can be made
    setMakingConnection(!makingConnection);

    // hide the disconnection menu if it's showing
    setMakingDisconnection(false);

    // set the list of connection options as determined above.
    setConnectionOptions(possibleConnections);
  };

  // when a user wants to disconnect a record from its parent.
  const handleDisconnectRecord = () => {
    // find the "parent" of this child, or the structure that it's connected to.
    // then, get the connectedTo array associated with that structure. this contains
    // the ids of the structures that can be disconnected.
    const currentRecord = minerva.record.records[type].find(
      r => r.id === structId
    );

    // find what the record is connected to
    const possibleDisconnections = currentRecord.connectedTo;

    // set the ui to indicate that a disconnection can be made
    setMakingDisconnection(!makingDisconnection);

    // hide the connection ui if it's showing
    setMakingConnection(false);

    // set the disconnections array to the possible disconnection options.
    setDisconnectionOptions(possibleDisconnections);
  };

  // when user clicks confirm or deny, this is the function that handles the choice
  // to delete or not delete the structure.
  const onDeleteChoice = (e, confirm) => {
    setDeletionStarted(false);

    if (confirm) {
      // remove the appropriate record from minerva and close the window.
      minerva.removeFromRecord(structId, type);
      setRenderConList(uuidv4());
      handleWindowCommand(e, "close");
    }
  };

  // this function names the structure.
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

    nameRef.current.value = "";

    // make windows and connection lists rerender
    setRenderConList(uuidv4());
  };

  const [showTagEditInterface, setShowTagEditInterface] = useState(false);
  const [currentTag, setCurrentTag] = useState();

  // show the tag editing interface when a tag is right clicked,
  // or hide it if it's already showing.
  const editTag = tag => {
    setCurrentTag(tag);
    setShowTagEditInterface(!showTagEditInterface);
  };

  // change the tag color to whatever color the user clicks.
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

    setRenderConList(uuidv4());
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

    setRenderConList(uuidv4());
  };

  const removeTag = tag => {
    if (info.tags) {
      const newTags = info.tags.filter(item => item.name !== tag.name);

      setInfo({ ...info, tags: newTags });

      setRenderConList(uuidv4());
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
              setLoadingFileData={setLoadingFileData}
            />
          );

          const xdata = { ...metadata };
          const { title, humanSize, mime, ext } = currentFileData;

          // delete the unneeded picture data, which is huge and could slow down the website
          delete xdata.pictureData;
          delete xdata.picture.data;

          minerva.record.findRecordByIdAsync(structId).then(item => {
            minerva.editInRecord(structId, type, "data", {
              ...item.data,
              file: { title, humanSize, mime, ext },
              metadata: xdata
            });
          });

          setImageDisplay(component);
        } else {
          const { title, humanSize, mime, ext } = currentFileData;

          minerva.record.findRecordByIdAsync(structId).then(item => {
            minerva.editInRecord(structId, type, "data", {
              ...item.data,
              file: { title, humanSize, mime, ext },
              metadata
            });
          });
        }
      }
    },
    [metadata]
  );

  return (
    <div className="structure-content">
      <div className="structure-left-column">
        <header className="structure-header">
          <p>
            {info.type === info.name ? "untitled data structure" : info.name} -{" "}
            <span
              className="structure-type"
              title={StructureDescriptions[type]}
            >
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

          {loadingFileData ? <div>loading file data...</div> : false}

          {showTagEditInterface && (
            <div className="structure-tag-editor">
              <div className="color-box">
                <ul>
                  {[...Array(Object.values(ColorCodes).length)].map((_c, i) => {
                    const [, v] = Object.entries(ColorCodes)[i];
                    return (
                      <li
                        onClick={() => changeTagColor(v)}
                        key={`${v}-${i}`}
                        className={`color-box-item ${v}`}
                      />
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </header>

        <section className="structure-data">
          <DataDisplay
            currentFileData={currentFileData}
            showImage={showImage}
            FileDisplay={FileDisplay}
            ImageDisplay={ImageDisplay}
            setShowImage={setShowImage}
            MetadataDisplay={MetadataDisplay}
            metadata={metadata}
            setMetadataDisplay={setMetadataDisplay}
            type={type}
            setWindows={setWindows}
            structId={structId}
            connectionOptions={connectionOptions}
            disconnectionOptions={disconnectionOptions}
          />
        </section>

        <section className="structure-controls">
          <div>
            <input
              onKeyDown={e => {
                if (e.key.toLowerCase() === "enter") addName();
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
                if (e.key.toLowerCase() === "enter") addTag();
              }}
              type="text"
              placeholder="add custom tag"
              ref={tagRef}
            />
            <button onClick={addTag}>add tag</button>
          </div>

          <div>
            {deletionStarted ? (
              <Fragment>
                <button
                  className="confirm-button"
                  onClick={e => onDeleteChoice(e, true)}
                >
                  <span>confirm</span>
                </button>
                <button
                  className="deny-button"
                  onClick={e => onDeleteChoice(e, false)}
                >
                  <span>deny</span>
                </button>
              </Fragment>
            ) : (
              <button
                className="delete-button"
                onClick={() => setDeletionStarted(true)}
              >
                <span>delete record</span>
              </button>
            )}
          </div>

          <div>
            {type !== "hypostasis" && (
              <button className="connect-button" onClick={handleConnectRecord}>
                connect record
              </button>
            )}

            <button className="connect-button" onClick={handleDisconnectRecord}>
              disconnect record
            </button>
          </div>
        </section>

        {(makingConnection || makingDisconnection) && (
          <ConnectionList
            connectsTo={new StructureMap[type]().connectsTo}
            structId={structId}
            connectionOptions={connectionOptions}
            disconnectionOptions={disconnectionOptions}
            setDisconnectionOptions={setDisconnectionOptions}
            setConnectionOptions={setConnectionOptions}
            makingConnection={makingConnection}
            uuidv4={uuidv4}
          />
        )}
      </div>
      <div className="structure-right-column">
        {Object.keys(info).length > 0 && <Notes id={structId} />}
      </div>
    </div>
  );
};

export default memo(DataStructure);

DataStructure.propTypes = {
  type: PropTypes.string
};
