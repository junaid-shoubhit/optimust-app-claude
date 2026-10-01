import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { HOVER_PREFETCH_THROTTLE_MS } from "./constants";
import { tabsQueryOptions } from "./navigationApi";

/**
 * Warms the tabs cache so switching modules from the sidebar feels instant.
 *
 * @param {object[]} sidebarMenus modules in sidebar order (neighbours of a
 *   hovered module are prefetched too)
 */
export const useTabsPrefetch = (sidebarMenus) => {
  const queryClient = useQueryClient();

  const lastHoverRef = useRef(0);

  const isTabsCached = useCallback(
    (module) =>
      Boolean(queryClient.getQueryData(tabsQueryOptions(module.id).queryKey)),
    [queryClient],
  );

  const prefetchTabs = useCallback(
    (module) => queryClient.prefetchQuery(tabsQueryOptions(module.id)),
    [queryClient],
  );

  /** Prefetch the hovered module and its neighbours, throttled. */
  const prefetchOnHover = useCallback(
    (index) => {
      const now = Date.now();

      if (now - lastHoverRef.current < HOVER_PREFETCH_THROTTLE_MS) return;

      lastHoverRef.current = now;

      [index, index - 1, index + 1].forEach((i) => {
        const module = sidebarMenus[i];

        if (module && !isTabsCached(module)) prefetchTabs(module);
      });
    },
    [sidebarMenus, isTabsCached, prefetchTabs],
  );

  return { isTabsCached, prefetchTabs, prefetchOnHover };
};
