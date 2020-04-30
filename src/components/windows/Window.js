import React, { useState, useEffect, useContext, memo, useMemo } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";

import { globalContext } from "./../App";

import WindowTypes from "./WindowTypes";

const Window = props => {
  const {
    windows,
    setActiveWindowId,
    item,
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

  const [droppable, setDroppable] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState();

  // handle drag / drop events
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

  return useMemo(
    () => {
      // this is the function that updates the windows' positions in minerva
      const setPosition = (windowId, newPosition) => {
        if ([newPosition.x, newPosition.y].some(e => Number.isNaN(e))) {
          throw new TypeError("invalid parameters to setPosition");
        }

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

      // updates window position in minerva when a window is done being dragged
      const handleStop = (e, data) => {
        console.log(e, data);

        const { x, y } = data;

        setPosition(id, { x, y });
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

      let windowStructid = false;

      if (componentProps.structId) {
        windowStructid = componentProps.structId.substring(0, 8);
      }

      return (
        <Draggable
          handle={".drag-handle"}
          onStop={handleStop}
          onStart={() => void setActiveWindowId(id)}
          defaultPosition={{ x, y }}
        >
          <div
            onDragOver={canDropFiles ? handleDragOver : undefined}
            onDragLeave={canDropFiles ? handleDragLeave : undefined}
            onDragEnter={canDropFiles ? allowDrag : undefined}
            onDrop={canDropFiles ? handleDrop : undefined}
            id={`${title}-window-${id}`}
            className={`${title}-window system-window ${className} ${
              droppable ? "filedrop drop-active" : "filedrop"
            } window-${state}`}
            onClick={() => void setActiveWindowId(id)}
            onMouseDown={() => void setActiveWindowId(id)}
            /*onMouseUp={e => void handleMouseDown(e, false, id, title)}*/
          >
            <header
              className={`drag-handle ${title}-header`}
              /*onMouseDown={e => void handleMouseDown(e, true, id, title)}*/
              /*onMouseUp={e => void handleMouseDown(e, false, id, title)}*/
            >
              <span className="window-title-text">{`${componentProps.type ||
                t} (${num})${
                windowStructid ? ` ${windowStructid}` : ""
              }`}</span>
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
                  id={id}
                  handleWindowCommand={handleWindowCommand}
                  records={records}
                  setWindows={setWindows}
                  droppedFiles={droppedFiles}
                />
              }
            </section>
          </div>
        </Draggable>
      );
    },
    [
      droppable,
      droppedFiles,
      canDropFiles,
      className,
      componentProps,
      minerva,
      windows,
      id,
      num,
      records,
      setActiveWindowId,
      setWindows,
      state,
      t,
      title,
      x,
      y
    ]
  );
};

export default memo(Window);

Window.propTypes = {
  windows: PropTypes.array,
  setActiveWindowId: PropTypes.func,
  item: PropTypes.object,
  setMouseOffset: PropTypes.func,
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
