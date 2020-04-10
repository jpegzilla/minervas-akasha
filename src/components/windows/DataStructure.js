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
import { StructureData } from "./elements/StructureData";

import { bytesToSize, uuidv4 } from "./../../utils/misc";
import PropTypes from "prop-types";

import StructureMap, {
  StructureDescriptions
} from "./../../utils/managers/StructureMap";
import ColorCodes from "../../utils/structures/utils/colorcodes";

import { ConnectionList } from "./elements/ConnectionList";

import { globalContext } from "./../App";

let timeouts = [];

const DataStructureComponent = props => {
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
    resetStatusText
  } = useContext(globalContext);

  const currentWindow = minerva.windows.find(item => {
    return item.componentProps.structId === structId;
  });

  const [activeFileData, setActiveFileData] = useState();
  const [currentFileData, setCurrentFileData] = useState();
  const [deletionStarted, setDeletionStarted] = useState(false);
  const [FileDisplay, setFileDisplay] = useState(false);
  const [ImageDisplay, setImageDisplay] = useState(false);
  const [MetadataDisplay, setMetadataDisplay] = useState(
    currentWindow.componentProps.MetadataDisplay === false ? false : true
  );

  const [loadingFileData, setLoadingFileData] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [showImage, setShowImage] = useState(
    currentWindow.componentProps.ImageDisplay === false ? false : true
  );

  const tagRef = useRef();
  const nameRef = useRef();

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
                MetadataDisplay: MetadataDisplay ? true : false,
                ImageDisplay: showImage
              }
            };
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
      // console.log("adding item to record:", type);

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

      const structToAdd = new Struct(type, {
        tags: [],
        id: structId,
        connectedTo: {},
        colorCode: new Struct().colorCode,
        accepts: new Struct().accepts,
        connectsTo: new Struct().connectsTo,
        belongsTo: minerva.user.id
      });

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
      // handle dropped file
      if (!droppedFiles) return;

      console.log("freshly dropped file:", droppedFiles);

      // f is a file object.
      const f = droppedFiles;

      // currently rejects files above 50mb
      if (f.size > 5e7) {
        setStatusMessage({
          display: true,
          text: `status: large files (size >= 50mb) currently not supported.`,
          type: "fail"
        });

        setTimeout(resetStatusText, 6000);

        console.log("very large file detected. rejecting.");

        // instead, possibly set a flag to add the file to the database as a compressed string
        // rather than uncompressed.
        return;
      }

      setLoadingFileData(true);

      // if a file has a certain extension but no mime type, then I will assign
      // one based on the extension.
      let assignedType;
      let fileMime = f.type || "text/plain";
      const fileExt = f.name.slice(f.name.lastIndexOf("."));

      // this is a list of extensions that I think need to be manually assigned mimetypes.
      // it is currently incomplete, and also none of these formats are supported on the
      // web. I may figure out a way to convert them to web-friendly formats in the future.
      const videoExtensions = ["y4m", "mkv", "yuv", "flv"];
      const audioExtensions = ["8svx", "16svx", "bwf"];

      if (videoExtensions.find(item => new RegExp(item, "gi").test(fileExt))) {
        fileMime = `video/${videoExtensions.find(item =>
          new RegExp(item, "gi").test(fileExt)
        )}`;

        assignedType = fileMime;
      } else if (
        audioExtensions.find(item => new RegExp(item, "gi").test(fileExt))
      ) {
        fileMime = `audio/${audioExtensions.find(item =>
          new RegExp(item, "gi").test(fileExt)
        )}`;

        assignedType = fileMime;
      }

      // if file mimetype indicates a text file
      if (/text/gi.test(fileMime)) {
        f.text().then(e => {
          setActiveFileData({
            data: e,
            title: f.name,
            type: fileMime,
            mime: fileMime,
            size: f.size,
            ext: fileExt,
            humanSize: bytesToSize(f.size)
          });
        });

        return;
      }

      if (/audio/gi.test(fileMime)) {
        // function for reading audio only
        const readAudio = file => {
          const reader = new FileReader();

          reader.addEventListener("load", e => {
            const data = e.target.result;

            setActiveFileData({
              data,
              title: f.name,
              type: assignedType || f.type,
              mime: fileMime,
              size: f.size,
              ext: fileExt,
              humanSize: bytesToSize(f.size)
            });
          });

          reader.readAsDataURL(file);
        };

        readAudio(f);
      }

      if (/image/gi.test(fileMime)) {
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

        readImg(f);
      }

      if (/video/gi.test(fileMime)) {
        // function for reading videos only
        const readVideo = file => {
          const reader = new FileReader();

          reader.addEventListener("load", e => {
            setActiveFileData({
              data: e.target.result,
              title: f.name,
              type: assignedType || f.type,
              mime: fileMime,
              size: f.size,
              ext: fileExt,
              humanSize: bytesToSize(f.size)
            });
          });

          reader.readAsDataURL(file);
        };

        readVideo(f);
      }
    },
    [droppedFiles]
  );

  useEffect(
    () => {
      if (activeFileData) {
        console.log("current active file data", activeFileData);

        // the image display and metadata needs to reset here.
        // if a file is loaded that has an image attached,
        // such as a song with an album cover, the next time a
        // file is loaded that does not have an image, the image
        // from the last file will remain attached - without this.
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
                          data: { dbId: e.id, dbUserId: e.userId }
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
  const [render, setRender] = useState(() => {});

  // handle connecting a record to another record.
  const handleConnectRecord = () => {
    // find out what the record can actually connect to. all connections are bidirectional
    const canConnectTo = new StructureMap[type]().connectsTo;

    // find all the possible connections, meaning find every structure that this structure
    // 1. can connect to, as defined above
    // 2. is not already connected to.
    const possibleConnections = minerva.record.records[canConnectTo].filter(
      item => {
        if (Object.values(item.connectedTo).includes(structId)) return false;
        else return true;
      }
    );

    console.log(
      `current list of possible connections for ${structId}`,
      possibleConnections
    );

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

    setWindows([...minerva.windows]);

    nameRef.current.value = "";
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
              setLoadingFileData={setLoadingFileData}
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
                      className={`${v}`}
                    />
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </header>

      <section className="structure-data">
        <StructureData
          currentFileData={currentFileData}
          showImage={showImage}
          FileDisplay={FileDisplay}
          ImageDisplay={ImageDisplay}
          setShowImage={setShowImage}
          MetadataDisplay={MetadataDisplay}
          metadata={metadata}
          setMetadataDisplay={setMetadataDisplay}
          type={type}
          structId={structId}
          connectionOptions={connectionOptions}
          disconnectionOptions={disconnectionOptions}
          render={render}
        />
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
          setRender={setRender}
          uuidv4={uuidv4}
        />
      )}
    </div>
  );
};

export const DataStructure = React.memo(DataStructureComponent);

DataStructure.propTypes = {
  type: PropTypes.string
};
