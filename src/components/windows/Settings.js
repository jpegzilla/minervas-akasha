import React, { useState, useEffect, useContext } from "react";

import { globalContext } from "./../App";

export const Settings = props => {
  const { minerva, setGlobalVolume } = useContext(globalContext);
  const [settings, setSettings] = useState(minerva.settings);
  const { settingsMenuRef } = props;

  useEffect(
    () => {
      minerva.changeSetting(settings);
      setGlobalVolume(settings);
    },
    [settings, minerva, setGlobalVolume]
  );

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
          <label
            htmlFor="volume-control-master"
            title="master volume for all media containing audio."
          >
            <span>
              master volume {settings.volume.master.toString().padStart(3, "0")}
              %
            </span>
            <input
              onChange={e => {
                e.stopPropagation();
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
          <label
            htmlFor="volume-control-effect"
            title="volume for special effects sounds, such as the typing sound associated with popup messages, or the sound that plays when an error occurs."
          >
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
          <label
            htmlFor="volume-control-voice"
            title="the volume for minerva's voice, which is heard only at certain times..."
          >
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

        {/* connection settings */}
        <fieldset className="checkbox-settings">
          <legend>connections</legend>

          <label
            title="allows you to see content procured by other users of this software."
            htmlFor="connection-settings-off"
          >
            <span className="checkbox-settings-label">
              {settings.connections ? "connections on" : "connections off"}
            </span>
            <span
              className={`${
                settings.connections
                  ? "active checkbox-settings-checkbox"
                  : "checkbox-settings-checkbox"
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

        {/* autoplay settings */}
        <fieldset className="checkbox-settings">
          <legend>autoplay media</legend>

          <label
            title="allows audio and videos to start playing automatically when they load."
            htmlFor="autoplay-settings-off"
          >
            <span className="checkbox-settings-label">
              {settings.autoplayMedia ? "autoplay on" : "autoplay off"}
            </span>
            <span
              className={`${
                settings.autoplayMedia
                  ? "active checkbox-settings-checkbox"
                  : "checkbox-settings-checkbox"
              }`}
            >
              <b />
            </span>
            <input
              onChange={() => {
                console.log(settings);
                setSettings({
                  ...settings,
                  autoplayMedia: !settings.autoplayMedia
                });
              }}
              value={settings.autoplayMedia}
              id="autoplay-settings-off"
              type="checkbox"
            />
          </label>
        </fieldset>

        {/* filter display settings */}
        <fieldset className="checkbox-settings">
          <legend>display filters</legend>

          {/* crt filter */}
          <label
            title="enables / disables crt filter. disabling may improve performance if you are having issues."
            htmlFor="filter-crt-settings-off"
          >
            <span className="checkbox-settings-label">
              {settings.filters.crt ? "crt filter on" : "crt filter off"}{" "}
            </span>
            <span
              className={`${
                settings.filters.crt
                  ? "active checkbox-settings-checkbox"
                  : "checkbox-settings-checkbox"
              }`}
            >
              <b />
            </span>
            <input
              onChange={() => {
                setSettings({
                  ...settings,
                  filters: {
                    ...settings.filters,
                    crt: !settings.filters.crt
                  }
                });
              }}
              value={settings.filters}
              id="filter-crt-settings-off"
              type="checkbox"
            />
          </label>

          {/* noise filter */}
          <label
            title="enables / disables noise filter. disabling may improve performance if you are having issues."
            htmlFor="filter-noise-settings-off"
          >
            <span className="checkbox-settings-label">
              {settings.filters.noise ? "noise filter on" : "noise filter off"}{" "}
            </span>
            <span
              className={`${
                settings.filters.noise
                  ? "active checkbox-settings-checkbox"
                  : "checkbox-settings-checkbox"
              }`}
            >
              <b />
            </span>
            <input
              onChange={() => {
                console.log(settings);
                setSettings({
                  ...settings,
                  filters: {
                    ...settings.filters,
                    noise: !settings.filters.noise
                  }
                });
              }}
              value={settings.filters.noise}
              id="filter-noise-settings-off"
              type="checkbox"
            />
          </label>
        </fieldset>
      </div>
    </div>
  );
};
