import React, { useState, useEffect, useContext, useRef } from "react";

import { uuidv4 } from "./../../utils/misc";
import { parseCommand } from "./../../utils/commandParser";

import { globalContext } from "./../App";
import PropTypes from "prop-types";

export const Console = props => {
  const { setWindows } = props;

  const { minerva, audiomanager } = useContext(globalContext);
  const [command, setCommand] = useState("");
  const [inputState, setInputState] = useState("default");

  const [history, setHistory] = useState([]);
  const [log, setLog] = useState([]);

  const input = useRef(null);
  const cmdLog = useRef(null);

  useEffect(() => {
    input.current.focus();
  }, []);

  const handleCommand = e => {
    if (e.repeat || e.which !== 13) return;
    const cmd = command;

    document.querySelector(".console-text").scrollTop = document.querySelector(
      ".console-text"
    ).offsetHeight;

    const res = parseCommand(cmd, setWindows, minerva);

    setCommand("");
    setInputState("default");
    if (["clr", "clear"].includes(cmd)) return setLog([]);
    if (cmd === "") return setLog([...log, { type: "none", text: " " }]);

    console.log("response from command parser:", res);

    if (res.message) {
      if (res.action) {
        const { action } = res;

        switch (action) {
          case "reset records":
            minerva.resetRecords();
            break;

          default:
            console.log(
              "action returned from parseCommand was not known. response:",
              res
            );

            return setLog([
              ...log,
              { type: "error", text: "unknown command." }
            ]);
        }
      }

      if (res.state === "error") {
        audiomanager.play("e_one");
        return setLog([...log, { type: "error", text: res.message }]);
      }

      if (res.state === "password") {
        setInputState("password");
        return setLog([...log, { type: "command", text: res.message }]);
      }
    }

    if (!res) {
      audiomanager.play("e_one");
      return setLog([
        ...log,
        { type: "error", text: `undefined command -> ${cmd}` }
      ]);
    }

    if (res.state === "update") {
      setLog([...log, { type: "update", text: `> ${res.message} -> success` }]);
    } else setLog([...log, { type: "command", text: `> ${cmd} -> ${res}` }]);

    setHistory([...history, { type: "command", text: cmd }]);
  };

  return (
    <section onClick={() => input.current.focus()} className="window-content">
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
          type={inputState === "password" ? "password" : "text"}
          ref={input}
          value={command}
        />
      </div>
    </section>
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
