// import { useState, useEffect } from "react";

// export const useTabNavigation = (sortedTabs, selectedTab) => {
//   const [activeIndex, setActiveIndex] = useState(-1);

//   const goNextTab = () => {
//     setActiveIndex((p) => Math.min(p + 1, sortedTabs.length - 1));
//   };

//   const goPrevTab = () => {
//     setActiveIndex((p) => Math.max(p - 1, 0));
//   };

//   useEffect(() => {
//     if (!sortedTabs.length) return;

//     if (selectedTab?.tabName) {
//       const idx = sortedTabs.findIndex(
//         (t) => t.tabName === selectedTab.tabName,
//       );
//       setActiveIndex(idx !== -1 ? idx : 0);
//     } else {
//       setActiveIndex(0);
//     }
//   }, [sortedTabs, selectedTab?.tabName]);

//   return { activeIndex, setActiveIndex, goNextTab, goPrevTab };
// };

import { useState, useEffect, useRef } from "react";

export const useTabNavigation = (sortedTabs, selectedTab, entityId) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const initializedRef = useRef(false);

  const goNextTab = () => {
    setActiveIndex((p) => Math.min(p + 1, sortedTabs.length - 1));
  };

  const goPrevTab = () => {
    setActiveIndex((p) => Math.max(p - 1, 0));
  };

  // Reset when opening another entity
  useEffect(() => {
    initializedRef.current = false;
  }, [entityId]);

  useEffect(() => {
    if (!sortedTabs.length || initializedRef.current) return;

    if (selectedTab?.tabName) {
      const idx = sortedTabs.findIndex(
        (t) => t.tabName === selectedTab.tabName
      );

      setActiveIndex(idx !== -1 ? idx : 0);
    } else {
      setActiveIndex(0);
    }

    initializedRef.current = true;
  }, [sortedTabs, selectedTab?.tabName]);

  return { activeIndex, setActiveIndex, goNextTab, goPrevTab };
};