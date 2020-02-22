import React, { useState, useEffect, useRef, useContext } from "react";
import { Redirect } from "react-router-dom";
import { uuidv4 } from "./../utils/misc";
import { globalContext } from "./App";

export const Taskbar = props => {
  const {
    minerva,
    setWindows,
    windows,
    activeWindow,
    activeWindowId,
    setActiveWindowId,
    setActiveWindow
  } = props;

  const { audiomanager } = useContext(globalContext);

  const [menuOpen, setMenuOpen] = useState(false);

  const [logout, setLogout] = useState(false);

  const handleClickItem = (event, item) => {
    console.log(item);
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
      },
      tooltip: "open a command console."
    }
  ]);

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
                      onClick={i.onClick ? e => i.onClick(e, i) : undefined}
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
