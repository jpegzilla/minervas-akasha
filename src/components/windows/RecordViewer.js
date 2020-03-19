import React, { useState, useEffect, useContext } from "react";

import { uuidv4 } from "./../../utils/misc";

import { globalContext } from "./../App";
import { makeStruct } from "../../utils/managers/StructureMap";

export const RecordViewer = props => {
  const { setWindows } = props;
  const { minerva } = useContext(globalContext);

  const [records, setRecords] = useState(minerva.record.records);
  const [statusBar, setStatusBar] = useState();

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

    // move objects like this to structuremap to dry things up
    const struct = makeStruct(type, id, minerva, uuidv4);

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
    <div
      onClick={() => void setStatusBar(false)}
      className="record-viewer-container"
    >
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

            const nameToShow =
              name === type ? type : name.substring(0, 7).padEnd(10, ".");

            // if a type starts with a vowel, use an instead of a when referring to it
            const aOrAn = ["a", "e", "i", "o", "u", "y"].some(item =>
              type.startsWith(item)
            )
              ? "an"
              : "a";
            let tagsToShow;

            if (tags.length === 0) {
              tagsToShow = "none";
            } else if (tags.length > 3) {
              tagsToShow =
                tags
                  .map(tag => `${tag.name}`)
                  .slice(0, 3)
                  .join(", ") + ` + ${tags.length - 3} more`;
            } else if (tags.length > 0) {
              tagsToShow = tags.map(tag => `${tag.name}`).join(", ");
            }

            let message = { title: "no file information" };

            if (item.data) {
              if (item.data.file) {
                const { title, humanSize, mime, ext } = item.data.file;

                message = {
                  title,
                  humanSize,
                  mime,
                  ext
                };
              }
            }

            return (
              <div
                key={`type-${i}-record`}
                onClick={e => {
                  e.stopPropagation();

                  const m = Object.values(message).join(" ⦚ ");

                  return void setStatusBar({
                    message: `information: ${m}`
                  });
                }}
                onDoubleClick={e => void handleOpenRecord(e, item)}
                title={
                  `${aOrAn} ${type}.
tags: ${tagsToShow}
name: ${name}` || "null"
                }
                className="record-viewer-record record-box"
              >
                {nameToShow}
              </div>
            );
          })}
        </section>
      </section>
      <footer className="record-viewer-footer">
        {statusBar ? (
          <div>{statusBar.message}</div>
        ) : (
          <div>record count: {recordData.length}</div>
        )}
      </footer>
    </div>
  );
};
