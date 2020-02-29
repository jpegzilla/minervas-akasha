import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { WindowTypes } from "./WindowTypes";

export const Window = props => {
  const {
    windows,
    setActiveWindow,
    setActiveWindowId,
    item,
    setMouseOffset,
    activeWindowId,
    setWindows,
    className,
    num,
    component,
    componentProps
  } = props;

  const Component = WindowTypes[component];

  const { title, id, state, position } = item;

  const { x, y } = position;

  const handleMouseDown = (e, bool) => {
    setActiveWindowId(id);
    if (bool) {
      const rect = e.target.getBoundingClientRect();

      // this is to get the position of the cursor
      // relative to the element in the window
      const o = {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      };

      // TODO: come back and un hardcode this
      setMouseOffset([e.clientX - o.left, e.clientY - o.top + 30]);

      // reset offset if mouse is not clicked
    } else setMouseOffset([0, 0]);

    // set active window title
    setActiveWindow(bool ? title : "");
  };

  // handle commands such as minimize, maximize, close
  const handleWindowCommand = (e, command) => {
    e.stopPropagation();

    const { state } = command;

    if (state) {
      switch (state) {
        case "minimized":
          setWindows([
            ...windows.map(w => {
              // set state to minimized, or return the existing window object
              return w.id === id
                ? {
                    ...w,
                    state
                  }
                : w;
            })
          ]);
          return;
        case "maximized":
          setWindows([
            ...windows.map(w => {
              // set state to minimized, or return the existing window object
              return w.id === id
                ? {
                    ...w,
                    state
                  }
                : w;
            })
          ]);
          return;
        default:
          throw new Error("something went very wrong");
      }
    } else {
      switch (command) {
        case "close":
          setWindows([...windows.filter(w => (w.id === id ? false : true))]);
          return;
        default:
          return;
      }
    }
  };

  // handle drag / drop events
  const [droppable, setDroppable] = useState(false);

  const [droppedFiles, setDroppedFiles] = useState();

  const allowDrag = e => {
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
  };

  const handleDragLeave = () => setDroppable(false);

  const handleDragOver = e => {
    e.stopPropagation();
    e.preventDefault();
    setDroppable(true);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    console.log("drop event on window: ", item, e.dataTransfer.files[0]);
    setDroppedFiles(e.dataTransfer.files[0]);
    setDroppable(false);
  };

  useEffect(
    () => {
      componentProps.droppedFiles = droppedFiles;
    },
    [droppedFiles, componentProps.droppedFiles]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={allowDrag}
      onDrop={handleDrop}
      style={
        activeWindowId === id
          ? { transform: `translate3d(${x}px, ${y}px, 0)` }
          : { transform: `translate3d(${position.x}px, ${position.y}px, 0)` }
      }
      id={`${title}-window-${id}`}
      className={`${title}-window system-window ${className} ${
        droppable ? "filedrop drop-active" : "filedrop"
      } window-${state}`}
      onClick={() => {
        setActiveWindowId(id);
      }}
      onMouseUp={e => handleMouseDown(e, false)}
    >
      <header
        className={`${title}-header`}
        onMouseDown={e => handleMouseDown(e, true)}
        onMouseUp={e => handleMouseDown(e, false)}
      >
        <span>{`${componentProps.type || title} (${num})`}</span>
        <b />
        <span className="window-controls">
          <div
            className="window-controls-min"
            onClick={e => handleWindowCommand(e, { state: "minimized" })}
          >
            -
          </div>
          <div
            className="window-controls-close"
            onClick={e => handleWindowCommand(e, "close")}
          >
            x
          </div>
        </span>
      </header>
      <section className="window-content">
        {<Component {...componentProps} />}
      </section>
    </div>
  );
};

Window.propTypes = {
  windows: PropTypes.array,
  setActiveWindow: PropTypes.func,
  setActiveWindowId: PropTypes.func,
  item: PropTypes.object,
  setMouseOffset: PropTypes.func,
  activeWindowId: PropTypes.string,
  setWindows: PropTypes.func,
  className: PropTypes.string,
  num: PropTypes.number,
  component: PropTypes.string,
  componentProps: PropTypes.object
};