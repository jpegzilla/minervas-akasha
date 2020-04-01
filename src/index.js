import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";
import { NoMobile } from "./components/NoMobile";
import "./components/styles/main.min.css";
import { mobilecheck } from "./utils/misc";
import "./components/tasks/setupErrorHandling";
// check support for necessary technologies
import "./components/tasks/checkSupports";

// for now, rendering a component that tells the user they can't use a mobile device
// if they try to load the site on a mobile device
if (mobilecheck())
  ReactDOM.render(<NoMobile />, document.getElementById("root"));
else ReactDOM.render(<App />, document.getElementById("root"));
