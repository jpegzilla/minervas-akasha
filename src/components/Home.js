import React, { useState, useEffect, useContext, useRef } from "react";
import { Typist, uuidv4 } from "./../utils/misc";

import { Taskbar } from "./Taskbar";
import { Topbar } from "./Topbar";

import { Console } from "./windows/Console";

import { globalContext } from "./App";

export const Home = () => {
  const { minerva } = useContext(globalContext);
  const [activeWindow, setActiveWindow] = useState(null);
  const [activeWindowId, setActiveWindowId] = useState("");

  // windows have three states: minimized, maximized, and restored
  const [windows, setWindows] = useState([
    {
      title: "console",
      state: "restored",
      type: Console,
      id: uuidv4(),
      position: {
        x: 100,
        y: 100
      }
    }
    // {
    //   title: "default tab",
    //   type: Window,
    //   id: uuidv4(),
    //   active: false,
    //   size: "restored"
    // }
  ]);

  const setPosition = (windowTitle, newPosition) => {
    if ([newPosition.x, newPosition.y].some(e => Number.isNaN(e)))
      throw "invalid parameters to setPosition";

    setWindows(
      windows.map(item => {
        return item.title === windowTitle
          ? {
              ...item,
              position: newPosition
            }
          : item;
      })
    );
  };

  const [mouseOffset, setMouseOffset] = useState([0, 0]);

  const handleMouseMove = e => {
    if (activeWindow) {
      const { clientX, clientY } = e;

      requestAnimationFrame(() =>
        setPosition(activeWindow, {
          x: clientX - mouseOffset[0],
          y: clientY - mouseOffset[1]
        })
      );
    }
  };

  return (
    <section
      id="window-system"
      onMouseUp={() => {
        setActiveWindow(null);
        setActiveWindowId("");
      }}
      onMouseMove={handleMouseMove}
    >
      <Topbar minerva={minerva} />
      <section id="main-container">
        {windows.map((item, i) => {
          const Component = item.type;

          return (
            <Component
              key={`${item.title}-window-${i}`}
              position={item.position}
              title={item.title}
              setPosition={setPosition}
              setActiveWindowId={setActiveWindowId}
              setActiveWindow={setActiveWindow}
              setMouseOffset={setMouseOffset}
              id={item.id}
            />
          );
        })}
      </section>
      <Taskbar
        activeWindow={activeWindow}
        setActiveWindow={setActiveWindow}
        activeWindowId={activeWindowId}
        setActiveWindowId={setActiveWindowId}
        minerva={minerva}
        windows={windows}
        setWindows={setWindows}
      />
    </section>
  );
};
