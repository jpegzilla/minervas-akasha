import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import { Preloader } from "./Preloader";
import { NoMobile } from "./NoMobile";
import { Home } from "./Home";
import { Signup } from "./Signup";
import { Login } from "./Login";

import { Minerva } from "./../utils/managers/MinervaInstance";
import Database from "../utils/managers/Database";

// when to instantiate this?
const db = new Database("path here"); // .connect()

const minerva = new Minerva({}, db);

// Minerva.clearStorage();

export const App = () => {
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [tooSmall, setTooSmall] = useState(false);

  const [godMessage, setGodMessage] = useState({
    display: false,
    text: null
  });

  const [statusMessage, setStatusMessage] = useState({
    display: false,
    text: " ",
    type: null
  });

  // test for screen getting too small
  const smallScreen = window.matchMedia("(max-width: 1200px)");

  const smallScreenTest = e => setTooSmall(e.matches);

  smallScreen.addListener(smallScreenTest);

  // make a setwindowloaded function that can be passed to the preloader
  // component so the preloader itself can dictate when it should be
  // removed

  // if (windowLoaded) {
  if (true) {
    return (
      <Router>
        <section className={statusMessage.type} id="status-message">
          <div>{statusMessage.text}</div>
        </section>

        <Switch>
          // main screen
          <Route exact path="/home">
            <Home minerva={minerva} />
          </Route>
          // signup screen
          <Route exact path="/">
            <Signup
              minerva={minerva}
              statusMessage={statusMessage}
              setStatusMessage={setStatusMessage}
            />
          </Route>
          // login component
          <Route exact path="/login">
            <Login
              minerva={minerva}
              statusMessage={statusMessage}
              setStatusMessage={setStatusMessage}
            />
          </Route>
        </Switch>
      </Router>
    );
  }

  // for now, if the screen is too small, just show a basic message warning
  // the user to use a larger device
  if (tooSmall) return <NoMobile />;

  // return <Preloader setWindowLoaded={setWindowLoaded} />;
};
