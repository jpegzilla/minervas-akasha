import React, { useState, useEffect, useContext, memo } from "react";
import { Redirect } from "react-router-dom";
import { uuidv4 } from "./../utils/misc";
import { makeStruct } from "../utils/managers/StructureMap";
import { globalContext } from "./App";

import Tab from "./windows/elements/Tab";

import PropTypes from "prop-types";

let timeouts = [];

const clearAll = () => {
  for (let i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
};

const TaskbarComponent = props => {
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
    [menuOpen, setAddMenuOpen]
  );

  useEffect(
    () => {
      addMenuOpen && setMenuOpen(false);
    },
    [addMenuOpen, setMenuOpen]
  );

  const t = () => {
    setStatusText("");
    setStatusMessage({ display: false, text: "", type: null });
  };

  const { audiomanager, minerva, setStatusMessage, setStatusText } = useContext(
    globalContext
  );

  const [logout, setLogout] = useState(false);

  // function to add a new structure
  const addStructure = type => {
    if (type !== type.toLowerCase())
      throw new Error("invalid type provided to addStructure");
    // add new window to list
    const struct = makeStruct(type, uuidv4(), minerva, uuidv4);

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

  const [
    menuItems
    // setMenuItems
  ] = useState([
    {
      id: "logout",
      title: "log out",
      onClick: () => {
        audiomanager.play("c_one");

        minerva.logout(minerva.user);

        setLogout(true);
      },
      tooltip: "end your current session and return to the login screen."
    },
    {
      id: "openrecord",
      title: "open record viewer",
      onClick: () => {
        const findWindowAtPosition = xy => {
          const allWindows = Object.values(minerva.windows).flat(Infinity);

          const windowToFind = allWindows.find(
            item => item.position.x === xy && item.position.y === xy
          );

          return windowToFind || false;
        };

        let finalPosition = 100;

        while (findWindowAtPosition(finalPosition)) {
          finalPosition += 10;
        }

        const newRecordViewer = {
          title: "record viewer",
          state: "restored",
          stringType: "Window",
          belongsTo: minerva.user.id,
          id: uuidv4(),
          component: "RecordViewer",
          componentProps: {},
          position: {
            x: finalPosition,
            y: finalPosition
          }
        };

        minerva.setWindows([...minerva.windows, newRecordViewer]);

        setWindows([...minerva.windows]);
      }
    },
    {
      id: "openconsole",
      title: "open console",
      onClick: () => {
        const findWindowAtPosition = xy => {
          const allWindows = Object.values(minerva.windows).flat(Infinity);

          const windowToFind = allWindows.find(
            item => item.position.x === xy && item.position.y === xy
          );

          return windowToFind || false;
        };

        let finalPosition = 100;

        while (findWindowAtPosition(finalPosition)) {
          finalPosition += 10;
        }

        const newConsole = {
          title: "console",
          state: "restored",
          stringType: "Window",
          component: "Console",
          componentProps: {
            setWindows
          },
          belongsTo: minerva.user.id,
          id: uuidv4(),
          position: {
            x: finalPosition,
            y: finalPosition
          }
        };

        minerva.setWindows([...minerva.windows, newConsole]);

        setWindows([...minerva.windows]);
      },
      tooltip: "open a command console."
    },
    {
      id: "submitfeedback",
      title: "submit feedback",
      onClick: () => {
        const link = document.createElement("a");
        link.href =
          "https://github.com/jpegzilla/minervas-akasha/blob/master/contributing.md#submitting-feedback-and-bug-reports";
        link.target = "_blank";
        link.click();
      },
      tooltip: "submit feedback about minerva's akasha."
    },
    {
      id: "exportdata",
      title: "export user data",
      onClick: () => {
        setStatusMessage({
          display: true,
          text:
            "it may take a while to export your records. please wait warmly.",
          type: "success"
        });

        clearAll();
        timeouts.push(setTimeout(t, 10000));

        minerva.exportDataToJsonFile();
      },
      tooltip: "export all user data for the currently logged in user."
    },
    {
      id: "sendreport",
      title: "submit bug report",
      onClick: () => {
        const link = document.createElement("a");
        link.href =
          "https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D";
        link.target = "_blank";
        link.click();
      },
      tooltip: "submit a bug report about minerva's akasha."
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
      id: title.split("+ ")[1],
      title,
      onClick: () => {
        const type = title.split("+ ")[1];
        addStructure(type);
      }
    };
  });

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
                {menuItems.map(i => {
                  return (
                    <li
                      onClick={
                        i.onClick
                          ? () => i.onClick()
                          : () => {
                              console.log("clicked on", i);
                              throw new Error("clicked on nonexistent option");
                            }
                      }
                      key={i.id}
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
            {addMenuItems.map(item => {
              return (
                <li onClick={() => item.onClick()} key={item.id}>
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
            if (w.component === "Console") {
              tabCounts[w.component] = tabCounts[w.component] + 1 || 1;
            }
            // this needs to change so that tabs are independent components with their own state,
            // their own contextmenu listeners, etc.

            let title = w.title;

            if (w.componentProps) {
              if (w.componentProps.type) {
                title = w.componentProps.type;
                tabCounts[w.componentProps.type] =
                  tabCounts[w.componentProps.type] + 1 || 1;
              }
            }

            return (
              <Tab
                key={w.stringType + i}
                w={w}
                title={title}
                tabCounts={
                  w.component === "Console"
                    ? tabCounts[w.component]
                    : tabCounts[w.componentProps.type] ||
                      tabCounts[w.stringType]
                }
                activeWindowId={activeWindowId}
                handleClickItem={handleClickItem}
              />
            );
          }

          return false;
        })}
      </ul>
    </section>
  );
};

export default memo(TaskbarComponent);

TaskbarComponent.propTypes = {
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
