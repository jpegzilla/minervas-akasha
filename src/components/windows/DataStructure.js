import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  Fragment
} from "react";

import { uuidv4, bytesToSize, ab2obj, str2ab } from "./../../utils/misc";
import PropTypes from "prop-types";

import StructureMap from "./../../utils/managers/StructureMap";

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

  const tagRef = useRef();
  const nameRef = useRef();

  const { minerva, setStatusMessage, setStatusText, audiomanager } = useContext(
    globalContext
  );

  const [info, setInfo] = useState(
    minerva.record.records[type].find(item => item.id === structId) || {}
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
        setInfo(existingRecord);
        return;
      }

      const structToAdd = new StructureMap[type](type, {
        tags: [],
        id: structId,
        connectedTo: [],
        colorCode: "white",
        accepts: StructureMap[type].accepts
      });

      minerva.addToRecord(structId, structToAdd);

      setWindows([...minerva.windows]);
    },
    [structId]
  );

  useEffect(
    () => {
      if (activeFileData) {
        console.log("new file data is", activeFileData);
      }
    },
    [activeFileData]
  );

  useEffect(
    () => {
      // handle dropped file
      if (!droppedFiles) return;

      console.log("freshly dropped file:", droppedFiles);

      const f = droppedFiles;

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

      if (/audio/gi.test(fileMime)) {
        f.arrayBuffer().then(e => {
          console.log(e);

          setActiveFileData({
            data: ab2obj(e),
            title: f.name,
            type: f.type,
            mime: fileMime,
            size: f.size,
            ext: fileExt,
            humanSize: bytesToSize(f.size)
          });
        });
      }

      // function for reading images only
      // const readImg = file => {
      //   const reader = new FileReader();
      //
      //   reader.addEventListener("load", () => {
      //     const image = new Image();
      //     // determine what to do with image
      //   });
      //
      //   reader.readAsDataURL(file);
      // };
    },
    [droppedFiles]
  );

  useEffect(
    () => {
      console.log("current active file data", activeFileData);
      minerva.addFileToRecord(structId, activeFileData, { type });

      // when active file data changes, make sure that the structure ui
      // updates to show the new file data.
      minerva.findFileInRecord(structId).then(e => {
        if (e.file) {
          console.log(e.file);
          setCurrentFileData(e.file);
        }
      });
    },
    [activeFileData]
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

  const addTag = () => {
    const newTag = { name: tagRef.current.value, color: "red" };

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

  // this effect watches the tags array and updates minerva's record
  // whenever it changes. this prevents the two from ever desyncing.
  useEffect(
    () => {
      if (info.tags) {
        // console.log("tags", info.tags);

        minerva.editInRecord(structId, type, "tags", info.tags);

        setWindows([...minerva.windows]);
      }
    },
    [info.tags]
  );

  return (
    <div className="structure-content">
      <header className="structure-header">
        <h2>
          {info.type === info.name ? "untitled data structure" : info.name} -{" "}
          {type}
        </h2>
        <ul className="structure-taglist">
          {info.tags
            ? info.tags.map(t => {
                return (
                  <li
                    key={`${t.name}-${uuidv4()}`}
                    className={`structure-tag ${t.color}`}
                  >
                    {t.name}
                  </li>
                );
              })
            : "no tags"}
        </ul>
      </header>

      <section className="structure-data">
        {currentFileData ? currentFileData.title : "no current file data"}
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
        </div>
      </section>
    </div>
  );
};

DataStructure.propTypes = {
  type: PropTypes.string
};
