import React, { useContext, useState } from "react";
import { globalContext } from "./App";

export const Settings = props => {
  const { closeSettings, settingsMenuOpen } = props;

  return (
    settingsMenuOpen && (
      <section onClick={closeSettings} id="settings-window">
        <div className="settings-window-container">
          <header>application settings</header>
        </div>
      </section>
    )
  );
};
