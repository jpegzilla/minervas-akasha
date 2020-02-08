import React, { useState, useEffect, useRef } from "react";
import { uuidv4 } from "./../utils/misc";

export const Taskbar = props => {
  const { minerva } = props;

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

  return <div>taskbar</div>;
};
