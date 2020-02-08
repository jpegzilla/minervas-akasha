import React, { useState, useEffect } from "react";
import { Typist, uuidv4 } from "./../utils/misc";

import { Taskbar } from "./Taskbar";

export const Home = () => {
  return (
    <section id="window-system">
      <Taskbar />
    </section>
  );
};
