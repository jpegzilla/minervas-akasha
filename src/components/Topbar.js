import React, { useState, useContext } from "react";

import { globalContext } from "./App";

let timeFormat = false;

export const Topbar = props => {
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

  const openSettingsMenu = () => {
    console.log("opening settings menu");
  };

  setInterval(() => {
    setCurrentTime(time);
  }, 1000);

  return (
    <section id="top-bar">
      <div
        onClick={openSettingsMenu}
        className="taskbar-button"
        id="settings-button"
      >
        settings
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
