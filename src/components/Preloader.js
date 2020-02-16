import React, { useState, useEffect } from "react";
import { Typist } from "./../utils/misc";

// const text = "minerva's akasha.";
const text = "loading...";

export const Preloader = props => {
  const { setWindowLoaded } = props;

  const [preloaderText, setPreloaderText] = useState("");
  const [panelsActive, setPanelsActive] = useState(false);

  // scramble the loading screen text. but only once!
  useEffect(() => {
    let loadingTypist = new Typist(setPreloaderText, text);
    loadingTypist.scramble();
  }, []);

  // TODO: remove this timeout hell
  setTimeout(() => {
    setPanelsActive(true);

    setTimeout(() => {
      setPreloaderText("complete.");
      setTimeout(() => setWindowLoaded(true), 2400);
    }, 5500);
  }, 2000);

  return (
    <section
      id="preloader-container"
      className={panelsActive ? "active" : "inactive"}
    >
    <section id="filters">
      <div id="crt-overlay" />
    </section>

      <section
        className={
          panelsActive ? "preloader-background active" : "preloader-background"
        }
      >
        <div />
        <div />
      </section>
      <section
        className={
          panelsActive
            ? "preloader-middleground active"
            : "preloader-middleground"
        }
      >
        <div className="preloader-row-top">{preloaderText}</div>
        <div className="preloader-row-top">{preloaderText}</div>
        <div className="preloader-row-top">{preloaderText}</div>
        <div className="preloader-row-middle">{preloaderText}</div>
        <div className="preloader-row-middle">{preloaderText}</div>
        <div className="preloader-row-middle">{preloaderText}</div>
        <div className="preloader-row-bottom">{preloaderText}</div>
        <div className="preloader-row-bottom">{preloaderText}</div>
        <div className="preloader-row-bottom">{preloaderText}</div>
      </section>
      <section
        className={
          panelsActive ? "preloader-foreground active" : "preloader-foreground"
        }
      >
        <div
          className={
            panelsActive
              ? "loading-indicator-container active"
              : "loading-indicator-container"
          }
        >
          <div className="loading-spinner" />
        </div>
      </section>
    </section>
  );
};
