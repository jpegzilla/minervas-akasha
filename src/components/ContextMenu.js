import React, { useState } from "react";
import { uuidv4 } from "./../utils/misc";

import PropTypes from "prop-types";

const ContextMenu = props => {
  const { contextMenu, contextMenuElem } = props;
  const { x, y } = contextMenu.position;
  const [subItems, setSubItems] = useState({ display: false, id: null });

  // hook with initial context menu items / subitems.
  // setctxmenuitems may be used in the future if context
  // menu needs to change depending on where it triggers.
  // every item must have an onclick function.
  const [ctxMenuItems] = useState([
    {
      title: "example",
      onClick: () => console.log("clicked item 1"),
      id: 1
    },
    {
      title: "example",
      onClick: () => console.log("clicked item 2"),
      id: 2,
      showSubItems: false,
      subItems: [
        {
          title: "example",
          onClick: () => console.log("clicked subitem 1"),
          id: "someid"
        }
      ]
    },
    {
      title: "example",
      onClick: () => console.log("clicked item 3"),
      id: 3
    }
  ]);

  const left = x + "px";
  const top = y + "px";

  // maybe use index for something?
  // handle item click by triggering item's onclick function
  const handleItemClicked = (e, item, idx) => {
    e.stopPropagation();

    item.onClick();
  };

  return (
    <div
      ref={contextMenuElem}
      style={{
        left,
        top
      }}
      id="context-menu-container"
    >
      <header>context menu</header>
      {ctxMenuItems.map((item, i) => {
        console.log(item);
        return (
          <div
            key={uuidv4()}
            onClick={e => handleItemClicked(e, item, i)}
            onMouseEnter={() => setSubItems({ display: true, id: i })}
            onMouseLeave={() => setSubItems({ display: false, id: i })}
            className="context-menu-item"
          >
            {item.title}

            {subItems.id === i &&
              subItems.display &&
              item.subItems &&
              item.subItems.map(item => {
                console.log(item);
                return (
                  <div
                    key={uuidv4()}
                    onClick={e => {
                      e.stopPropagation();
                      item.onClick(e);
                    }}
                    className={`context-menu-subitem ${
                      subItems.display ? "active" : ""
                    }`}
                  >
                    {item.title}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

export default ContextMenu;

ContextMenu.propTypes = {
  contextMenu: PropTypes.object,
  contextMenuElem: PropTypes.object
};
