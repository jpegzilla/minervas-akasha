import React, { useState } from "react";

export const Topbar = () => {
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

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
  };

  const [currentTime, setCurrentTime] = useState(time);

  setInterval(() => {
    setCurrentTime(time);
  }, 1000);

  return (
    <section id="top-bar">
      <div className="taskbar-button" id="settings-button">
        settings
      </div>
      <b />

      <div className="taskbar-button" id="topbar-clock">
        {currentTime}
      </div>
    </section>
  );
};
