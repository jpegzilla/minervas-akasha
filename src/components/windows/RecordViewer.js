import React, { useState, useEffect, useContext } from "react";

import { uuidv4 } from "./../../utils/misc";

import { globalContext } from "./../App";

export const RecordViewer = props => {
  const { setWindows } = props;
  const { minerva } = useContext(globalContext);
  const [records, setRecords] = useState(minerva.record.records);

  const [recordData, setRecordData] = useState({
    records: [],
    length: 0
  });

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

    setWindows([...minerva.windows]);
  };

  useEffect(
    () => {
      setRecords(minerva.record.records);
    },
    [minerva.record.records]
  );

  useEffect(
    () => {
      let counter = 0;
      let extant = [];
      for (let [, v] of Object.entries(records)) {
        if (v.length) {
          counter += v.length;
          v.forEach(item => extant.push(item));
        }
      }

      setRecordData({
        records: extant,
        length: counter
      });
    },
    [records]
  );

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
          {recordData.records.map((item, i) => {
            // looks sort of like this: {id: uuidv4(), name: "node", data: {...}}
            const { type, tags, name } = item;

            // if a type starts with a vowel, use an instead of a when referring to it
            const aOrAn = ["a", "e", "i", "o", "u", "y"].some(item =>
              type.startsWith(item)
            )
              ? "an"
              : "a";

            const tagsToShow = tags.length
              ? tags.map(tag => `"${tag.name}"`).join(", ")
              : "none";

            return (
              <div
                key={`type-${i}-record`}
                onDoubleClick={e => handleOpenRecord(e, item)}
                title={
                  `${aOrAn} ${type}.
tags: ${tagsToShow}
name: ${name}` || "null"
                }
                className="record-viewer-record record-box"
              >
                {type}
              </div>
            );
          })}
        </section>
      </section>
      <footer className="record-viewer-footer">
        <div>record count: {recordData.length}</div>
      </footer>
    </div>
  );
};
