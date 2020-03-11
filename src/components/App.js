import React, { useState, useEffect, createContext, useRef } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

// components
import { Preloader } from "./Preloader";
import { NoMobile } from "./NoMobile";
import { Home } from "./Home";
import { Signup } from "./Signup";
import { ContextMenu } from "./ContextMenu";

// error boundary
import ErrorBoundary from "./subcomponents/ErrorBoundary";

// managers
import { Minerva, MinervaArchive } from "./../utils/managers/MinervaInstance";
import { Typist } from "./../utils/misc";
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

// Minerva.clearStorage();
Minerva.clearSessionStorage();

export const globalContext = createContext(null);

// initial context containing minerva, the general-purpose state manager
// a db interface, an akashic record for storing data, and an audio interface
const initialContext = {
  minerva,
  db,
  AkashicRecord,
  audiomanager: new AudioManager()
};

const { Provider } = globalContext;

export const App = () => {
  const [windowLoaded, setWindowLoaded] = useState(false);

  // if minervas_akasha is in localstorage (a key which indicates the last logged-in user)
  // then this is not the user's first login. maybe change this to check ids in order to
  // support multiple users and set the flag independently for each one.
  const [firstLoad, setFirstLoad] = useState(
    (MinervaArchive.get("minervas_akasha") && false) || true
  );

  // flag for determining if the screen is too small
  const [tooSmall, setTooSmall] = useState(false);

  // flag that determines whether to take the user straight to the home screen or the main screen
  const [loggedIn, setLoggedIn] = useState(minerva.get("logged_in") || false);

  const [statusMessage, setStatusMessage] = useState({
    display: false,
    text: "",
    type: null
  });

  // context menu stuff
  const contextMenuElem = useRef(null);

  const [contextMenu, setContextMenu] = useState({
    position: { x: 0, y: 0 },
    display: false
  });

  const handleContextMenu = (e, hideMenu) => {
    e.preventDefault();

    return setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      display: hideMenu
    });
  };

  // set up hotkey listeners on initial load, as well as type out the status text
  useEffect(
    () => {
      setupHotkeys();
      new Typist(setStatusText, statusMessage.text).scramble();
    },
    [statusMessage.text]
  );

  // log user in or out
  useEffect(
    () => {
      if (loggedIn) {
        minerva.set("logged_in", true, "user");

        setFirstLoad(false);
      } else if (!loggedIn) {
        minerva.set("logged_in", false, "user");
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
      new Typist(setStatusText, statusMessage.text).scramble();
    },
    [statusMessage.text]
  );

  const [statusText, setStatusText] = useState(statusMessage.text);

  // test for screen getting too small (< 1200px)
  const smallScreen = window.matchMedia("(max-width: 1200px)");

  const smallScreenTest = e => setTooSmall(e.matches);

  // listen for screen resize
  smallScreen.addListener(smallScreenTest);

  if (windowLoaded) {
    // effects canvases / other graphical elements here / crt filter
    // brightness / color filters / cursor click effects outside switch
    return (
      <ErrorBoundary>
        <Provider
          value={{
            ...initialContext,
            statusMessage,
            setStatusMessage,
            statusText,
            setStatusText
          }}
        >
          <Router>
            <section
              // onContextMenu={e => {
              //   handleContextMenu(e, true);
              // }}
              onClick={e => {
                handleContextMenu(e, false);
              }}
            >
              <section id="status-message">
                <div className={statusMessage.type}>
                  <div>{statusText}</div>
                </div>
              </section>
              {contextMenu.display && (
                <ContextMenu
                  contextMenuElem={contextMenuElem}
                  contextMenu={contextMenu}
                />
              )}

              <section id="filters">
                <div id="crt-overlay" />
              </section>

              {/* godmessage */}
              <section id="godmessage" />

              {!loggedIn && firstLoad && <Redirect to="/signup" />}

              {!firstLoad && !loggedIn && <Redirect to="/login" />}

              {!firstLoad && loggedIn && <Redirect to="/" />}

              <Switch>
                {/* main screen */}
                <Route
                  exact
                  path="/"
                  render={routeProps => <Home routeProps={routeProps} />}
                />

                {/* signup screen */}
                <Route
                  exact
                  path="/signup"
                  render={routeProps => (
                    <Signup
                      routeProps={routeProps}
                      loginScreenInstead={false}
                      statusMessage={statusMessage}
                      setStatusMessage={setStatusMessage}
                      setStatusText={setStatusText}
                      setLoggedIn={setLoggedIn}
                    />
                  )}
                />

                {/* login component */}
                <Route
                  exact
                  path="/login"
                  render={routeProps => (
                    <Signup
                      routeProps={routeProps}
                      loginScreenInstead={true}
                      statusMessage={statusMessage}
                      setStatusMessage={setStatusMessage}
                      setStatusText={setStatusText}
                      setLoggedIn={setLoggedIn}
                    />
                  )}
                />
              </Switch>

              <section id="effects-canvas">
                {/* effects canvas */}
                {/*<canvas ref={fxCanvasElem} />*/}
              </section>
            </section>
          </Router>
        </Provider>
      </ErrorBoundary>
    );
  }

  // for now, if the screen is too small, just show a basic message warning
  // the user to use a larger device
  if (tooSmall) return <NoMobile />;

  // preloader is returned if the window is not too small, and the windowloaded flag is false.
  return (
    <Provider value={initialContext}>
      <Preloader setWindowLoaded={setWindowLoaded} />
    </Provider>
  );
};
