import React, { useState, useEffect, createContext, useRef, memo } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

// components
import Preloader from "./Preloader";
import NoMobile from "./NoMobile";
import Home from "./Home";
import Signup from "./Signup";
import ContextMenu from "./ContextMenu";
import Main from "./Main";

// utils
import { hasDatePassed } from "./../utils/dateUtils";

// error boundary
import ErrorBoundary from "./subcomponents/ErrorBoundary";

// managers
import { Minerva, MinervaArchive } from "./../utils/managers/MinervaInstance";
import MinervaVoice from "./../utils/managers/MinervaVoice";
import Typist from "./../utils/managers/Typist";
import DatabaseInterface from "../utils/managers/Database";
import AkashicRecord from "./../utils/structures/AkashicRecord";
import AudioManager from "./../utils/audiomanager";

// tasks
import setupHotkeys from "./tasks/setupHotkeys";

// production db address is temporary.
const dbPath =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "production";

// instantiate db interface for global context
const db = new DatabaseInterface(dbPath);

// exporting an instance of minerva for use across multiple modules,
// mainly so I can use it in files that are not react components and
// thus they cannot use the reference to minerva in the global context.
export const minerva = new Minerva(
  MinervaArchive.get("minerva_store") || {},
  db
);

export const minervaVoice = new MinervaVoice(minerva);

minerva.voice = minervaVoice;

// Minerva.clearStorage();
Minerva.clearSessionStorage();

export const globalContext = createContext(null);

// initial context containing minerva, the general-purpose state manager
// a db interface, an akashic record for storing data, and an audio interface
const initialContext = {
  minerva,
  db,
  AkashicRecord,
  audiomanager: new AudioManager(),
  minervaVoice
};

const { Provider } = globalContext;

const App = () => {
  const [windowLoaded, setWindowLoaded] = useState(false);

  // if minervas_akasha is in localstorage (a key which indicates the last logged-in user)
  // then this is not the user's first login. maybe change this to check ids in order to
  // support multiple users and set the flag independently for each one.

  // thinking about just checking to see if minerva_store already exists, meaning someone
  // (not necessarily the current user) has logged in.
  const [firstLoad, setFirstLoad] = useState(
    MinervaArchive.get("minerva_store") ? false : true
  );

  // flag for determining if the screen is too small
  const [tooSmall, setTooSmall] = useState(false);

  // flag that determines whether to take the user straight to the home screen or the main screen
  let loginExpired = true;

  if (minerva.user && minerva.user.id) {
    loginExpired = minerva.get(`user:${minerva.user.id}:token`)
      ? hasDatePassed(minerva.get(`user:${minerva.user.id}:token`).expires)
      : false;
  }

  const [loggedIn, setLoggedIn] = useState(
    loginExpired === true ? false : minerva.get("logged_in") || false
  );

  // for controlling volume throughout the application
  const [globalVolume, setGlobalVolume] = useState(
    minerva.settings
      ? minerva.settings.volume
      : { master: 100, effect: 100, voice: 100 }
  );

  // status message types: success, error / fail, warning
  const [statusMessage, setStatusMessage] = useState({
    display: false,
    text: "",
    type: null
  });

  // used to force connection lists to rerender
  const [renderConList, setRenderConList] = useState("");

  // context menu stuff
  const contextMenuElem = useRef(null);

  const [contextMenu, setContextMenu] = useState({
    position: { x: 0, y: 0 },
    display: false
  });

  /**
   * handleContextMenu - shows the context menu at a certain position
   *
   * @param {object} e         the contextmenu event
   * @param {boolean} showMenu use false to hide the menu, true to show it
   */
  const handleContextMenu = (e, showMenu) => {
    e.preventDefault();

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      display: showMenu
    });
  };

  // set up hotkey listeners on initial load, as well as type out the status text
  useEffect(() => {
    setupHotkeys();
  }, []);

  // log user in or out
  useEffect(
    () => {
      if (!minerva.user) return void minerva.set("logged_in", false);

      if (loggedIn) {
        minerva.set("logged_in", true);

        setFirstLoad(false);
      } else if (!loggedIn) {
        minerva.set("logged_in", false);
      }
    },
    [loggedIn]
  );

  // message that covers screen and shows in the center. only used for special messages
  // const [godMessage, setGodMessage] = useState({
  //   display: false,
  //   text: null
  // });

  // whenever statusmessage.text changes, type out the new messge using typist.
  useEffect(
    () => {
      new Typist(setStatusText, statusMessage.text).talkType(minerva);
    },
    [statusMessage.text]
  );

  const [statusText, setStatusText] = useState(statusMessage.text);

  // test for screen getting too small (< 1200px)
  const smallScreen = window.matchMedia("(max-width: 1200px)");

  const smallScreenTest = e => setTooSmall(e.matches);

  // listen for screen resize
  smallScreen.addListener(smallScreenTest);

  // function to reset status text
  const resetStatusText = () => {
    setStatusText("");
    setStatusMessage({ display: false, text: "", type: null });
  };

  if (windowLoaded) {
    const props = {
      ErrorBoundary,
      Provider,
      initialContext,
      Router,
      handleContextMenu,
      statusMessage,
      loggedIn,
      firstLoad,
      minerva,
      Signup,
      Home,
      statusText,
      contextMenu,
      ContextMenu,
      contextMenuElem,
      setStatusMessage,
      setStatusText,
      setLoggedIn,
      globalVolume,
      setGlobalVolume,
      resetStatusText,
      renderConList,
      setRenderConList,
      Redirect,
      Switch,
      Route
    };
    return <Main {...props} />;
  }

  // for now, if the screen is too small, just show a basic message warning
  // the user to use a larger device
  if (tooSmall) return <NoMobile />;

  // preloader is returned if the window is not too small, and the windowloaded flag is false.
  return (
    <ErrorBoundary>
      <Provider value={initialContext}>
        <Preloader setWindowLoaded={setWindowLoaded} />
      </Provider>
    </ErrorBoundary>
  );
};

export default memo(App);
