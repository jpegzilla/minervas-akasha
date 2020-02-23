import React, { useState, useEffect, useRef, useContext } from "react";
import { Redirect } from "react-router-dom";
import { uuidv4 } from "./../utils/misc";
import { globalContext } from "./App";

import { Console } from "./windows/Console";

let timeouts = [];

const clearAll = () => {
  for (let i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
};

export const Taskbar = props => {
  const {
    setWindows,
    windows,
    activeWindow,
    activeWindowId,
    setActiveWindowId,
    setActiveWindow
  } = props;

  const t = () => {
    setStatusText("");
    setStatusMessage({ display: false, text: "", type: null });
  };

  const { audiomanager, setStatusMessage, setStatusText, minerva } = useContext(
    globalContext
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const [logout, setLogout] = useState(false);

  const handleClickItem = (event, item) => {
    console.log("clicked on", item);

    setActiveWindowId(item.id);
  };

  const addItem = () => {
    console.log("adding item");
  };

  const openMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const [menuItems, setMenuItems] = useState([
    {
      title: "log out",
      onClick: (e, item) => {
        console.log("clicked", item.title);

        audiomanager.play("c_one");

        minerva.logout(minerva.user);

        setLogout(true);
      },
      tooltip: "end your current session and return to the login screen."
    },
    {
      title: "other option",
      onClick: (e, item) => {
        console.log("clicked", item.title);
      }
    },
    {
      title: "add new athenaeum",
      onClick: (e, item) => {
        console.log("adding new structure.");
      },
      tooltip: "add a new structure."
    },
    {
      title: "open console",
      onClick: (e, item) => {
        console.log("clicked", item.title);

        const newConsole = {
          title: "console",
          state: "restored",
          stringType: "Console",
          belongsTo: minerva.user.id,
          id: uuidv4(),
          position: {
            x: 100,
            y: 100
          }
        };

        minerva.setWindows([...minerva.windows, newConsole]);

        setWindows([...minerva.windows]);
      },
      tooltip: "open a command console."
    }
  ]);

  useEffect(() => {
    console.log("useEffect minerva.windows", minerva.windows);
  }, []);

  const applicationMenu = useRef(null);

  if (logout)
    return (
      <Redirect
        to={{
          pathname: "/login",
          state: {
            playaudio: false
          }
        }}
      />
    );

  return (
    <section id="application-taskbar">
      <div
        onClick={openMenu}
        className={`taskbar-button ${menuOpen ? "menu-open" : ""}`}
        id="menu"
      >
        menu
        <div
          ref={applicationMenu}
          onClick={e => e.stopPropagation()}
          className="application-menu"
        >
          <div className="menu-container">
            {/* menu sidebar */}
            <div className="menu-container-sidebar">
              <span>minervas.akasha</span>
            </div>
            <b />
            {/* actual menu items */}
            <div className="menu-container-items">
              <ul>
                {menuItems.map(i => {
                  return (
                    <li
                      onClick={
                        i.onClick
                          ? e => i.onClick(e, i)
                          : () => console.log("clicked on", i)
                      }
                      key={uuidv4()}
                      title={i.tooltip || undefined}
                    >
                      {i.title}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div onClick={addItem} className="taskbar-button" id="add-item">
        + add
      </div>
      <ul id="taskbar-tabs">
        {windows.map(w => {
          if (w.belongsTo !== minerva.user.id) return;

          return (
            <li
              className={
                w.id === activeWindowId
                  ? "taskbar-button active"
                  : "taskbar-button"
              }
              onClick={e => {
                handleClickItem(e, w);
              }}
              key={uuidv4()}
            >
              {w.title}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
