import { useRef, useLayoutEffect } from "react";

export default () => {
  const afterPaintRef = useRef();

  useLayoutEffect(() => {
    if (afterPaintRef.current) {
      afterPaintRef.current();
      afterPaintRef.current = null;
    }
  });

  const runAfterUpdate = fn => void (afterPaintRef.current = fn);
  return runAfterUpdate;
};
