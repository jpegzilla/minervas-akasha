import React, { useState, useEffect, useContext } from "react";

import { globalContext } from "./../App";

export const RecordViewer = props => {
  const { minerva } = useContext(globalContext);

  console.log(props);
  return (
    <div>
      this is a record viewer. it contains all the records belonging to a
      certain user.
    </div>
  );
};
