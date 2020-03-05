import React, { useState, useEffect, useContext } from "react";

import { globalContext } from "./../App";

export const RecordViewer = props => {
  const { minerva } = useContext(globalContext);

  // useEffect(
  //   () => {
  //     console.log(minerva.windows);
  //   },
  //   [minerva.windows]
  // );

  return (
    <div>
      <header>
        <div className="record-viewer-navigation">navigation</div>
        <div className="record-viewer-tabs">tabs</div>
      </header>
      <section className="record-viewer-main">
        <section className="record-viewer-sidebar">
          <div>sidebar</div>
        </section>
        <section className="record-viewer-records">
          <div>records</div>
        </section>
      </section>
      <footer className="record-viewer-footer">footer</footer>
    </div>
  );
};
