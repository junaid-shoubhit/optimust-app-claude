// hooks/useDebounce.js
import { useRef, useEffect, useState, useCallback } from "react";

export default function useDebounce(callback, delay = 500) {
  const timeoutRef = useRef();

  const debouncedFn = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return debouncedFn;
}

// import { useState, useEffect } from "react";


export const useFilterDebounce = (
  value,
  delay = 500,
  filterConfigs = {},
  // onFlush // optional callback (e.g., react-query refetch)
) => {
  const [debounced, setDebounced] = useState(() =>
    transformFilters(value, filterConfigs)
  );

  const isFirstRun = useRef(true);
  const timeoutRef = useRef();

  // helper to apply transformation
  const applyTransform = useCallback(
    (val) => transformFilters(val, filterConfigs),
    [filterConfigs]
  );

  // flush method (force immediate update + trigger callback)
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const transformed = applyTransform(value);
    setDebounced(transformed);

    // if (onFlush) onFlush(transformed); // trigger callback (like refetch)
  }, [value, applyTransform]);

  useEffect(() => {
    if (isFirstRun.current) {
      flush(); // first run immediate
      isFirstRun.current = false;
      return;
    }

    timeoutRef.current = setTimeout(() => {
      flush();
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return [debounced, flush]; // return both
};

const transformFilters = (value, filterConfigs) => {
  return Object.entries(value).reduce((acc, [key, val]) => {
    const config = filterConfigs[key];
    if (config?.mapKey || config?.mapValue) {
      const apiKey = config.mapKey || key;
      const apiValue = config.mapValue ? config.mapValue(val) : val;
      acc[apiKey] = apiValue;
    } else {
      acc[key] = val;
    }
    return acc;
  }, {});
};
