import React from "react";

import { Clock } from "./windows/elements/Clock";

// import { globalContext } from "./App";
import { Settings } from "./windows/Settings";

export const Topbar = props => {
  const { settingsMenuRef, settingsOpen, setSettingsOpen } = props;

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
      <Clock />
    </section>
  );
};
