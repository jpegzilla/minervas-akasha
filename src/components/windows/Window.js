import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";

import { globalContext } from "./../App";

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
    records,
    component,
    componentProps
  } = props;

  const { minerva } = useContext(globalContext);

  const Component = WindowTypes[component];

  const { title: t, id, state, position } = item;

  // title is set here, replacing spaces with dashes
  // in order to use it as a css class and id
  let title = t.replace(/\s/gi, "-");

  const { x, y } = position;

  const handleMouseDown = (e, bool) => {
    // when mouse is down, make sure that the mouse is not clicking on a window control button.
    if (
      Array.from(document.querySelectorAll(".window-controls-button")).includes(
        e.target
      )
    )
      return;

    setActiveWindowId(id);

    // bool is true if mouse is down, false if mouse is up.
    if (bool) {
      const rect = e.target.getBoundingClientRect();

      // this is to get the position of the cursor
      // relative to the element in the window
      const o = {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      };

      // TODO: come back and un hardcode this
      setMouseOffset([e.clientX - o.left, e.clientY - o.top]);

      // reset offset if mouse is not clicked
    } else setMouseOffset([0, 0]);

    // set active window title
    setActiveWindow(bool ? title : "");
  };

  // handle commands such as minimize and close.
  // event is only passed in in order to prevent bubbling and any default action.
  const handleWindowCommand = (e, command) => {
    e.stopPropagation();
    e.preventDefault();

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
        default:
          throw new Error("something went very wrong");
      }
    } else {
      switch (command) {
        case "close":
          minerva.setWindows([
            ...minerva.windows.filter(w => (w.id === id ? false : true))
          ]);

          // if there's an id present, then remove the file from the record, because a component
          // with an id in componentProps is always going to be using indexeddb to store files.
          if (componentProps.id) {
            minerva.removeFileFromRecord(id);
          }

          setWindows([...minerva.windows]);
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

  const handleDragLeave = () => void setDroppable(false);

  const handleDragOver = e => {
    e.stopPropagation();
    e.preventDefault();
    setDroppable(true);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();

    // currently, dropped files are sent to the datastructure component
    // as only the first dropped file. this may change in the future as
    // I'd like to implement some sort of slideshow thing for images.
    setDroppedFiles(e.dataTransfer.files[0]);
    setDroppable(false);
  };

  // here's where I determine whether or not to allow dropping files on a record.
  // you can only drop files into datastructures with the shard type.
  const droppableWindows = ["DataStructure"];
  const canDropFiles =
    droppableWindows.includes(component) &&
    componentProps &&
    componentProps.type === "shard";

  useEffect(
    () => {
      if (canDropFiles) componentProps.droppedFiles = droppedFiles;
    },
    [canDropFiles, droppedFiles, componentProps.droppedFiles]
  );

  return (
    <div
      onDragOver={canDropFiles ? handleDragOver : undefined}
      onDragLeave={canDropFiles ? handleDragLeave : undefined}
      onDragEnter={canDropFiles ? allowDrag : undefined}
      onDrop={canDropFiles ? handleDrop : undefined}
      style={
        activeWindowId === id
          ? { transform: `translate3d(${x}px, ${y}px, 0)` }
          : { transform: `translate3d(${position.x}px, ${position.y}px, 0)` }
      }
      id={`${title}-window-${id}`}
      className={`${title}-window system-window ${className} ${
        droppable ? "filedrop drop-active" : "filedrop"
      } window-${state}`}
      onClick={() => void setActiveWindowId(id)}
      onMouseUp={e => void handleMouseDown(e, false)}
    >
      <header
        className={`${title}-header`}
        onMouseDown={e => void handleMouseDown(e, true)}
        onMouseUp={e => void handleMouseDown(e, false)}
        onDrag={() => void false}
      >
        <span className="window-title-text">{`${componentProps.type ||
          t} (${num})`}</span>
        <b />
        <span className="window-controls">
          <div
            className="window-controls-min window-controls-button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleWindowCommand(e, { state: "minimized" });
            }}
          >
            -
          </div>
          <div
            className="window-controls-close window-controls-button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleWindowCommand(e, "close");
            }}
          >
            x
          </div>
        </span>
      </header>
      <section className="window-content">
        {
          <Component
            {...componentProps}
            handleWindowCommand={handleWindowCommand}
            records={records}
            setWindows={setWindows}
            droppedFiles={droppedFiles}
          />
        }
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
  records: PropTypes.object,
  component: PropTypes.string,
  componentProps: PropTypes.shape({
    type: PropTypes.string,
    structId: PropTypes.string,
    name: PropTypes.string,
    connectedTo: PropTypes.object,

    colorCode: PropTypes.string,
    accepts: PropTypes.array,
    belongsTo: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    info: PropTypes.shape({
      id: PropTypes.string,
      connectedTo: PropTypes.object,
      data: PropTypes.exact({
        file: PropTypes.object,
        notes: PropTypes.string,
        metadata: PropTypes.object,
        dbId: PropTypes.string,
        dbUserId: PropTypes.string
      }),
      name: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.object)
    }),
    droppedFiles: PropTypes.object,
    MetadataDisplay: PropTypes.any,
    ImageDisplay: PropTypes.any
  })
};
