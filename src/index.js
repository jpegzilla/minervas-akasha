import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import NoMobile from './components/NoMobile'
import './components/styles/main.min.css'
import { mobilecheck } from './utils/misc'
import './components/tasks/setupErrorHandling'
// check support for necessary technologies
import './components/tasks/checkSupports'
import './components/tasks/setupExperiments'
import './components/tasks/setupPerformanceTesting'

// service worker
// import * as serviceWorker from "./serviceWorker";

// for now, rendering a component that tells the user they can't use a mobile device
// if they try to load the site on a mobile device
if (mobilecheck())
  ReactDOM.render(<NoMobile />, document.getElementById('root'))
else ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
