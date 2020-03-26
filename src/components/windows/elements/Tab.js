import React from "react";

import PropTypes from "prop-types";

export const Tab = props => {
  const { w, title, activeWindowId, tabCounts, handleClickItem } = props;

  let titleToUse = title,
    typeToUse = w.componentProps.type || w.component;

  if (w.componentProps) {
    if (w.componentProps.info)
      if (w.componentProps.info.name) titleToUse = w.componentProps.info.name;
  }

  const titleText = `name: ${titleToUse}\ntype: ${typeToUse}\nthis is ${typeToUse} #${tabCounts}.`.toLowerCase();

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
      {`${titleToUse} (${tabCounts})`}
    </li>
  );
};

Tab.propTypes = {
  w: PropTypes.object,
  title: PropTypes.string,
  activeWindowId: PropTypes.string,
  tabCounts: PropTypes.number,
  handleClickItem: PropTypes.func
};
