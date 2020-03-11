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
// import { Athenaeum } from "../utils/structures/athenaeum";

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
    setMenuOpen,
    addMenuOpen,
    setAddMenuOpen
  } = props;

  // if one menu is open, close the other one
  useEffect(
    () => {
      menuOpen && setAddMenuOpen(false);
    },
    [menuOpen]
  );
  useEffect(
    () => {
      addMenuOpen && setMenuOpen(false);
    },
    [addMenuOpen]
  );

  // const t = () => {
  //   setStatusText("");
  //   setStatusMessage({ display: false, text: "", type: null });
  // };

  const { audiomanager, minerva } = useContext(globalContext);

  const [logout, setLogout] = useState(false);

  // function to add a new structure
  const addStructure = type => {
    if (type !== type.toLowerCase())
      throw new Error("invalid type provided to addStructure");
    // add new window to list
    const struct = {
      title: "datastructure",
      state: "restored",
      stringType: "Window",
      component: "DataStructure",
      componentProps: {
        type,
        structId: uuidv4()
      },
      belongsTo: minerva.user.id,
      id: uuidv4(),
      position: {
        x: 100,
        y: 100
      }
    };

    minerva.setWindows([...minerva.windows, struct]);

    setWindows([...minerva.windows]);
  };

  // for minimizing / restoring windows
  const handleClickItem = (_event, item) => {
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

  const openMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const openAdd = () => {
    setAddMenuOpen(!addMenuOpen);
  };

  const [menuItems, setMenuItems] = useState([
    {
      title: "log out",
      onClick: (_e, _item) => {
        audiomanager.play("c_one");

        minerva.logout(minerva.user);

        setLogout(true);
      },
      tooltip: "end your current session and return to the login screen."
    },
    {
      title: "open record viewer",
      onClick: (_e, _item) => {
        const newRecordViewer = {
          title: "record viewer",
          state: "restored",
          stringType: "Window",
          belongsTo: minerva.user.id,
          id: uuidv4(),
          component: "RecordViewer",
          componentProps: {},
          position: {
            x: 100,
            y: 100
          }
        };

        minerva.setWindows([...minerva.windows, newRecordViewer]);

        setWindows([...minerva.windows]);
      }
    },
    {
      title: "add new athenaeum",
      onClick: (_e, _item) => {
        addStructure("athenaeum");
      },
      tooltip: "add a new structure."
    },
    {
      title: "open console",
      onClick: (_e, _item) => {
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

  const addMenuItems = [
    "+ shard",
    "+ node",
    "+ grimoire",
    "+ athenaeum",
    "+ hypostasis"
  ].map(title => {
    return {
      title,
      onClick: (_e, _item, _id) => {
        const type = title.split("+ ")[1];
        addStructure(type);
      }
    };
  });

  const [addItemsList, setAddItemsList] = useState([...addMenuItems]);

  useEffect(
    () => {
      // console.log("useEffect minerva.windows", minerva.windows);
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
                          : () => {
                              console.log("clicked on", i);
                              throw new Error("clicked on nonexistent option");
                            }
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
      <div
        onClick={e => {
          e.stopPropagation();
          openAdd();
        }}
        className={`taskbar-button ${addMenuOpen ? "menu-open" : ""}`}
        id="add-item"
      >
        + add
        <div
          className="add-menu"
          onClick={e => e.stopPropagation()}
          id="add-menu"
        >
          <ul>
            {addItemsList.map(item => {
              const id = uuidv4();

              return (
                <li onClick={e => item.onClick(e, item, id)} key={id}>
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>
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
