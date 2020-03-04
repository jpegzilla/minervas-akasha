import React, { useState, useContext } from "react";

import { globalContext } from "./App";
import { Settings } from "./Settings";

let timeFormat = false;

export const Topbar = props => {
  const { settingsMenuRef, settingsOpen, setSettingsOpen } = props;
  const { audiomanager, minerva } = useContext(globalContext);

  const time = () => {
    let hours = new Date().getHours();

    let minutes = new Date()
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const seconds = new Date()
      .getSeconds()
      .toString()
      .padStart(2, "0");

    if (timeFormat) {
      hours = hours % 12;
      hours = hours ? hours : 12;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
  };

  const [currentTime, setCurrentTime] = useState(time);

  setInterval(() => {
    setCurrentTime(time);
  }, 1000);

  return (
    <section id="top-bar">
      <div
        onClick={e => {
          e.stopPropagation();
          setSettingsOpen(!settingsOpen);
        }}
        className="taskbar-button"
        id="settings-button"
      >
        settings
        {settingsOpen && <Settings settingsMenuRef={settingsMenuRef} />}
      </div>
      <b />

      <div
        title="switch between 24 / 12 hour time"
        onClick={() => {
          timeFormat = !timeFormat;
          setCurrentTime(time);
        }}
        className="taskbar-button"
        id="topbar-clock"
      >
        {currentTime}
      </div>
    </section>
  );
};
