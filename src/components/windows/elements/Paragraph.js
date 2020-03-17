import React from "react";

export default props => {
  const { fullText, showText, title, humanSize, mime } = props;

  const fileInfo = `title: ${title}\r\nsize: ${humanSize}\r\ntype: ${mime}`;

  console.log(props);

  return (
    <p title={fileInfo}>
      <pre>{showText}</pre>
    </p>
  );
};
