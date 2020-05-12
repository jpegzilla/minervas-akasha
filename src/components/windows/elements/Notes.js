import React, { useContext, useState, useEffect, useRef, memo } from "react";

import useRunAfterUpdate from "./../../../hooks/useRunAfterUpdate";
import handleTextAreaInput from "./utils/handleTextAreaInput";

import PropTypes from "prop-types";

import { globalContext } from "./../../App";

const Notes = props => {
  const { id } = props;
  const { minerva } = useContext(globalContext);
  const runAfterUpdate = useRunAfterUpdate();

  const record = minerva.record.findRecordById(id);

  const [collapsed, setCollapsed] = useState(true);
  const [noteText, setNoteText] = useState(record.data.notes);
  const [textHistory, setTextHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(textHistory.length);

  // anything that is provided by the user, such as a date, and any custom
  // metadata provided by the user.
  // const [extra, setExtra] = useState(record.data.extra);

  // console.log(extra);

  const textArea = useRef();

  const { maxHistoryDepth } = minerva.settings.textEditor;

  useEffect(
    () => {
      if (textHistory.length > maxHistoryDepth) {
        // remove the oldest element from the history
        // if history is too large
        textHistory.shift();
        setTextHistory([...textHistory]);

        // set the position in history to the end of the history array, thus losing
        // the old 'future' in the history if the user was undoing things
        setHistoryIndex(textHistory.length);
      }

      minerva.record.editInRecord(
        id,
        record.type,
        "data",
        { ...record.data, notes: noteText },
        minerva
      );
    },
    [
      noteText,
      minerva,
      record.data,
      record.type,
      id,
      maxHistoryDepth,
      textHistory
    ]
  );

  return (
    <section className={`notes-container${collapsed ? " collapsed" : ""}`}>
      <div
        onClick={() => {
          setCollapsed(!collapsed);
        }}
        className="notes-sidebar"
        title="click to expand note viewer"
      >
        <span>notes</span>
      </div>

      <div className={`notes-content${collapsed ? " collapsed" : ""}`}>
        <textarea
          ref={textArea}
          spellCheck="false"
          onClick={e => e.stopPropagation()}
          onChange={e => {
            setTextHistory([...textHistory, noteText]);
            setNoteText(e.target.value);
          }}
          onKeyDown={e =>
            handleTextAreaInput(e, {
              setNoteText,
              textArea,
              textHistory,
              historyIndex,
              setHistoryIndex,
              runAfterUpdate
            })
          }
          value={noteText}
        />
      </div>
    </section>
  );
};

export default memo(Notes);

Notes.propTypes = {
  id: PropTypes.string
};
