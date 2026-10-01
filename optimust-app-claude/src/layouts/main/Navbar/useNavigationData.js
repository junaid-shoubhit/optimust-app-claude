import { useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { tabsQueryOptions } from "./navigation/navigationApi";
import {
  EMPTY_NAVIGATION,
  buildBreadcrumb,
  buildNavigation,
  matchMenu,
} from "./navigation/menuTree";
import { isPathWithin, stripTrailingSlash } from "./navigation/pathUtils";

/**
 * Tabs, active menu and breadcrumb for the given module.
 *
 * @returns {{ tabs: object[], activeMenu: object|null, breadcrumb: object[], isLoading: boolean }}
 */
export const useNavigationData = (activeModule) => {
  const { pathname } = useLocation();

  // Last matched menu, remembered with its module so it is never reused
  // after switching to another module.
  const lastMatchRef = useRef(null);

  const moduleId = activeModule?.id;
  const modulePath = stripTrailingSlash(activeModule?.path);

  const selectNavigation = useCallback(
    (res) => buildNavigation(res?.data, modulePath),
    [modulePath],
  );

  // No placeholderData: the key changes per module, so "previous data" would
  // be another module's menus rebuilt under this module's path, which made
  // TabMenus redirect to a wrong first tab while this module's menus loaded.
  const { data: navigation = EMPTY_NAVIGATION, isLoading } = useQuery({
    ...tabsQueryOptions(moduleId),

    enabled: Boolean(moduleId) && activeModule?.hasChildren !== false,

    select: selectNavigation,

    refetchOnWindowFocus: false,
  });

  /* ---------------------------------------------------------------------- */
  /*                               ACTIVE MENU                              */
  /* ---------------------------------------------------------------------- */

  const activeMenu = useMemo(() => {
    // Leaf modules (no tabs) act as their own menu.
    if (
      activeModule?.path &&
      !activeModule.hasChildren &&
      pathname.startsWith(activeModule.path)
    ) {
      return { ...activeModule, fullPath: activeModule.path };
    }

    const matched = matchMenu(navigation, pathname);

    if (matched) {
      lastMatchRef.current = { moduleId, menu: matched };

      return matched;
    }

    // Unmatched URL (e.g. a detail route): keep the last menu, but only while
    // still inside the module it came from. While switching modules,
    // activeModule and its tabs lag behind the URL for a few renders, and
    // falling back then would leak the previous module's menu into the page.
    const last = lastMatchRef.current;

    const isInsideModule = !modulePath || isPathWithin(pathname, modulePath);

    return last && isInsideModule && last.moduleId === moduleId
      ? last.menu
      : null;
  }, [navigation, pathname, activeModule, modulePath, moduleId]);

  /* ---------------------------------------------------------------------- */
  /*                               BREADCRUMB                               */
  /* ---------------------------------------------------------------------- */

  const breadcrumb = useMemo(
    () => buildBreadcrumb(activeModule, activeMenu, navigation.parentById),
    [activeModule, activeMenu, navigation.parentById],
  );

  return {
    tabs: navigation.tabs,
    activeMenu,
    breadcrumb,
    isLoading,
  };
};
