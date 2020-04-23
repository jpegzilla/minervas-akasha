import React, { Fragment, useContext, memo, useEffect } from "react";

import PropTypes from "prop-types";

import { globalContext } from "./../../App";

import { uuidv4 } from "./../../../utils/misc";

let timeouts = [];

const clearAll = () => {
  for (let i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
};

const ConnectionListComponent = props => {
  const {
    disconnectionOptions,
    connectionOptions,
    structId,
    connectsTo,
    setDisconnectionOptions,
    setConnectionOptions,
    makingConnection
  } = props;

  const {
    minerva,
    setStatusText,
    setStatusMessage,
    setRenderConList,
    renderConList
  } = useContext(globalContext);

  // function that just clears the status message
  const t = () => {
    setStatusText("");
    setStatusMessage({ display: false, text: "", type: null });
  };

  const handleConnect = id => {
    // this item is the current structure being connected. when you click connect on a
    // data structure, that structure is located in minerva's record and assigned to
    // the variable below.
    const itemToConnect = minerva.record.findRecordById(structId);

    // when you click on the structure to connect the above structure to, that structure
    // is located and assigned to the variable below.
    const connectionDestination = minerva.record.findRecordById(id);

    // the result here should be two structure updates. the itemToConnect.connectedTo
    // array should contain id, and the connectionDestination.connectedTo array,
    // should contain structId.

    minerva.connectRecord(itemToConnect, connectionDestination);

    const possibleDisconnections = minerva.record.records[
      itemToConnect.type
    ].find(r => r.id === structId).connectedTo;

    const possibleConnections = Object.values(connectionOptions).filter(d => {
      return d.id !== id;
    });

    setDisconnectionOptions(possibleDisconnections);
    setConnectionOptions(possibleConnections);

    const message = "record successfully connected.";

    setStatusMessage({
      display: true,
      text: message,
      type: "success"
    });

    clearAll();
    timeouts.push(setTimeout(t, 3000));

    // rerender to connection list, forcing the newly connected-to record to update it's list
    // of connections
    setRenderConList(uuidv4());
  };

  const handleDisconnect = id => {
    const itemToDisconnect = minerva.record.findRecordById(structId);
    const disconnectionDestination = minerva.record.findRecordById(id);

    minerva.disconnectRecord(itemToDisconnect, disconnectionDestination);

    // find the new possible disconnections, which is everything that the target structure is
    // still connected to
    const possibleDisconnections = minerva.record.records[
      itemToDisconnect.type
    ].find(r => r.id === structId).connectedTo;

    // get the new possible connections, after disconnection
    const possibleConnections = Object.values(connectionOptions).filter(d => {
      return d.id !== id;
    });

    setDisconnectionOptions(possibleDisconnections);
    setConnectionOptions(possibleConnections);

    const message = "record successfully disconnected.";

    setStatusMessage({
      display: true,
      text: message,
      type: "success"
    });

    clearAll();
    timeouts.push(setTimeout(t, 3000));

    // rerender to connection list, forcing the disconnected-from record to update it's list
    // of connections
    setRenderConList(uuidv4());
  };

  // effect that fires when a record's possible connections / disconnections list
  // needs to be updated
  useEffect(
    () => {
      const item = minerva.record.findRecordById(structId);
      // find the new possible disconnections, which is everything that the target structure is
      // still connected to
      const possibleDisconnections = minerva.record.records[item.type].find(
        r => r.id === structId
      ).connectedTo;

      // get the new possible connections, after disconnection

      const canConnectTo = item.connectsTo;

      const possibleConnections = Object.entries(minerva.record.records)
        .map(([k, v]) => {
          if (canConnectTo.includes(k)) {
            return v;
          } else return false;
        })
        .filter(Boolean)
        .flat(Infinity)
        .filter(item => {
          if (Object.values(item.connectedTo).includes(structId)) return false;
          else return true;
        });

      setDisconnectionOptions(possibleDisconnections);
      setConnectionOptions(possibleConnections);
    },
    [
      renderConList,
      minerva.record,
      setConnectionOptions,
      setDisconnectionOptions,
      structId
    ]
  );

  return (
    <div className="connection-options-list">
      {makingConnection ? (
        connectionOptions && connectionOptions.length !== 0 ? (
          <Fragment>
            <p>connection list:</p>
            <ul>
              {connectionOptions.map(el => {
                const record = el;

                const title = `name: ${record.name}\ntype: ${
                  record.type
                }\ntags: ${
                  record.tags.length === 0
                    ? "none"
                    : record.tags.map(i => i.name).join(", ")
                }\ncreated on ${new Date(record.createdAt).toLocaleString(
                  minerva.settings.dateFormat
                )}\nupdated on ${new Date(record.updatedAt).toLocaleString(
                  minerva.settings.dateFormat
                )}`;

                return (
                  <li
                    title={title}
                    onClick={() => void handleConnect(el.id)}
                    key={el.id}
                  >
                    {`(${record.type.substring(0, 3)}) ${record.name
                      .substring(0, 22)
                      .padEnd(30, ".")}`}
                    {record.id.substring(0, 8)}
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ) : (
          <span>
            no connections available. please create{" "}
            {connectsTo[0].startsWith("a") ? "an" : "a"}{" "}
            {connectsTo.length > 1
              ? connectsTo
                  .map(
                    (item, i, a) =>
                      a.length > 2
                        ? i === a.length - 1
                          ? "or " + item
                          : item + ","
                        : i === a.length - 1
                          ? "or " + item
                          : item
                  )
                  .join(" ")
              : connectsTo[0]}{" "}
            in order to connect this record.
          </span>
        )
      ) : disconnectionOptions &&
      Object.values(disconnectionOptions).length !== 0 ? (
        <Fragment>
          <p>disconnection list:</p>
          <ul>
            {Object.values(disconnectionOptions).map(el => {
              const record = minerva.record.findRecordById(el);

              const title = `name: ${record.name}\ntype: ${
                record.type
              }\ntags: ${
                record.tags.length === 0
                  ? "none"
                  : record.tags.map(i => i.name).join(", ")
              }\ncreated on ${new Date(record.createdAt).toLocaleString(
                minerva.settings.dateFormat
              )}\nupdated on ${new Date(record.updatedAt).toLocaleString(
                minerva.settings.dateFormat
              )}`;

              return (
                <li
                  title={title}
                  onClick={() => void handleDisconnect(record.id)}
                  key={record.id}
                >
                  {`(${record.type.substring(0, 3)}) ${record.name
                    .substring(0, 22)
                    .padEnd(30, ".")}`}
                  {record.id.substring(0, 8)}
                </li>
              );
            })}
          </ul>
        </Fragment>
      ) : (
        <span>
          no disconnections available. please create connections first.
        </span>
      )}
    </div>
  );
};

export default memo(ConnectionListComponent);

ConnectionListComponent.propTypes = {
  disconnectionOptions: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  connectionOptions: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  structId: PropTypes.string,
  connectsTo: PropTypes.array,
  setDisconnectionOptions: PropTypes.func,
  setConnectionOptions: PropTypes.func,
  makingConnection: PropTypes.bool
};
