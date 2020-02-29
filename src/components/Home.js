import React, { useState, useContext, useEffect, useRef } from "react";
import { uuidv4 } from "./../utils/misc";

import { Taskbar } from "./Taskbar";
import { Topbar } from "./Topbar";

import { Window } from "./windows/Window";
import { DataStructure } from "./windows/DataStructure";
import { FileDialog } from "./windows/FileDialog";

import { Console } from "./windows/Console";

import { globalContext } from "./App";

export const Home = () => {
  const { minerva } = useContext(globalContext);
  const [activeWindow, setActiveWindow] = useState(null);
  const [activeWindowId, setActiveWindowId] = useState("default");
  const [activeFileData, setActiveFileData] = useState();

  // windows have two states: minimized and restored
  const [windows, setWindows] = useState(minerva.windows);

  // handle drag / drop events
  const [droppable, setDroppable] = useState(false);

  const showDropZone = () => setDroppable(true);
  const hideDropZone = () => setDroppable(false);

  const [droppedFiles, setDroppedFiles] = useState();
  const allowDrag = e => {
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
  };

  const handleDrop = e => {
    e.stopPropagation();
    e.preventDefault();
    setDroppedFiles(e.dataTransfer.files[0]);
    hideDropZone();
  };

  const handleDragLeave = e => {
    hideDropZone();
  };

  const handleDragOver = e => {
    e.stopPropagation();
    e.preventDefault();
    showDropZone();
  };

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

  useEffect(
    () => {
      if (!activeFileData) return;

      const dia = {
        title: "new file",
        state: "restored",
        stringType: "Window",
        component: "FileDialog",
        componentProps: activeFileData,
        belongsTo: minerva.user.id,
        id: uuidv4(),
        position: {
          x: 100,
          y: 100
        }
      };

      minerva.setWindows([...minerva.windows, dia]);

      setWindows([...minerva.windows]);
    },
    [minerva, activeFileData]
  );

  // #########################################################
  // DEBUG: this hook is ONLY to watch for minerva's record becoming
  // empty during normal operation. if that happens, this hook will throw.
  // this should no longer exist in later versions, because minerva's record
  // will be more robust.
  useEffect(
    () => {
      if (Object.keys(minerva.record).length < 1) {
        console.warn("minerva has lost her memory!!", minerva);
        throw new Error(
          "minerva has no record!! " + JSON.stringify(minerva.record, null, 5)
        );
      }

      // if minerva is okay, then say so -
      console.log("minerva is at peace.", minerva);
    },
    [minerva, minerva.record]
  );
  // #########################################################

  // this is the function that moves the windows around.
  const setPosition = (windowId, newPosition) => {
    if ([newPosition.x, newPosition.y].some(e => Number.isNaN(e)))
      throw new TypeError("invalid parameters to setPosition");

    const newWindows = windows.map(item => {
      return item.id === windowId
        ? {
            ...item,
            position: newPosition
          }
        : item;
    });

    minerva.setWindows(newWindows);

    setWindows([...newWindows]);
  };

  // this is to keep the windows in state synchronized with minerva
  useEffect(() => minerva.setWindows(windows), [windows, minerva]);

  const [mouseOffset, setMouseOffset] = useState([0, 0]);
  const taskBarMenuRef = useRef(null);

  // function that determines the amount to move windows based on mouse position and offset.
  // currently, the mouse offset is a little broken.
  const handleMouseMove = e => {
    if (activeWindow) {
      const { clientX, clientY } = e;

      requestAnimationFrame(() =>
        setPosition(activeWindowId, {
          x: clientX - mouseOffset[0],
          y: clientY - mouseOffset[1]
        })
      );
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

  // object to track how many components there are of a certain type.
  // this is to help react correctly identify components by providing
  // a robust and accurate / change-resistant key to each component
  // in the list.
  const componentCounts = {};

  return (
    <section
      id="window-system"
      onMouseUp={() => {
        setActiveWindow(null);
        setActiveWindowId("");
      }}
      onClick={e => {
        if (e.target !== taskBarMenuRef) setMenuOpen(false);
      }}
      onMouseMove={handleMouseMove}
    >
      <Topbar minerva={minerva} />
      <section
        className={droppable ? "filedrop active" : "filedrop"}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnter={allowDrag}
        id="main-container"
      >
        {windows.map((item, i) => {
          if (item.belongsTo === minerva.user.id) {
            // if item is offscreen, reset.
            // this should maybe change to use the iselementinviewport utility.
            if (
              item.position.x < 0 ||
              item.position.y < 0 ||
              item.position.x > window.innerWidth - 50 ||
              item.position.y > window.innerHeight - 50
            )
              item.position = {
                x: 100,
                y: 100
              };

            // this needs to exist so that the correct component is rendered.
            // this object must contain every type of component that the home
            // screen needs to render, becuase it uses a dynamic component
            // jsx name or whatever it's called. lol
            const typeMap = {
              Console: Console,
              Window: Window,
              DataStructure: DataStructure,
              FileDialog: FileDialog
            };

            const Component = typeMap[item.stringType];

            // flag for active class
            let isActive = "";

            if (item.id === activeWindowId) isActive = "active";

            componentCounts[item.component || item.stringType] =
              componentCounts[item.component || item.stringType] + 1 || 1;

            return (
              <Component
                item={item}
                num={componentCounts[item.component || item.stringType]}
                component={item.component}
                componentProps={item.componentProps}
                setWindows={setWindows}
                windows={windows}
                className={isActive}
                key={`${item.title}-window-${item.id}`}
                setPosition={setPosition}
                setActiveWindowId={setActiveWindowId}
                activeWindowId={activeWindowId}
                setActiveWindow={setActiveWindow}
                setMouseOffset={setMouseOffset}
              />
            );
          }
        })}
      </section>
      <Taskbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        taskBarMenuRef={taskBarMenuRef}
        activeWindow={activeWindow}
        setActiveWindow={setActiveWindow}
        activeWindowId={activeWindowId}
        setActiveWindowId={setActiveWindowId}
        windows={windows}
        setWindows={setWindows}
      />
    </section>
  );
};
