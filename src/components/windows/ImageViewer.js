import React, { useState, useEffect, useMemo } from "react";

export const ImageViewer = props => {
  const { src, alt } = props;

  const source = useMemo(() => src);

  return (
    <section className="image-viewer-window">
      <header className="image-viewer-window-controls">controls</header>
      <div>
        image viewer container
        <img src={source} alt={alt} title={alt} />
      </div>
    </section>
  );
};
