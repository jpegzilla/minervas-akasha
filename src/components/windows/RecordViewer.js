import React, {
  useState,
  useEffect,
  useContext,
  memo,
  Fragment,
  useRef
} from "react";

import PropTypes from "prop-types";

import { uuidv4 } from "./../../utils/misc";

import { globalContext } from "./../App";
import { makeStruct } from "../../utils/managers/StructureMap";
import searchAllRecords from "./../../utils/commands/utils/searchAllRecords";

const RecordViewer = props => {
  const { setWindows, id } = props;

  const { minerva } = useContext(globalContext);

  const [records, setRecords] = useState(minerva.record.records);
  const [recordsToShow, setRecordsToShow] = useState(
    Object.keys(minerva.record.records)
  );
  const [statusBar, setStatusBar] = useState({ message: "", item: {} });

  const [recordData, setRecordData] = useState({
    records: [],
    length: 0
  });

  const allRecords = Object.values(minerva.record.records).flat(Infinity);

  const searchQuery = useRef();
  const searchMime = useRef();
  const searchRecords = () => {
    const query = searchQuery.current.value;
    const mime = searchMime.current.value || "any";
    const type = "any";
    const usingMimeOption = mime === "any" ? false : true;

    const matches = searchAllRecords(
      minerva,
      { query, type, mime },
      {
        usingMimeOption,
        usingTypeOption: false
      }
    );

    setRecordData({
      records: matches.records,
      length: matches.count
    });
  };

  const handleOpenRecord = item => {
    // make sure the window isn't already open
    const foundItem = minerva.windows.find(
      i =>
        i.component === "DataStructure" && i.componentProps.structId === item.id
    );

    if (foundItem) {
      if (foundItem.state !== "minimized") return;
      else {
        minerva.setWindows(
          minerva.windows.map(window => {
            return window.id === foundItem.id
              ? { ...window, state: "restored" }
              : window;
          })
        );

        setWindows([...minerva.windows]);

        minerva.setActiveWindowId(foundItem.id);
      }

      return;
    }

    const itemToOpen = minerva.record.records[item.type].find(
      i => i.id === item.id
    );

    const { id, type } = itemToOpen;

    // move objects like this to structuremap to dry things up
    const struct = makeStruct(type, id, minerva, uuidv4);

    minerva.setWindows([...minerva.windows, struct]);

    setWindows([...minerva.windows]);

    // make the new window the active window
    minerva.setActiveWindowId(struct.id);
  };

  useEffect(
    () => {
      setRecords(minerva.record.records);
    },
    [minerva.record.records]
  );

  // when the status bar indicates that a record has been selected, show items in the sidebar
  const [sidebar, setSidebar] = useState({
    title: "nothing selected",
    records: []
  });

  // show the connected records in the sidebar
  useEffect(
    () => {
      const { item } = statusBar;

      if (Object.keys(item).length > 1) {
        const { connectedTo, name } = item;

        setSidebar({ title: name, records: Object.keys(connectedTo) });
      }
    },
    [statusBar]
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

  const handleFilterRecords = name => {
    if (name === "all" || `[["${name}"]]` === JSON.stringify([recordsToShow]))
      setRecordsToShow([...Object.keys(minerva.record.records)]);
    else setRecordsToShow([name]);
  };

  return (
    <div
      onClick={() => {
        setSidebar({ title: "nothing selected", records: {} });
        setStatusBar({ message: "", item: {} });
      }}
      className="record-viewer-container"
    >
      <header>
        <div className="record-viewer-navigation">
          <label
            htmlFor={`record-viewer-search-bar-${id}`}
            title="search all records"
          >
            <input
              type="text"
              placeholder="search records..."
              id={`record-viewer-search-bar-${id}`}
              onChange={searchRecords}
              ref={searchQuery}
            />
          </label>
          <label
            htmlFor={`record-viewer-search-bar-mime-${id}`}
            title="filter search by mime type"
          >
            <input
              type="text"
              placeholder="filter mime type"
              id={`record-viewer-search-bar-mime-${id}`}
              onChange={searchRecords}
              ref={searchMime}
            />
          </label>
        </div>
        <div className="record-viewer-tabs">
          <ul>
            {[...Object.keys(minerva.record.records), "all"].map((name, i) => {
              return (
                <li
                  className={`recordviewer-filter${
                    recordsToShow.length === 1 && recordsToShow.includes(name)
                      ? " active"
                      : recordsToShow.length > 1 && name === "all"
                        ? " active"
                        : ""
                  }`}
                  key={`${name}-${i}`}
                  onClick={() => void handleFilterRecords(name)}
                >
                  {name}
                </li>
              );
            })}
          </ul>
        </div>
      </header>
      <section className="record-viewer-main">
        <section
          onClick={e => void e.stopPropagation()}
          className="record-viewer-sidebar"
        >
          <div className="record-viewer-sidebar-container">
            <div className="record-viewer-sidebar-info">
              <header title={sidebar.title}>
                {sidebar.title.substring(0, 17).padEnd(20, ".")}
              </header>

              {sidebar.records.length > 0 ? (
                <Fragment>
                  <ul>
                    <li>record connections:</li>
                    {sidebar.records.map(item => {
                      const record = minerva.record.findRecordById(item);

                      const title = `name: ${record.name}\ntype: ${
                        record.type
                      }\ntags: ${
                        record.tags.length === 0
                          ? "none"
                          : record.tags.map(i => i.name).join(", ")
                      }\ncreated on ${new Date(record.createdAt).toLocaleString(
                        minerva.settings.dateFormat
                      )}\nupdated on ${new Date(
                        record.updatedAt
                      ).toLocaleString(minerva.settings.dateFormat)}`;

                      return (
                        <li
                          onDoubleClick={e => {
                            e.stopPropagation();

                            handleOpenRecord(record);
                          }}
                          title={title}
                          key={record.id}
                        >
                          {`(${record.type.substring(
                            0,
                            3
                          )}) ${record.name.substring(0, 11).padEnd(14, ".")}`}
                        </li>
                      );
                    })}
                  </ul>
                </Fragment>
              ) : (
                ""
              )}
            </div>

            <div className="record-viewer-sidebar-info-collapse">+</div>
          </div>
        </section>
        <section className="record-viewer-records">
          {allRecords.some(item => recordsToShow.includes(item.type))
            ? recordData.records.map((item, i) => {
                // looks sort of like this: {id: uuidv4(), name: "node", data: {...}}
                const { type, tags, name } = item;

                const nameToShow =
                  name === type
                    ? type
                    : `(${type.substring(0, 3)}) ${name
                        .substring(0, 9)
                        .padEnd(12, ".")}`;

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
                if (type !== "shard") {
                  const connectionCount = Object.keys(item.connectedTo).length;
                  message = {
                    title: `(${type}) ${item.name} - ${connectionCount} ${
                      connectionCount === 1 ? "record" : "records"
                    }`
                  };
                }

                if (!recordsToShow.includes(item.type)) return false;

                const title = `name: ${name}\ntype: ${type}\ntags: ${tagsToShow}\ncreated on ${new Date(
                  item.createdAt
                ).toLocaleString(
                  minerva.settings.dateFormat
                )}\nupdated on ${new Date(item.updatedAt).toLocaleString(
                  minerva.settings.dateFormat
                )}`;

                return (
                  <div
                    key={`type-${i}-record`}
                    onClick={e => {
                      e.stopPropagation();

                      const m = Object.values(message).join(" ⦚ ");

                      return void setStatusBar({
                        message: `information: ${m}`,
                        item
                      });
                    }}
                    onDoubleClick={() => void handleOpenRecord(item)}
                    title={title}
                    className="record-viewer-record record-box"
                  >
                    {nameToShow}
                  </div>
                );
              })
            : "no records to show"}
        </section>
      </section>
      <footer className="record-viewer-footer">
        {statusBar.message.length > 0 ? (
          <div>{statusBar.message}</div>
        ) : (
          <div>record count: {recordData.length}</div>
        )}
      </footer>
    </div>
  );
};

export default memo(RecordViewer);

RecordViewer.propTypes = {
  setWindows: PropTypes.func
};
