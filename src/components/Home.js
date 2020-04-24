import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  memo,
  useMemo
} from "react";

import { uuidv4, isEmpty } from "./../utils/misc";
import PropTypes from "prop-types";
import Taskbar from "./Taskbar";
import Topbar from "./Topbar";
import { makeStruct } from "../utils/managers/StructureMap";
import dataStructureFileParser from "./windows/elements/utils/dataStructureFileParser";

import WindowTypes from "./windows/WindowTypes";

import { globalContext } from "./App";
import { hasDatePassed } from "./../utils/dateUtils";

const Home = props => {
  const { routeProps } = props;

  const {
    minerva,
    setStatusText,
    setStatusMessage,
    loggedIn,
    setLoggedIn,
    resetStatusText
  } = useContext(globalContext);

  const [activeWindow, setActiveWindow] = useState(null);
  const [activeWindowId, setActiveWindowId] = useState("default");
  const [activeFileData, setActiveFileData] = useState();
  minerva.setActiveWindowId = setActiveWindowId;

  // windows have two states: minimized and restored
  const [windows, setWindows] = useState(minerva.windows);
  minerva.setApplicationWindows = setWindows;

  // handle drag / drop events
  const [droppable, setDroppable] = useState(false);

  const showDropZone = () => setDroppable(true);
  const hideDropZone = () => setDroppable(false);

  const [droppedFiles, setDroppedFiles] = useState();

  useEffect(
    () => {
      let loginExpired = minerva.get(`user:${minerva.user.id}:token`)
        ? hasDatePassed(minerva.get(`user:${minerva.user.id}:token`).expires)
        : false;

      setLoggedIn(loginExpired ? false : true);
    },
    [minerva, loggedIn, setLoggedIn]
  );

  useEffect(
    () => {
      const t = () => {
        setStatusText("");
        setStatusMessage({ display: false, text: "", type: null });
      };

      if (routeProps.location.state === "signup") {
        setStatusMessage({
          display: true,
          text: "status: signup successful.",
          type: "success"
        });

        setTimeout(t, 3000);
      }

      if (routeProps.location.state === "login") {
        setStatusMessage({
          display: true,
          text: "login complete.",
          type: "success"
        });

        setTimeout(t, 3000);
      }
    },
    [routeProps.location.state, setStatusMessage, setStatusText]
  );

  // handlers for dealing with file drag + drop on desktop
  const allowDrag = e => {
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
  };

  useEffect(
    () => {
      if (droppedFiles) {
        setDroppedFiles();

        dataStructureFileParser(
          droppedFiles,
          setStatusMessage,
          resetStatusText,
          null,
          setActiveFileData
        );
      }
    },
    [droppedFiles, resetStatusText, setStatusMessage]
  );

  // effect that should fire whenever a file is dropped on the desktop
  useEffect(
    () => {
      if (activeFileData) {
        console.log(activeFileData);

        const struct = makeStruct("shard", uuidv4(), minerva, uuidv4, null);

        minerva.activeFileData = activeFileData;

        minerva.setWindows([...minerva.windows, struct]);

        setWindows([...minerva.windows]);
      }
    },
    [activeFileData, minerva]
  );
  // #########################################################
  // DEBUG: this hook is ONLY to watch for minerva's record becoming
  // empty during normal operation. if that happens, this hook will throw.
  // this should no longer exist in later versions, because minerva's record
  // will be more robust.
  useEffect(
    () => {
      if (!minerva.record) {
        console.log(minerva);
        console.log("there is something very wrong. minerva has no record.");
        // throw new Error(
        //   "there is something very wrong. minerva has no record."
        // );
        return;
      } else if (
        Object.keys(minerva.record).length < 1 &&
        minerva.get("logged_in")
      ) {
        minerva.set("logged_in", false);
        console.warn("minerva has lost her memory!!", minerva);
      }

      // if minerva is okay, then say so -
      console.log("minerva is at peace.", minerva);
    },
    [minerva, minerva.record]
  );
  // #########################################################

  // this is to keep the windows in state synchronized with minerva
  useEffect(() => minerva.setWindows(windows), [windows, minerva]);

  const [mouseOffset, setMouseOffset] = useState([0, 0]);
  const taskBarMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);

  // function that determines the amount to move windows based on mouse position and offset.
  // currently, the mouse offset is a little broken.

  // for performance: maybe send the event to a worker to calculate the position?
  const [wait, setWait] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // object to track how many components there are of a certain type.
  // this is to help react correctly identify components by providing
  // a robust and accurate / change-resistant key to each component
  // in the list.
  const componentCounts = {};

  return useMemo(
    () => {
      const handleDrop = e => {
        e.stopPropagation();
        e.preventDefault();
        setDroppedFiles(e.dataTransfer.files[0]);
        hideDropZone();
      };

      const handleDragLeave = () => {
        hideDropZone();
      };

      const handleDragOver = e => {
        e.stopPropagation();
        e.preventDefault();
        showDropZone();
      };

      const handleMouseMove = e => {
        if (!activeWindow) return void false;

        if (activeWindow && !wait) {
          setWait(true);
          const { clientX, clientY } = e;

          const onMouseUp = () => {
            setActiveWindow(null);
            setActiveWindowId("");
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mouseup", onMouseUp, {
            once: true,
            capture: true
          });

          // the offset is off! fix fix fix.
          // from the mdn web documentation of raf():
          // // note: your callback routine must itself call requestAnimationFrame()
          // // if you want to animate another frame at the next repaint.
          const moveWindow = () => {
            setTimeout(() => void setWait(false), 15);
            setPosition(activeWindowId, {
              x: clientX - mouseOffset[0],
              y: clientY - mouseOffset[1]
            });
          };

          requestAnimationFrame(() => {
            // update the window position and immediately request another frame to update again.

            moveWindow();
            requestAnimationFrame(moveWindow);
          });
        }
      };

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

        setWindows([...minerva.windows]);
      };

      return (
        <section
          id="window-system"
          onClick={e => {
            if (e.target !== taskBarMenuRef && e.target !== settingsMenuRef) {
              // e.stopPropagation();
              // e.preventDefault();
              setMenuOpen(false);
              setAddMenuOpen(false);
              setSettingsOpen(false);
            }
          }}
          onMouseMove={handleMouseMove}
        >
          <Topbar
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
            settingsMenuRef={settingsMenuRef}
          />
          <section
            onMouseDown={e => void e.stopPropagation()}
            className={droppable ? "filedrop active" : "filedrop"}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={allowDrag}
            id="main-container"
          >
            {windows.map(item => {
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
                const typeMap = WindowTypes;
                const Component = typeMap[item.stringType];
                // flag for active class
                let isActive = "";
                if (item.id === activeWindowId) isActive = "active";
                // used to determine how to count elements being rendered.
                // counts based on type of component.
                componentCounts[
                  !isEmpty(item.componentProps)
                    ? item.componentProps.type
                    : item.title || item.component
                ] =
                  componentCounts[
                    !isEmpty(item.componentProps)
                      ? item.componentProps.type
                      : item.title || item.component
                  ] + 1 || 1;

                const key = `${item.title}-window-${item.id}`;
                return (
                  <Component
                    item={item}
                    num={
                      componentCounts[
                        !isEmpty(item.componentProps)
                          ? item.componentProps.type
                          : item.title || item.component
                      ]
                    }
                    records={minerva.record.records}
                    component={item.component}
                    componentProps={item.componentProps}
                    setWindows={setWindows}
                    windows={windows}
                    className={isActive}
                    key={key}
                    setPosition={setPosition}
                    setActiveWindowId={setActiveWindowId}
                    activeWindowId={activeWindowId}
                    setActiveWindow={setActiveWindow}
                    setMouseOffset={setMouseOffset}
                  />
                );
              }
              return false;
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
            addMenuOpen={addMenuOpen}
            setAddMenuOpen={setAddMenuOpen}
          />
        </section>
      );
    },
    [
      menuOpen,
      settingsOpen,
      addMenuOpen,
      droppable,
      windows,
      activeWindowId,
      componentCounts,
      activeWindow,
      minerva,
      mouseOffset,
      wait
    ]
  );
};

export default memo(Home);

Home.propTypes = {
  routeProps: PropTypes.object
};
