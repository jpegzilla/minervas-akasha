import React, {
  useState,
  useEffect,
  createContext,
  useRef,
  useContext
} from "react";
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
import { ParticleGenerator } from "./tasks/setupCanvasFx";

const dbPath =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "production";

// when to instantiate this?
const db = new DatabaseInterface(dbPath);

export const minerva = new Minerva(
  MinervaArchive.get("minerva_store") || {},
  db
);

// Minerva.clearStorage();
Minerva.clearSessionStorage();

export const globalContext = createContext(null);

const initialContext = {
  minerva,
  db,
  AkashicRecord,
  audiomanager: new AudioManager(),
  fxcanvas: new ParticleGenerator()
};

const { Provider } = globalContext;

export const App = () => {
  const [windowLoaded, setWindowLoaded] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    position: { x: 0, y: 0 },
    display: false
  });

  const [firstLoad, setFirstLoad] = useState(
    (MinervaArchive.get("minervas_akasha") && false) || true
  );

  const [tooSmall, setTooSmall] = useState(false);
  const [loggedIn, setLoggedIn] = useState(minerva.get("logged_in") || false);

  const contextMenuElem = useRef(null);
  const fxCanvasElem = useRef(null);

  const handleContextMenu = (e, hideMenu) => {
    e.preventDefault();

    return setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      display: hideMenu
    });
  };

  // set up hotkey listeners on initial load
  useEffect(() => {
    setupHotkeys();
  }, []);

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

  const [godMessage, setGodMessage] = useState({
    display: false,
    text: null
  });

  const [statusMessage, setStatusMessage] = useState({
    display: false,
    text: "",
    type: null
  });

  useEffect(
    () => {
      new Typist(setStatusText, statusMessage.text).scramble();
    },
    [statusMessage.text]
  );

  const [statusText, setStatusText] = useState(statusMessage.text);

  useEffect(() => {
    new Typist(setStatusText, statusMessage.text).scramble();
  }, []);

  // test for screen getting too small
  const smallScreen = window.matchMedia("(max-width: 1200px)");

  const smallScreenTest = e => setTooSmall(e.matches);

  smallScreen.addListener(smallScreenTest);

  if (windowLoaded) {
    // if (true) {
    // effects canvases / other graphical elements here / crt filter
    // brightness / color filters / cursor click effects outside switch
    return (
      <ErrorBoundary>
        <Provider value={initialContext}>
          <Router>
            <section
              onContextMenu={e => {
                handleContextMenu(e, true);
              }}
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
              <section />

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

  return (
    <Provider value={initialContext}>
      <Preloader setWindowLoaded={setWindowLoaded} />
    </Provider>
  );
};
