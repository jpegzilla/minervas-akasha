import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  memo,
  useMemo
} from "react";

import PropTypes from "prop-types";

import { globalContext } from "./../../App";

const NotesComponent = props => {
  const { id } = props;
  const { minerva } = useContext(globalContext);

  const record = minerva.record.findRecordById(id);

  const [collapsed, setCollapsed] = useState(true);
  const [noteText, setNoteText] = useState(record.data.notes);
  const [textHistory, setTextHistory] = useState([]);

  const textArea = useRef();

  const { maxHistoryDepth } = minerva.settings.textEditor;

  // console.log("rerendering notes");

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

  const getCaretPosition = element => {
    let caretPosition = 0;

    if (element.selectionStart || element.selectionStart === 0) {
      caretPosition = element.selectionStart;
    }

    return caretPosition;
  };

  const setCursorPosition = (element, caretPos) => {
    const elem = element;

    if (elem != null) {
      if (elem.createTextRange) {
        const range = elem.createTextRange();
        range.move("character", caretPos);
        range.select();
      } else {
        if (elem.selectionStart) {
          elem.focus();
          elem.setSelectionRange(caretPos, caretPos);
        } else elem.focus();
      }
    }
  };

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

            const currentPosition = getCaretPosition(el);

            console.log(currentPosition);

            setNoteText(
              startToSelectionPosition + "  " + endSelectionToEndOfElement
            );
          }
        }

        break;

      case "s":
        if (ctrlKey) {
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

export const Notes = memo(NotesComponent);

Notes.propTypes = {
  id: PropTypes.string
};
