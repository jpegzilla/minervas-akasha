const handleMouseMove = e => {
  if (!activeWindow) return;

  if (activeWindow && !wait) {
    setWait(true);
    const { clientX, clientY } = e;

    const onMouseUp = () => {
      setActiveWindow(null);
      setActiveWindowId("");
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mouseup", onMouseUp, {
      once: true,
      capture: true
    });

    // the offset is off! fix fix fix.
    // from the mdn web documentation of raf():
    // // note: your callback routine must itself call requestAnimationFrame()
    // // if you want to animate another frame at the next repaint.
    const moveWindow = () => {
      setTimeout(() => setWait(false), 16);
      setPosition(activeWindowId, {
        x: clientX - mouseOffset[0],
        y: clientY - mouseOffset[1]
      });
    };

    requestAnimationFrame(() => {
      // update the window position and immediately request another frame to update again.

      moveWindow();
      requestAnimationFrame(moveWindow);
    });
  }
};

const handleMouseDown = (e, bool) => {
  // when mouse is down, make sure that the mouse is not clicking on a window control button.
  if (
    Array.from(document.querySelectorAll(".window-controls-button")).includes(
      e.target
    )
  ) {
    return;
  }

  setActiveWindowId(id);

  // bool is true if mouse is down, false if mouse is up.
  if (bool) {
    // this is to get the position of the cursor
    // relative to the element in the window
    const o = {
      x: e.clientX,
      y: e.clientY
    };

    // TODO: come back and un hardcode this
    setMouseOffset({ ...o });

    // reset offset if mouse is not clicked
  } else setMouseOffset({ x: 0, y: 0 });

  // set active window title
  setActiveWindow(bool ? title : "");
};
