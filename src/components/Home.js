import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  memo,
  useMemo,
  useReducer
} from "react";

import { uuidv4 } from "./../utils/misc";
import PropTypes from "prop-types";
import Taskbar from "./Taskbar";
import Topbar from "./Topbar";
import { makeStruct } from "../utils/managers/StructureMap";
import dataStructureFileParser from "./windows/elements/utils/dataStructureFileParser";

import WindowTypes from "./windows/WindowTypes";

import { globalContext } from "./App";
import { hasDatePassed } from "./../utils/dateUtils";

const HomeComponent = props => {
  const { routeProps } = props;

  const {
    minerva,
    setStatusText,
    setStatusMessage,
    loggedIn,
    setLoggedIn,
    resetStatusText
  } = useContext(globalContext);

  // windows have two states: minimized and restored
  const [windows, setWindows] = useState(minerva.windows);
  minerva.setApplicationWindows = setWindows;

  const [state, dispatch] = useReducer(homeReducer, {
    activeWindow: null,
    activeWindowId: "default",
    activeFileData: null,
    droppable: false,
    droppedFiles: null,
    mouseOffset: [0, 0],
    wait: false,
    menuOpen: false,
    settingsOpen: false,
    addMenuOpen: false
  });

  minerva.setActiveWindowId = id =>
    dispatch({ type: "activeWindowId", payload: id });

  const {
    activeWindow,
    activeWindowId,
    activeFileData,
    droppable,
    droppedFiles,
    mouseOffset,
    wait,
    menuOpen,
    settingsOpen,
    addMenuOpen
  } = state;
  // dispatch({type:"addMenuOpen", payload: false})
  // const [addMenuOpen, setAddMenuOpen] = useState(false);

  const taskBarMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);

  // handle drag / drop events
  const showDropZone = () => dispatch({ type: "droppable", payload: true });
  const hideDropZone = () => dispatch({ type: "droppable", payload: false });

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
      dataStructureFileParser(
        droppedFiles,
        setStatusMessage,
        resetStatusText,
        null,
        data => dispatch({ type: "activeFileData", payload: data })
      );
    },
    [droppedFiles]
  );

  // effect that should fire whenever a file is dropped on the desktop
  useEffect(
    () => {
      if (activeFileData) {
        console.log(activeFileData);

        const struct = makeStruct("shard", uuidv4(), minerva, uuidv4, null);
        console.log(struct);

        minerva.activeFileData = activeFileData;

        minerva.setWindows([...minerva.windows, struct]);

        setWindows([...minerva.windows]);
        // type, id, minerva, uuidv4, name = null
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

  // function that determines the amount to move windows based on mouse position and offset.
  // currently, the mouse offset is a little broken.

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
        dispatch({ type: "droppedFiles", payload: e.dataTransfer.files[0] });
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

      const handleMouseMove = e => {
        if (!activeWindow) return void false;

        if (activeWindow && !wait) {
          dispatch({ type: "wait", payload: true });
          const { clientX, clientY } = e;

          const onMouseUp = () => {
            dispatch({ type: "activeWindow", payload: null });
            dispatch({ type: "activeWindowId", payload: "" });

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
            setTimeout(
              () => void dispatch({ type: "wait", payload: false }),
              15
            );
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
              dispatch({ type: "menuOpen", payload: false });
              dispatch({ type: "addMenuOpen", payload: false });
              dispatch({ type: "settingsOpen", payload: false });
            }
          }}
          onMouseMove={handleMouseMove}
        >
          <Topbar
            settingsOpen={settingsOpen}
            setSettingsOpen={open =>
              dispatch({ type: "settingsOpen", payload: open })
            }
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
                  item.componentProps
                    ? item.componentProps.type
                    : item.component || item.stringType
                ] =
                  componentCounts[
                    item.componentProps
                      ? item.componentProps.type
                      : item.component || item.stringType
                  ] + 1 || 1;
                const key = `${item.title}-window-${item.id}`;
                return (
                  <Component
                    item={item}
                    num={
                      componentCounts[
                        item.componentProps
                          ? item.componentProps.type
                          : item.component || item.stringType
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
                    setActiveWindowId={id =>
                      dispatch({ type: "activeWindowId", payload: id })
                    }
                    activeWindowId={activeWindowId}
                    setActiveWindow={win =>
                      dispatch({ type: "activeWindow", payload: win })
                    }
                    setMouseOffset={offset =>
                      dispatch({ type: "mouseOffset", payload: offset })
                    }
                  />
                );
              }
              return false;
            })}
          </section>
          <Taskbar
            menuOpen={menuOpen}
            setMenuOpen={menuOpen =>
              dispatch({ type: "menuOpen", payload: menuOpen })
            }
            taskBarMenuRef={taskBarMenuRef}
            activeWindow={activeWindow}
            setActiveWindow={win =>
              dispatch({ type: "activeWindow", payload: win })
            }
            activeWindowId={activeWindowId}
            setActiveWindowId={id =>
              dispatch({ type: "activeWindowId", payload: id })
            }
            windows={windows}
            setWindows={setWindows}
            addMenuOpen={addMenuOpen}
            setAddMenuOpen={open =>
              dispatch({ type: "addMenuOpen", payload: open })
            }
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

export default memo(HomeComponent);

const homeReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case "activeWindow":
    case "activeWindowId":
    case "activeFileData":
    case "droppable":
    case "droppedFiles":
    case "mouseOffset":
    case "menuOpen":
    case "wait":
    case "settingsOpen":
    case "addMenuOpen":
      return { ...state, [type]: payload };
    default:
      return;
  }
};

HomeComponent.propTypes = {
  routeProps: PropTypes.object
};
