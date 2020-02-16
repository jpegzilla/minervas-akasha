import React, { useState, useEffect, useRef } from "react";
import { uuidv4 } from "./../utils/misc";

export const Taskbar = props => {
  const {
    minerva,
    setSettingsMenuOpen,
    settingsMenuOpen,
    sidebarOpen,
    setSidebarOpen
  } = props;

  const [activeWindow, setActiveWindow] = useState(null);

  const [windows, setWindows] = useState([
    {
      title: "default",
      type: "window",
      id: uuidv4(),
      active: false,
      size: "restored"
    }
  ]);

  const openSettingsMenu = () => {
    setSettingsMenuOpen(!settingsMenuOpen);
  };

  const openSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <section id="application-taskbar">
      <div
        onClick={openSidebar}
        className="application-square-buttons"
        id="application-menu-button"
      >
        ⌂
      </div>
      <div
        onClick={openSettingsMenu}
        onMouseEnter={console.log}
        className="application-square-buttons"
        id="application-settings-button"
      >
        ⚙
      </div>
      <div id="application-windows-list">
        {windows.map((item, i) => {
          return (
            <div
              title={item.title}
              key={`${i}${uuidv4}`}
              className={`${item.type} ${item.size}`}
            />
          );
        })}
      </div>
    </section>
  );
};
