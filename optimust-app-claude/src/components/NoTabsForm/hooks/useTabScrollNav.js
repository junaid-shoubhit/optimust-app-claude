import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives the sticky tab bar: tracks which section is "active" as the user
 * scrolls, and exposes a scrollToTab() to jump there on click.
 *
 * NOTE on the known maxScroll:0 issue — this hook assumes
 * scrollContainerRef is attached to an element with a genuinely bounded
 * height (e.g. flex-1 min-h-0 inside a parent with a fixed/max height).
 * If the Dialog's contentStyle doesn't constrain height, scrollHeight will
 * equal clientHeight and the "not actually scrollable" fallback branch in
 * scrollToTab will always fire. That's a container-height problem upstream
 * (FormModal/Dialog contentStyle), not something this hook can fix.
 */
export const useTabScrollNav = (tabs) => {
  const scrollContainerRef = useRef(null);
  const sectionRefs = useRef(new Map());
  const [activeTab, setActiveTab] = useState(null);

  // Seed the initial active tab once tabs are available.
  useEffect(() => {
    if (tabs.length && !activeTab) {
      setActiveTab(tabs[0].tabName);
    }
  }, [tabs, activeTab]);

  const registerSectionRef = useCallback(
    (tabName) => (node) => {
      if (node) {
        sectionRefs.current.set(tabName, node);
      } else {
        sectionRefs.current.delete(tabName);
      }
    },
    [],
  );

  const scrollToTab = useCallback((tabName) => {
    const container = scrollContainerRef.current;
    const section = sectionRefs.current.get(tabName);
    if (!section) return;

    if (container && container.scrollHeight > container.clientHeight) {
      const containerRect = container.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const offset = sectionRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({ top: offset, behavior: "smooth" });
    } else {
      // Container isn't actually scrollable (e.g. no bounded height yet) —
      // fall back so the click still does something visible.
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setActiveTab(tabName);
  }, []);

  // Scroll-driven active tab detection.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !tabs.length) return;

    let rafId = null;

    const computeActive = () => {
      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 5;

      if (isAtBottom) {
        const lastTab = tabs[tabs.length - 1].tabName;
        setActiveTab((prev) => (prev !== lastTab ? lastTab : prev));
        return;
      }

      const containerTop = container.getBoundingClientRect().top;
      let closest = tabs[0].tabName;
      let closestDistance = Infinity;

      tabs.forEach((tab) => {
        const section = sectionRefs.current.get(tab.tabName);
        if (!section) return;

        const distance = Math.abs(
          section.getBoundingClientRect().top - containerTop,
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = tab.tabName;
        }
      });

      setActiveTab((prev) => (prev !== closest ? closest : prev));
    };

    // rAF-throttled: avoids running the closest-tab scan on every single
    // scroll event, and (unlike the previous version) this effect no
    // longer depends on activeTab, so the listener is attached once per
    // `tabs` change instead of being torn down/re-added on every tab switch.
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(computeActive);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    computeActive();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [tabs]);

  return { scrollContainerRef, registerSectionRef, scrollToTab, activeTab };
};
