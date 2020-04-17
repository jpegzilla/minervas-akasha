import React, { useState, useEffect, useContext } from "react";
import Typist from "./../utils/managers/Typist";
import { globalContext } from "./App";
import PropTypes from "prop-types";

// audio files
import click from "./../assets/audio/computer/click-short.wav";
import noise from "./../assets/audio/computer/click-noise.wav";
import e_one from "./../assets/audio/computer/error-one.wav";
import s_one from "./../assets/audio/computer/success-dist.wav";
import s_two from "./../assets/audio/computer/success-two.wav";
import k_one from "./../assets/audio/computer/keypress-one.wav";
import w_one from "./../assets/audio/computer/warn-one.wav";
import su_two from "./../assets/audio/computer/startup-two.wav";
import c_one from "./../assets/audio/computer/close-one.wav";
import o_one from "./../assets/audio/computer/open-one.wav";
import i_one from "./../assets/audio/computer/intro.wav";

// tasks
import { setup } from "./tasks/setupSfx";

// const text = "minerva's akasha.";
const text = "loading...";

const Preloader = props => {
  const { setWindowLoaded } = props;
  const { audiomanager, minervaVoice } = useContext(globalContext);

  const [preloaderText, setPreloaderText] = useState("");

  // this is what makes the panels do their animation
  const [panelsActive, setPanelsActive] = useState(false);

  // when the following three are true, then the preloader is complete
  const [audioLoaded, setAudioLoaded] = useState(false); // after this one, set panels to active
  const [voiceLoaded, setVoiceLoaded] = useState(false);
  const [winLoaded, setWinLoaded] = useState(false);

  const [finished, setFinished] = useState(false);

  // scramble the loading screen text.
  useEffect(
    () => {
      let loadingTypist = new Typist(setPreloaderText, text);
      loadingTypist.scramble(false);

      // load all audio files
      const files = [
        { file: click, name: "click" },
        { file: noise, name: "noise" },
        { file: e_one, name: "e_one" },
        { file: s_one, name: "s_one" },
        { file: s_two, name: "s_two" },
        { file: k_one, name: "k_one" },
        { file: w_one, name: "w_one" },
        { file: c_one, name: "c_one" },
        { file: o_one, name: "o_one" },
        { file: su_two, name: "su_two" },
        { file: i_one, name: "i_one" }
      ];

      // longest running load time is here. must load all these files
      audiomanager.load(files).then(() => {
        setAudioLoaded(true);
        // setPreloaderText("complete.");
        // setFinished(true);

        // setTimeout(() => {
        //   setWindowLoaded(true);
        // }, 2500);
      });

      // this one is shorter
      minervaVoice.load(minervaVoice.voiceSamples).then(() => {
        setVoiceLoaded(true);
        // setPanelsActive(true);
      });

      setup(audiomanager);

      return () => void (window.onload = null);
    },
    [audiomanager, minervaVoice]
  );

  // TODO: remove this timeout hell
  // setTimeout(() => {
  //   setPanelsActive(true);
  //
  //   setTimeout(() => {
  //     setPreloaderText("complete.");
  //     setTimeout(() => {
  //       if (audioLoaded && winLoaded && voiceLoaded) setFinished(true);
  //       setWindowLoaded(true);
  //     }, 2400);
  //   }, 5500);
  // }, 2000);

  // on window load, set winloaded to true. both this and
  // audioloaded must be true in order to end the preloader.
  window.onload = () => {
    setWinLoaded(true);
    setWindowLoaded(true);
  };

  // useEffect(
  //   () => {
  //     if (finished && voiceLoaded) setWindowLoaded(true);
  //   },
  //   [setWindowLoaded, finished, voiceLoaded]
  // );

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

export default Preloader;

Preloader.propTypes = {
  setWindowLoaded: PropTypes.func
};
