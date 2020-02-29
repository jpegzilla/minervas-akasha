import React, { useEffect, useRef, useState, useContext } from "react";

import { uuidv4 } from "./../../utils/misc";
import PropTypes from "prop-types";

// import { Structure } from "../../utils/structures/structure";
// import { Hypostasis } from "../../utils/structures/hypostasis";
// import { Shard } from "../../utils/structures/shard";
// import { Node } from "../../utils/structures/node";
// import { Grimoire } from "../../utils/structures/grimoire";
// import { Athenaeum } from "../../utils/structures/athenaeum";

import { globalContext } from "./../App";

let timeouts = [];

export const DataStructure = props => {
  const { type } = props;

  const [droppedFiles, setDroppedFiles] = useState();
  const [activeFileData, setActiveFileData] = useState();

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

      if (/text/gi.test(fileMime)) {
        f.text().then(e => {
          console.log(e);
          setActiveFileData({
            text: e,
            title: f.name,
            type: f.type,
            mime: fileMime,
            size: f.size,
            ext: fileExt
          });
        });

        return;
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

  const t = () => {
    setStatusText("");
    setStatusMessage({ display: false, text: "", type: null });
  };

  const clearAll = () => {
    for (let i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    }
  };

  const [info, setInfo] = useState({});
  const [name, setName] = useState();

  const tagRef = useRef();
  const nameRef = useRef();

  const { setStatusMessage, setStatusText, audiomanager } = useContext(
    globalContext
  );

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

    setName(nameRef.current.value);
  };

  const addTag = () => {
    const newTag = { name: tagRef.current.value, color: "red" };

    let errorMessage;

    if (info.taglist && info.taglist.some(e => e.name === newTag.name))
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
      taglist: info.taglist ? [...info.taglist, newTag] : [newTag]
    });

    tagRef.current.value = "";
  };

  return (
    <div className="structure-content">
      <header className="structure-header">
        <h2>
          {name ? name : "untitled data structure"} - {type}
        </h2>
        <ul className="structure-taglist">
          {info.taglist
            ? info.taglist.map(t => {
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

      <section className="structure-data">(data goes here)</section>

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
      </section>
    </div>
  );
};

DataStructure.propTypes = {
  type: PropTypes.string
};