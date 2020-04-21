import React, { useContext, useState, useEffect, useRef, memo } from "react";

import PropTypes from "prop-types";

import { globalContext } from "./../../App";

const Notes = props => {
  const { id } = props;
  const { minerva } = useContext(globalContext);

  const record = minerva.record.findRecordById(id);

  const [collapsed, setCollapsed] = useState(true);
  const [noteText, setNoteText] = useState(record.data.notes);
  const [textHistory, setTextHistory] = useState([]);

  const textArea = useRef();

  const { maxHistoryDepth } = minerva.settings.textEditor;

  useEffect(
    () => {
      if (textHistory.length > maxHistoryDepth) {
        // remove the oldest element from the history
        // if history is too large
        textHistory.shift();
        setTextHistory([...textHistory]);
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

  const getCursorPosition = element => {
    let cursorPosition = 0;

    if (element.selectionStart || element.selectionStart === 0) {
      cursorPosition = element.selectionStart;
    }

    return cursorPosition;
  };

  // const setCursorPosition = (element, cursorPos) => {
  //   const elem = element;
  //
  //   if (elem != null) {
  //     if (elem.createTextRange) {
  //       const range = elem.createTextRange();
  //       range.move("character", cursorPos);
  //       range.select();
  //     } else {
  //       if (elem.selectionStart) {
  //         elem.focus();
  //         elem.setSelectionRange(cursorPos, cursorPos);
  //       } else elem.focus();
  //     }
  //   }
  // };

  // make the text editor feel a little better
  const handleKeyDown = e => {
    const key = e.key.toLowerCase();
    const {
      ctrlKey
      // shiftKey,
      // altKey,
      //metaKey
    } = e;

    switch (key) {
      case "tab":
        // insert two spaces into the text field at the cursor position, and then
        // move the cursor directly after the inserted spaces
        e.preventDefault();
        console.log("current textarea value:");
        console.log(e.target.value);

        // if the textarea ref is ready
        if (textArea.current) {
          const el = e.target || textArea.current;

          if (el.selectionStart || el.selectionStart === "0") {
            const startPos = el.selectionStart;
            const endPos = el.selectionEnd;

            const startToSelectionPosition = el.value.substring(0, startPos);
            const endSelectionToEndOfElement = el.value.substring(
              endPos,
              el.value.length
            );

            const currentPosition = getCursorPosition(el);

            console.log(currentPosition);

            setNoteText(
              startToSelectionPosition + "  " + endSelectionToEndOfElement
            );

            // set the new cursor position
          }
        }

        break;

      case "s":
        if (ctrlKey) {
          // prevent accidentally hitting save and bringing up the dialog to save the entire
          // web page. I hit ctrl+s while typing no matter what out of habit, so I put this
          // in so I can hit save as much as I'd like and not be bothered with the dialog
          // popping up.
          e.preventDefault();
          return false;
        }
        break;
      default:
        return;
    }
  };

  return (
    <section className={`notes-container${collapsed ? " collapsed" : ""}`}>
      <div
        onClick={e => {
          e.stopPropagation();
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
          onKeyDown={handleKeyDown}
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
