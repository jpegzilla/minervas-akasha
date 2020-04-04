import React, { useContext, useState } from "react";

import { globalContext } from "./../../App";

export const Notes = props => {
  console.log(props);
  const { notes } = props;
  const { minerva } = useContext(globalContext);

  const [collapsed, setCollapsed] = useState(true);
  const [noteText, setNoteText] = useState("");

  return (
    <section className={`notes-container${collapsed ? " collapsed" : ""}`}>
      <div
        onClick={() => void setCollapsed(!collapsed)}
        className="notes-sidebar"
        title="click to expand note viewer"
      >
        <span>notes</span>
      </div>

      <div className={`notes-content${collapsed ? " collapsed" : ""}`}>
        <textarea
          onChange={e => setNoteText(e.target.value)}
          value={noteText}
        />
      </div>
    </section>
  );
};
