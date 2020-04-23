import React, {
  useEffect,
  useContext,
  useRef,
  useCallback,
  memo,
  useState
} from "react";

import { uuidv4 } from "./../../utils/misc";
import { parseCommand } from "./../../utils/commandParser";

import { globalContext } from "./../App";
import PropTypes from "prop-types";

const Console = props => {
  const { setWindows } = props;

  const { minerva, audiomanager } = useContext(globalContext);

  const [command, setCommand] = useState("");
  const [conCommand, setConCommand] = useState("");
  const [history, setHistory] = useState([]);
  const [commandIndex, setCommandIndex] = useState(history.length);
  const [inputState, setInputState] = useState("default");
  const [log, setLog] = useState([]);

  const input = useRef(null);
  const cmdLog = useRef(null);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  useEffect(
    () => {
      setCommandIndex(history.length);
    },
    [history]
  );

  const lines = [];

  const scroll = useCallback(
    () => {
      if (cmdLog) cmdLog.current.scrollTop = cmdLog.current.scrollHeight;
    },
    [cmdLog]
  );

  useEffect(
    () => {
      scroll();
    },
    [scroll, log]
  );

  // when the command is programatically updated, move the cursor to the end of the input
  useEffect(
    () => {
      setCommand(conCommand);
      input.current.selectionStart = input.current.selectionEnd =
        input.current.value.length;
    },
    [conCommand]
  );

  const handleCommand = e => {
    if (e.repeat || e.key.toLowerCase() !== "enter") {
      return false;
    }

    const cmd = command;

    // put the previous command into the history
    setHistory([...history, cmd]);

    const res = parseCommand(cmd, setWindows, minerva, log);

    setCommand("");
    setInputState("default");

    if (["clr", "clear"].includes(cmd)) {
      return setLog([]);
    }

    // don't do anything if the user didn't enter a command
    if (cmd === "") return;

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
              { type: "error", text: "unknown command.", id: uuidv4() }
            ]);
        }
      }

      if (res.state === "error") {
        audiomanager.play("e_one");

        return setLog([
          ...log,
          { type: "error", text: res.message, id: uuidv4() }
        ]);
      }

      // this will set the command input to a password-style input.
      if (res.state === "password") {
        setInputState("password");

        return setLog([
          ...log,
          {
            type: "command",
            text: res.message,
            request: res.request,
            id: uuidv4()
          }
        ]);
      }
    }

    // commandparser will return false if an undefined command is recieved.
    // play an error sound.
    if (!res) {
      audiomanager.play("e_one");

      return setLog([
        ...log,
        {
          type: "error",
          text: `undefined command -> ${cmd}`,
          id: uuidv4()
        }
      ]);
    }

    if (res.state === "update") {
      setLog([
        ...log,
        {
          type: "update",
          text: `> ${res.message} -> success`,
          id: uuidv4()
        }
      ]);
    } else {
      // for commands that just return a text response and don't do anything else.
      // for multiline commands, the response will print on multiple lines.
      lines.push(res.split("\n")[0]);

      res.split("\n").forEach((line, i) => {
        if (i > 0) lines.push(line);
      });

      setLog([...log, { type: "command", text: lines, id: uuidv4() }]);
    }
  };

  const handleUpKey = () => {
    const lastCommand = history[commandIndex - 1];

    if (lastCommand !== undefined) {
      setCommandIndex(commandIndex - 1);
      setConCommand(lastCommand);
    }
  };

  const handleDownKey = () => {
    const nextCommand = history[commandIndex + 1];

    if (nextCommand !== undefined) {
      setCommandIndex(commandIndex + 1);
      setConCommand(nextCommand);
    }
  };

  return (
    <section onClick={() => input.current.focus()} className="window-content">
      <section ref={cmdLog} className="console-text">
        {log.map((e, i) => {
          return (
            <div key={e.id} className="console-response">
              <span className="command-prefix">
                {minerva.user.name}
                @minerva.akasha <span className="console-tag">MNRV</span>
                &nbsp;
                <span className="console-type">
                  ~!{" "}
                  {log[i - 1]
                    ? log[i - 1].text === "enter admin key"
                      ? "[ password ]"
                      : history[i]
                    : history[i]}
                </span>
              </span>
              <pre
                onClick={e => void e.stopPropagation()}
                onMouseUp={e => void e.stopPropagation()}
                onMouseDown={e => void e.stopPropagation()}
                className={`console-${e.type}`}
              >
                {Array.isArray(e.text)
                  ? e.text.map((line, i) => {
                      return <p key={`${e.id}-${line}-${i}`}>{line}</p>;
                    })
                  : e.text}
              </pre>
            </div>
          );
        })}
      </section>

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
          onKeyDown={e => {
            if (e.key.toLowerCase() === "arrowup") handleUpKey();
            else if (e.key.toLowerCase() === "arrowdown") handleDownKey();
          }}
          onChange={e => {
            setCommand(e.target.value);
          }}
          className={inputState}
          type={inputState === "password" ? "password" : "text"}
          ref={input}
          value={command}
        />
      </div>
    </section>
  );
};

export default memo(Console);

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
