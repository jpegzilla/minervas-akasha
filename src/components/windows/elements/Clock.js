import React, { useState, useEffect } from "react";
let timeFormat = false;
export const Clock = () => {
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

  const updateTime = () => {
    setCurrentTime(time);
  };

  setInterval(updateTime, 1000);

  useEffect(() => {
    return () => clearInterval(updateTime);
  });

  return (
    <div
      title="switch between 24 / 12 hour time"
      onClick={e => {
        e.stopPropagation();
        timeFormat = !timeFormat;
        setCurrentTime(time);
      }}
      className="taskbar-button"
      id="topbar-clock"
    >
      {currentTime}
    </div>
  );
};
