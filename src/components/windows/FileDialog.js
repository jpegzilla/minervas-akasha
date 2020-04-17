import React from "react";

import PropTypes from "prop-types";

const FileDialog = props => {
  return <div>hello, this is a file dialog</div>;
};

export default FileDialog;

FileDialog.propTypes = {
  text: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  mime: PropTypes.string,
  size: PropTypes.number
};
