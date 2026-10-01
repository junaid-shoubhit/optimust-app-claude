// useResizablePanel.js

import { useState, useRef, useEffect, useCallback } from "react";

const COLLAPSE_STORAGE_KEY = "dynamic-page-collapse-state";

const WIDTH_STORAGE_KEY = "dynamic-page-width-state";

const DEFAULT_WIDTH = 336;

const MIN_WIDTH = 336;

const MAX_WIDTH = 600;

const parseStorage = (key) => {
  try {
    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

export const useResizablePanel = ({ pageId, isEnabled, designType }) => {
  /* ================= STORAGE ================= */

  const collapseStorageRef = useRef(parseStorage(COLLAPSE_STORAGE_KEY));

  const widthStorageRef = useRef(parseStorage(WIDTH_STORAGE_KEY));

  /* ================= STATE ================= */

  const [collapsed, setCollapsed] = useState(true);

  const [width, setWidth] = useState(DEFAULT_WIDTH);

  /* ================= DRAG ================= */

  const isDraggingRef = useRef(false);

  const dragStartXRef = useRef(0);

  const dragStartWidthRef = useRef(DEFAULT_WIDTH);

  /* ================= LOAD PAGE STATE ================= */

  // useEffect(() => {
  //   if (!pageId) return;

  //   // const savedCollapse =
  //   //   collapseStorageRef.current[
  //   //     pageId
  //   //   ] || false;

  //   setCollapsed(isEnabled ? true : false);
  //   // const savedWidth = widthStorageRef.current[pageId];

  //   if (designType === "tabs-dynamic-edit") {
  //     setWidth(DEFAULT_WIDTH);
  //   } else {
  //     const savedWidth = widthStorageRef.current[pageId];
  //     setWidth(savedWidth || DEFAULT_WIDTH);
  //   }
  //   // setCollapsed(savedCollapse);

  //   // setWidth(savedWidth || DEFAULT_WIDTH);

  //   // RESET COLLAPSE IF FORM CLOSED
  //   if (!isEnabled) {
  //     collapseStorageRef.current[pageId] = false;

  //     localStorage.setItem(
  //       COLLAPSE_STORAGE_KEY,
  //       JSON.stringify(collapseStorageRef.current),
  //     );

  //     setCollapsed(false);
  //   }
  // }, [pageId, isEnabled]);

  useEffect(() => {
    if (!pageId) return;

    const shouldCollapse = isEnabled && designType !== "tabs-dynamic-edit";

    setCollapsed(shouldCollapse);

    if (designType === "tabs-dynamic-edit") {
      setWidth(DEFAULT_WIDTH);
    } else {
      const savedWidth = widthStorageRef.current[pageId];
      setWidth(savedWidth || DEFAULT_WIDTH);
    }

    if (!isEnabled) {
      collapseStorageRef.current[pageId] = false;

      localStorage.setItem(
        COLLAPSE_STORAGE_KEY,
        JSON.stringify(collapseStorageRef.current),
      );

      setCollapsed(false);
    }
  }, [pageId, isEnabled, designType]);
  /* ================= TOGGLE ================= */

  const toggleCollapse = useCallback(() => {
    if (!pageId) return;

    const newState = !collapseStorageRef.current[pageId];

    collapseStorageRef.current[pageId] = newState;

    localStorage.setItem(
      COLLAPSE_STORAGE_KEY,
      JSON.stringify(collapseStorageRef.current),
    );

    setCollapsed(newState);
  }, [pageId]);

  /* ================= START DRAG ================= */

  const startDragging = useCallback(
    (e) => {
      e.preventDefault();

      isDraggingRef.current = true;

      dragStartXRef.current = e.clientX;

      dragStartWidthRef.current = width;

      document.body.style.cursor = "col-resize";

      document.body.style.userSelect = "none";
    },
    [width],
  );

  /* ================= DRAG EVENTS ================= */

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;

      const delta = e.clientX - dragStartXRef.current;

      let newWidth = dragStartWidthRef.current + delta;

      if (newWidth < MIN_WIDTH) {
        newWidth = MIN_WIDTH;
      }

      if (newWidth > MAX_WIDTH) {
        newWidth = MAX_WIDTH;
      }

      setWidth(newWidth);

      // SAVE WIDTH
      // if (pageId) {
      //   widthStorageRef.current[pageId] = newWidth;

      //   localStorage.setItem(
      //     WIDTH_STORAGE_KEY,
      //     JSON.stringify(widthStorageRef.current),
      //   );
      // }
      if (pageId && designType !== "tabs-dynamic-edit") {
        widthStorageRef.current[pageId] = newWidth;

        localStorage.setItem(
          WIDTH_STORAGE_KEY,
          JSON.stringify(widthStorageRef.current),
        );
      }
    };

    const stopDragging = () => {
      isDraggingRef.current = false;

      document.body.style.cursor = "";

      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);

    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("mouseup", stopDragging);
    };
  }, [pageId]);

  return {
    width,
    collapsed,
    toggleCollapse,
    startDragging,
    isDragging: isDraggingRef.current,
  };
};
