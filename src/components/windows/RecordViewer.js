import React, { useState, useEffect, useContext } from "react";

import { globalContext } from "./../App";

export const RecordViewer = props => {
  const { minerva } = useContext(globalContext);

  const handleOpenRecord = (e, item) => {
    // make sure the window isn't already open
    const foundItem = minerva.windows.find(
      i =>
        i.component === "DataStructure" && i.componentProps.structId === item.id
    );

    if (foundItem) return;

    const itemToOpen = minerva.record.records[item.type].find(
      i => i.id === item.id
    );

    const { id, type } = itemToOpen;

    const struct = {
      title: "datastructure",
      state: "restored",
      stringType: "Window",
      component: "DataStructure",
      componentProps: {
        type,
        structId: id
      },
      belongsTo: minerva.user.id,
      id: uuidv4(),
      position: {
        x: 100,
        y: 100
      }
    };

    minerva.setWindows([...minerva.windows, struct]);

  // useEffect(
  //   () => {
  //     console.log(minerva.windows);
  //   },
  //   [minerva.windows]
  // );

  return (
    <div className="record-viewer-container">
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
