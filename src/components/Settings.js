import React, { useState, useEffect, useContext } from "react";

import { globalContext } from "./App";

export const Settings = props => {
  const { minerva } = useContext(globalContext);
  const [settings, setSettings] = useState(minerva.settings);
  const { settingsMenuRef } = props;

  useEffect(() => minerva.changeSetting(settings), [
    settings,
    minerva,
    minerva.settings
  ]);

  return (
    <div
      onClick={e => e.stopPropagation()}
      ref={settingsMenuRef}
      id="settings-menu"
    >
      {/* volume settings */}
      <div className="volume-setting-box settings-box">
        <fieldset>
          <legend>volume</legend>
          <label htmlFor="volume-control-master">
            <span>
              master volume {settings.volume.master.toString().padStart(3, "0")}
              %
            </span>
            <input
              onChange={e => {
                setSettings({
                  ...settings,
                  volume: {
                    ...settings.volume,
                    master: parseInt(e.target.value)
                  }
                });
              }}
              value={settings.volume.master}
              type="range"
              id="volume-control-master"
            />
          </label>

          {/* fx volume */}
          <label htmlFor="volume-control-effect">
            <span>
              effect volume {settings.volume.effect.toString().padStart(3, "0")}
              %
            </span>
            <input
              onChange={e => {
                setSettings({
                  ...settings,
                  volume: {
                    ...settings.volume,
                    effect: parseInt(e.target.value)
                  }
                });
              }}
              value={settings.volume.effect}
              type="range"
              id="volume-control-effect"
            />
          </label>

          {/* voice volume */}
          <label htmlFor="volume-control-voice">
            <span>
              voice volume {settings.volume.voice.toString().padStart(3, "0")}%
            </span>
            <input
              onChange={e => {
                setSettings({
                  ...settings,
                  volume: {
                    ...settings.volume,
                    voice: parseInt(e.target.value)
                  }
                });
              }}
              value={settings.volume.voice}
              type="range"
              id="volume-control-voice"
            />
          </label>
        </fieldset>

        <fieldset className="connection-settings">
          <legend>connections</legend>

          <label
            title="allows you to see content procured by other users of this software"
            htmlFor="connection-settings-off"
          >
            <span className="connection-settings-label">connections on</span>
            <span
              className={`${
                settings.connections
                  ? "active connection-settings-checkbox"
                  : "connection-settings-checkbox"
              }`}
            >
              <b />
            </span>
            <input
              onChange={() => {
                setSettings({
                  ...settings,
                  connections: !settings.connections
                });
              }}
              value={settings.connections}
              id="connection-settings-off"
              type="checkbox"
            />
          </label>
        </fieldset>
      </div>
    </div>
  );
};
