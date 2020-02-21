import React, { useState, useEffect, useContext, useRef } from "react";
import { Typist, uuidv4 } from "./../utils/misc";

import { Taskbar } from "./Taskbar";
import { Topbar } from "./Topbar";

import { globalContext } from "./App";

export const Home = () => {
  const { minerva } = useContext(globalContext);

  return (
    <section id="window-system">
      <Topbar minerva={minerva} />
      <section id="main-container" />
      <Taskbar minerva={minerva} />
    </section>
  );
};
