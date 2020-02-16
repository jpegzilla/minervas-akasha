import React, { useState, useEffect, useContext, useRef } from "react";
import { Typist, uuidv4 } from "./../utils/misc";

import { globalContext } from "./App";

import { Taskbar } from "./Taskbar";
import { Settings } from "./Settings";

export const Home = () => {
  const { minerva } = useContext(globalContext);

  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(minerva);

  const closeSettings = e => {
    if (e.target.id === "settings-window") setSettingsMenuOpen(false);
  };

  return (
    <section id="window-system">
      <Settings
        settingsMenuOpen={settingsMenuOpen}
        closeSettings={closeSettings}
      />

      <div id="main-container">
        {/* main sidebar */}
        <section className={sidebarOpen ? "active" : ""} id="sidebar">
          <header>my files</header>
          <div>{/* list of user's data */}</div>
        </section>

        <section id="desktop" />
      </div>

      <Taskbar
        settingsMenuOpen={settingsMenuOpen}
        setSettingsMenuOpen={setSettingsMenuOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </section>
  );
};
