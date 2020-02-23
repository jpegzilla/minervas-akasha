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
  const [windows, setWindows] = useState(minerva.windows);

  const setPosition = (windowId, newPosition) => {
    if ([newPosition.x, newPosition.y].some(e => Number.isNaN(e)))
      throw "invalid parameters to setPosition";

    const newWindows = windows.map(item => {
      return item.id === windowId
        ? {
            ...item,
            position: newPosition
          }
        : item;
    });

    minerva.setWindows(newWindows);

    setWindows([...newWindows]);
  };

  const [mouseOffset, setMouseOffset] = useState([0, 0]);

  const handleMouseMove = e => {
    if (activeWindow) {
      const { clientX, clientY } = e;

      requestAnimationFrame(() =>
        setPosition(activeWindowId, {
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
          if (item.belongsTo !== minerva.user.id) return;

          const typeMap = {
            Console: Console
          };

          const Component = typeMap[item.stringType];

          let isActive = "";

          if (item.id === activeWindowId) isActive = "active";

          return (
            <Component
              className={isActive}
              key={`${item.title}-window-${i}`}
              position={item.position}
              title={item.title}
              setPosition={setPosition}
              setActiveWindowId={setActiveWindowId}
              activeWindowId={activeWindowId}
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
        windows={windows}
        setWindows={setWindows}
      />
    </section>
  );
};
