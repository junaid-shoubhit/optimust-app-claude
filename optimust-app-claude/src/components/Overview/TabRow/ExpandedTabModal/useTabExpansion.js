import { useCallback, useEffect, useRef, useState } from "react";

import {
  ANIMATION_DURATION,
  EXPANDED_FIELD_WIDTH_RATIO,
  EXPANDED_TABLE_WIDTH_RATIO,
  FIELD_ROW_HEIGHT,
  HEADER_HEIGHT,
  MAX_HEIGHT_RATIO,
  MIN_EXPANDED_HEIGHT,
  TABLE_HEADER_HEIGHT,
  TABLE_ROW_HEIGHT,
} from "../tabRow.constants";

import { getUniqueRowCount } from "../tabRow.utils";

export const useTabExpansion = ({ tab, isExpanded, toggleTab, fieldCount }) => {
  const cardRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [rect, setRect] = useState(null);
  const [closing, setClosing] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    return () => {
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  const captureRect = useCallback(() => {
    const nextRect = cardRef.current?.getBoundingClientRect();

    if (nextRect) {
      setRect(nextRect);
    }

    return nextRect;
  }, []);

  const handleClose = useCallback(() => {
    captureRect();

    setClosing(true);
    setAnimateIn(false);

    clearTimeout(closeTimerRef.current);

    closeTimerRef.current = setTimeout(() => {
      setClosing(false);
      setRect(null);
      toggleTab(null);
    }, ANIMATION_DURATION);
  }, [captureRect, toggleTab]);

  const handleExpand = useCallback(() => {
    if (isExpanded) {
      handleClose();
      return;
    }

    captureRect();

    setClosing(false);
    toggleTab(tab?.tabName);
  }, [captureRect, handleClose, isExpanded, tab?.tabName, toggleTab]);

  useEffect(() => {
    if (!isExpanded || closing) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      setAnimateIn(true);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isExpanded, closing]);

  useEffect(() => {
    if (!isExpanded && !closing) {
      setAnimateIn(false);
      setRect(null);
    }
  }, [isExpanded, closing]);

  const showPortal = Boolean((isExpanded || closing) && rect);

  let transform;
  let width;
  let height;

  if (showPortal) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const isTable = tab?.tabTypeId === 2;

    width =
      viewportWidth *
      (isTable ? EXPANDED_TABLE_WIDTH_RATIO : EXPANDED_FIELD_WIDTH_RATIO);

    const maxHeight = viewportHeight * MAX_HEIGHT_RATIO;

    if (isTable) {
      const rowCount = getUniqueRowCount(tab?.fields);

      height =
        HEADER_HEIGHT + TABLE_HEADER_HEIGHT + rowCount * TABLE_ROW_HEIGHT;
    } else {
      height = HEADER_HEIGHT + fieldCount * FIELD_ROW_HEIGHT;
    }

    height = Math.min(Math.max(height, MIN_EXPANDED_HEIGHT), maxHeight);

    const scaleX = rect.width / width;
    const scaleY = rect.height / height;

    const dx = rect.left + rect.width / 2 - viewportWidth / 2;

    const dy = rect.top + rect.height / 2 - viewportHeight / 2;

    transform = animateIn
      ? "translate(-50%, -50%) scale(1, 1)"
      : `
          translate(-50%, -50%)
          translate(${dx}px, ${dy}px)
          scale(${scaleX}, ${scaleY})
        `;
  }

  return {
    cardRef,
    closing,
    showPortal,
    transform,
    width,
    height,
    handleExpand,
    handleClose,
  };
};
