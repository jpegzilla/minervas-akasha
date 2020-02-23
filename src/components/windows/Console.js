import React, { useState, useEffect, useContext, useRef } from "react";

import { uuidv4 } from "./../../utils/misc";
import { parseCommand } from "./../../utils/commandParser";

import { globalContext } from "./../App";

let mouseDown = false;

export const Console = props => {
  const {
    setActiveWindow,
    setActiveWindowId,
    title,
    id,
    position,
    setMouseOffset,
    activeWindowId,
    className
  } = props;
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
      const o = {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      };

      setMouseOffset([e.clientX - o.left, e.clientY - o.top]);
    } else setMouseOffset([0, 0]);
    setActiveWindow(bool ? title : "");
  };

  return (
    <div
      // style={{ transform: `translate(${x}px, ${y}px)` }}
      style={
        activeWindowId === id
          ? { top: y, left: x }
          : { top: position.y, left: position.x }
      }
      id={`${title}-window-${id}`}
      className={`${title}-window system-window ${className}`}
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
        {title}
      </header>

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
          onKeyPress={handleCommand}
          onChange={e => setCommand(e.target.value)}
          type="text"
          ref={input}
          value={command}
        />
      </div>
    </div>
  );
};
