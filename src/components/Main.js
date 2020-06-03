import React, { useState, useEffect, Fragment } from 'react'

import NotFound from './NotFound'
import withToastProvider from './../providers/withToastProvider'
import useToast from './../hooks/useToast'

import PropTypes from 'prop-types'

const Main = props => {
  const {
    ErrorBoundary,
    Provider,
    initialContext,
    Router,
    handleContextMenu,
    loggedIn,
    firstLoad,
    minerva,
    Signup,
    Home,
    contextMenu,
    ContextMenu,
    contextMenuElem,
    statusText,
    setLoggedIn,
    globalVolume,
    setGlobalVolume,
    renderConList,
    setRenderConList,
    Redirect,
    Switch,
    Route,
  } = props

  const [filterRefresh, setFilterRefresh] = useState({})

  minerva.setFilterRefresh = setFilterRefresh

  useEffect(() => {}, [filterRefresh])

  return (
    <ErrorBoundary>
      <Provider
        value={{
          ...initialContext,
          statusText,
          loggedIn,
          setLoggedIn,
          globalVolume,
          setGlobalVolume,
          renderConList,
          setRenderConList,
          useToast,
        }}>
        <Router>
          <section
            // onContextMenu={e => {
            //   handleContextMenu(e, true);
            // }}
            onClick={e => {
              handleContextMenu(e, false)
            }}>
            {contextMenu.display && (
              <ContextMenu
                contextMenuElem={contextMenuElem}
                contextMenu={contextMenu}
              />
            )}

            <section id='filters'>
              {minerva && minerva.settings && minerva.settings.filters && (
                // effects canvases / other graphical elements here / crt filter // brightness / color filters / cursor click effects outside switch
                <Fragment>
                  {minerva.settings.filters.noise && <div id='filters-noise' />}
                  {minerva.settings.filters.crt && <div id='crt-overlay' />}
                </Fragment>
              )}
            </section>

            {/* godmessage */}
            <section id='godmessage' />

            {!loggedIn && firstLoad && <Redirect to='/signup' />}

            {!loggedIn && !firstLoad && <Redirect to='/login' />}

            {!firstLoad && loggedIn && minerva.user && <Redirect to='/' />}

            <Switch>
              {/* signup screen */}
              <Route
                exact
                path='/signup'
                render={routeProps => (
                  <Signup
                    routeProps={routeProps}
                    loginScreenInstead={false}
                    setLoggedIn={setLoggedIn}
                  />
                )}
              />

              {/* login screen */}
              <Route
                exact
                path='/login'
                render={routeProps => {
                  return (
                    <Signup
                      routeProps={routeProps}
                      loginScreenInstead={true}
                      setLoggedIn={setLoggedIn}
                    />
                  )
                }}
              />

              {/* main screen */}
              <Route
                exact
                path='/'
                render={routeProps =>
                  minerva &&
                  minerva.record &&
                  minerva.record.records && (
                    <Home routeProps={routeProps} setLoggedIn={setLoggedIn} />
                  )
                }
              />

              {/* 404 screen */}
              <Route
                render={routeProps => <NotFound routeProps={routeProps} />}
              />
            </Switch>

            <section id='effects-canvas'>
              {/* effects canvas */}
              {/*<canvas ref={fxCanvasElem} />*/}
            </section>
          </section>
        </Router>
      </Provider>
    </ErrorBoundary>
  )
}

export default withToastProvider(Main)

Main.propTypes = {
  ErrorBoundary: PropTypes.func,
  Provider: PropTypes.object,
  initialContext: PropTypes.object,
  Router: PropTypes.func,
  handleContextMenu: PropTypes.func,
  loggedIn: PropTypes.bool,
  firstLoad: PropTypes.bool,
  minerva: PropTypes.object,
  Signup: PropTypes.object,
  Home: PropTypes.object,
  contextMenu: PropTypes.exact({
    position: PropTypes.exact({ x: PropTypes.number, y: PropTypes.number }),
    display: PropTypes.bool,
  }),
  ContextMenu: PropTypes.func,
  contextMenuElem: PropTypes.object,
  statusText: PropTypes.string,
  setLoggedIn: PropTypes.func,
  globalVolume: PropTypes.exact({
    master: PropTypes.number,
    effect: PropTypes.number,
    voice: PropTypes.number,
  }),
  setGlobalVolume: PropTypes.func,
  renderConList: PropTypes.oneOfType([PropTypes.string, prop => prop === null]),
  setRenderConList: PropTypes.func,
  Redirect: PropTypes.func,
  Switch: PropTypes.func,
  Route: PropTypes.func,
}
