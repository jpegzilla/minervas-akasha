import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import { uuidv4 } from "./../utils/misc";
import { globalContext } from "./App";

// import { Console } from "./windows/Console";
// import { Window } from "./windows/Window";
// import { DataStructure } from "./windows/DataStructure";
//
// import { Structure } from "../utils/structures/structure";
// import { Hypostasis } from "../utils/structures/hypostasis";
// import { Shard } from "../utils/structures/shard";
// import { Node } from "../utils/structures/node";
// import { Grimoire } from "../utils/structures/grimoire";
import { Athenaeum } from "../utils/structures/athenaeum";

import PropTypes from "prop-types";

// let timeouts = [];

// const clearAll = () => {
//   for (let i = 0; i < timeouts.length; i++) {
//     clearTimeout(timeouts[i]);
//   }
// };

export const Taskbar = props => {
  const {
    setWindows,
    windows,
    activeWindowId,
    setActiveWindowId,
    taskBarMenuRef,
    menuOpen,
    setMenuOpen
  } = props;

  // const t = () => {
  //   setStatusText("");
  //   setStatusMessage({ display: false, text: "", type: null });
  // };

  const { audiomanager, minerva } = useContext(globalContext);

  const [logout, setLogout] = useState(false);

  // function to add a new athenaeum structure
  const addAthenaeum = () => {
    // add new window to list
    const ath = {
      title: "datastructure",
      state: "restored",
      stringType: "Window",
      component: "DataStructure",
      componentProps: {
        type: "Athenaeum"
      },
      belongsTo: minerva.user.id,
      id: uuidv4(),
      position: {
        x: 100,
        y: 100
      }
    };

    minerva.record.addToRecord(new Athenaeum());

    minerva.setWindows([...minerva.windows, ath]);

    setWindows([...minerva.windows]);
  };

  // for minimizing / restoring windows
  const handleClickItem = (event, item) => {
    console.log("clicked on", item);

    let newState;

    // todo: remove maximization
    if (item.state === "minimized") newState = "restored";
    if (item.state === "restored") newState = "minimized";

    setWindows([
      ...windows.map(w => {
        if (w.id === item.id) return { ...w, state: newState };
        else return w;
      })
    ]);

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
        console.log(item, "adding new structure.");

        addAthenaeum();
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

  useEffect(
    () => {
      console.log("useEffect minerva.windows", minerva.windows);
    },
    [minerva.windows]
  );

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

  const tabCounts = {};

  return (
    <section id="application-taskbar">
      <div
        onClick={e => {
          e.stopPropagation();
          openMenu();
        }}
        className={`taskbar-button ${menuOpen ? "menu-open" : ""}`}
        id="menu"
        ref={taskBarMenuRef}
      >
        menu
        <div onClick={e => e.stopPropagation()} className="application-menu">
          <div className="menu-container">
            {/* menu sidebar */}
            <div className="menu-container-sidebar">
              <span>minervas.akasha</span>
            </div>
            <b />
            {/* actual menu items */}
            <div className="menu-container-items">
              <ul>
                {menuItems.map((i, idx) => {
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
        {windows.map((w, i) => {
          if (w.belongsTo === minerva.user.id) {
            tabCounts[w.stringType] = tabCounts[w.stringType] + 1 || 1;

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
                key={w.stringType + i}
              >
                {`${w.title} (${tabCounts[w.stringType]})`}
              </li>
            );
          }
        })}
      </ul>
    </section>
  );
};

Taskbar.propTypes = {
  setWindows: PropTypes.func,
  windows: PropTypes.array,
  activeWindow: PropTypes.any,
  activeWindowId: PropTypes.string,
  setActiveWindowId: PropTypes.func,
  setActiveWindow: PropTypes.func,
  taskBarMenuRef: PropTypes.object,
  menuOpen: PropTypes.bool,
  setMenuOpen: PropTypes.func
};
