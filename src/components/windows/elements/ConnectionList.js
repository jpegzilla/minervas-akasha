import React, { Fragment, useState, useContext } from "react";

import { globalContext } from "./../../App";

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
    makingConnection,
    uuidv4
  } = props;

  const { minerva, setStatusText, setStatusMessage } = useContext(
    globalContext
  );

  const allRecords = Object.values(minerva.record.records).flat(Infinity);

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
    console.log("being connected, being connected to:", {
      id,
      structId
    });
    console.log("record being connected, record being connected to:", {
      itemToConnect,
      connectionDestination
    });

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

    console.log("possible connections (post connection):", possibleConnections);
    console.log(
      "possible disconnections (post connection):",
      possibleDisconnections
    );

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
  };

  const handleDisconnect = id => {
    console.log(id);
    const itemToDisconnect = minerva.record.findRecordById(structId);
    const disconnectionDestination = minerva.record.findRecordById(id);

    console.log(itemToDisconnect, disconnectionDestination);

    minerva.disconnectRecord(itemToDisconnect, disconnectionDestination);

    const possibleDisconnections = minerva.record.records[
      itemToDisconnect.type
    ].find(r => r.id === structId).connectedTo;

    const possibleConnections = Object.values(connectionOptions).filter(d => {
      return d.id !== id;
    });

    console.log({ possibleConnections, possibleDisconnections });
    console.log(minerva.record.records);

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
  };

  const handleMouseEnter = id => {};
  const handleMouseLeave = () => {};

  return (
    <div className="connection-options-list">
      {makingConnection ? (
        connectionOptions && connectionOptions.length !== 0 ? (
          <Fragment>
            <p>connection list:</p>
            <ul>
              {connectionOptions.map((el, i) => {
                return (
                  <li onClick={() => void handleConnect(el.id)} key={el.id}>
                    {el.name} {`(${i + 1})`} - {el.id.substring(0, 5)}
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
            {Object.values(disconnectionOptions).map((el, i) => {
              return (
                <li
                  onMouseEnter={() => void handleMouseEnter(el)}
                  onMouseLeave={() => void handleMouseLeave()}
                  onClick={() => void handleDisconnect(el)}
                  key={el}
                >
                  {`(${i + 1})`} - {el.substring(0, 5)}
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
