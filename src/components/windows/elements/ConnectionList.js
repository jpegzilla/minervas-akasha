import React, { Fragment, useContext } from "react";

import { globalContext } from "./../../App";

import { uuidv4 } from "./../../../utils/misc";

let timeouts = [];

const clearAll = () => {
  for (let i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
};

export const ConnectionList = props => {
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
    setRenderConList
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

    setRenderConList(uuidv4());
  };

  const handleDisconnect = id => {
    const itemToDisconnect = minerva.record.findRecordById(structId);
    const disconnectionDestination = minerva.record.findRecordById(id);

    minerva.disconnectRecord(itemToDisconnect, disconnectionDestination);

    const possibleDisconnections = minerva.record.records[
      itemToDisconnect.type
    ].find(r => r.id === structId).connectedTo;

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

    setRenderConList(uuidv4());
  };

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
                  record.tags.length === 0 ? "none" : record.tags.join(", ")
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
                    {`${record.name.substring(0, 25).padEnd(30, ".")}`}
                    {record.id.substring(0, 5).padStart(8, "0")}
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ) : (
          <span>
            no connections available. please create a {connectsTo} in order to
            connect this record.
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
                record.tags.length === 0 ? "none" : record.tags.join(", ")
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
                  {`${record.name.substring(0, 25).padEnd(30, ".")}`}
                  {record.id.substring(0, 5).padStart(8, "0")}
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
