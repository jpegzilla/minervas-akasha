import React, { useState, useEffect, useContext, useRef } from "react";

import { uuidv4 } from "./../../utils/misc";
import { parseCommand } from "./../../utils/commandParser";

import { globalContext } from "./../App";
import PropTypes from "prop-types";

export const Console = props => {
  const {
    windows,
    setActiveWindow,
    setActiveWindowId,
    item,
    setMouseOffset,
    activeWindowId,
    setWindows,
    className,
    num
  } = props;

  const { title, id, state, position } = item;

  const { x, y } = position;
  const { minerva, audiomanager } = useContext(globalContext);
  const [command, setCommand] = useState("");

  const [history, setHistory] = useState([]);
  const [log, setLog] = useState([]);

  const input = useRef(null);
  const cmdLog = useRef(null);

  if (className === "active") {
    document.getElementById(`${title}-window-${id}`).focus();
  }

  useEffect(() => {
    input.current.focus();
  }, []);

  const handleCommand = e => {
    if (e.repeat || e.which !== 13) return;
    const cmd = command;

    document.querySelector(".console-text").scrollTop = document.querySelector(
      ".console-text"
    ).offsetHeight;

    const res = parseCommand(cmd, setLog, minerva);

    setCommand("");
    if (["clr", "clear"].includes(cmd)) return setLog([]);
    if (cmd === "") return setLog([...log, { type: "none", text: " " }]);

    if (cmd.toLowerCase() !== cmd) {
      audiomanager.play("e_one");
      return setLog([
        ...log,
        { type: "error", text: "no uppercase letters allowed." }
      ]);
    }

    if (!res) {
      audiomanager.play("e_one");
      return setLog([
        ...log,
        { type: "error", text: `undefined command -> ${cmd}` }
      ]);
    }

    setHistory([...history, { type: "command", text: cmd }]);
    setLog([...log, { type: "command", text: `> ${cmd} -> ${res}` }]);
  };

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

  return (
    <div
      style={
        activeWindowId === id
          ? { transform: `translate3d(${x}px, ${y}px, 0)` }
          : { transform: `translate3d(${position.x}px, ${position.y}px, 0)` }
      }
      id={`${title}-window-${id}`}
      className={`${title}-window system-window ${className} window-${state}`}
      onClick={() => {
        setActiveWindowId(id);
        input.current.focus();
      }}
      onMouseUp={e => handleMouseDown(e, false)}
    >
      <header
        className={`${title}-header`}
        onMouseDown={e => handleMouseDown(e, true)}
        onMouseUp={e => handleMouseDown(e, false)}
      >
        <span>{`${title} (${num})`}</span>
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
        {/* command log */}
        <section ref={cmdLog} className="console-text">
          {log.map(e => (
            <div className={`console-${e.type}`} key={uuidv4()}>
              {e.text}
            </div>
          ))}
        </section>

        {/* input */}
        <div className="console-input">
          <span className="command-prefix">
            {minerva.user.name}
            @minerva.akasha <span className="console-tag">MNRV</span>
            &nbsp;
            <span className="console-type">~!</span>
          </span>
          <input
            autoComplete="new-password"
            onKeyPress={handleCommand}
            onChange={e => setCommand(e.target.value)}
            type="text"
            ref={input}
            value={command}
          />
        </div>
      </section>
    </div>
  );
};

Console.propTypes = {
  windows: PropTypes.array,
  setActiveWindow: PropTypes.func,
  setActiveWindowId: PropTypes.func,
  item: PropTypes.object,
  setMouseOffset: PropTypes.func,
  activeWindowId: PropTypes.string,
  setWindows: PropTypes.func,
  className: PropTypes.string,
  num: PropTypes.number
};
