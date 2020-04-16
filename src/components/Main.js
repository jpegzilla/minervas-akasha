import React, { memo, useMemo, Fragment } from "react";

const MainComponent = props => {
  const {
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
    contextMenu,
    ContextMenu,
    contextMenuElem,
    setStatusMessage,
    statusText,
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
  } = props;
  return (
    <ErrorBoundary>
      <Provider
        value={{
          ...initialContext,
          statusMessage,
          setStatusMessage,
          statusText,
          setStatusText,
          loggedIn,
          setLoggedIn,
          globalVolume,
          setGlobalVolume,
          resetStatusText,
          renderConList,
          setRenderConList
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
              {minerva &&
                minerva.settings &&
                minerva.settings.filters && (
                  <Fragment>
                    {minerva.settings.filters.noise && (
                      <div id="filters-noise" />
                    )}
                    {minerva.settings.filters.crt && <div id="crt-overlay" />}
                  </Fragment>
                )}
            </section>

            {/* godmessage */}
            <section id="godmessage" />

            {!loggedIn && firstLoad && <Redirect to="/signup" />}

            {!loggedIn && !firstLoad && <Redirect to="/login" />}

            {!firstLoad && loggedIn && minerva.user && <Redirect to="/" />}

            <Switch>
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
                render={routeProps => {
                  return (
                    !firstLoad && (
                      <Signup
                        routeProps={routeProps}
                        loginScreenInstead={true}
                        statusMessage={statusMessage}
                        setStatusMessage={setStatusMessage}
                        setStatusText={setStatusText}
                        setLoggedIn={setLoggedIn}
                      />
                    )
                  );
                }}
              />

              {/* main screen */}
              <Route
                exact
                path="/"
                render={routeProps =>
                  minerva &&
                  minerva.record &&
                  minerva.record.records && (
                    <Home routeProps={routeProps} setLoggedIn={setLoggedIn} />
                  )
                }
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
};

export const Main = memo(MainComponent);
