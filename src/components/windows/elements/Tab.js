import React from "react";

export const Tab = props => {
  const { w, title, activeWindowId, tabCounts, handleClickItem } = props;

  let titleToUse = title,
    typeToUse = w.componentProps.type;

  if (w.componentProps) {
    if (w.componentProps.info)
      if (w.componentProps.info.name) titleToUse = w.componentProps.info.name;
  }

  const titleText = `name: ${titleToUse}\ntype: ${typeToUse}`;

  return (
    <li
      title={titleText}
      className={
        w.id === activeWindowId ? "taskbar-button active" : "taskbar-button"
      }
      onClick={e => {
        handleClickItem(e, w);
      }}
    >
      {`${titleToUse} (${tabCounts[w.stringType]})`}
    </li>
  );
};
