import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { NavigationContext } from "./NavigationContext";
import { modulesQueryOptions, tabsQueryOptions } from "./api";
import { PLACEHOLDER } from "./constants";
import {
  EMPTY_TREE,
  buildBreadcrumb,
  buildMenuTree,
  matchMenu,
  moduleAsMenu,
} from "./menuTree";
import { isPathWithin } from "./paths";
import { useModuleMemory } from "./useModuleMemory";
import { useTabsPrefetch } from "./useTabsPrefetch";

const EMPTY_MODULES = [];

/** Module owning `pathname`; the longest matching path wins. */
const findModuleForPath = (modules, pathname) => {
  let best = null;

  for (const module of modules) {
    if (
      isPathWithin(pathname, module.path) &&
      (!best || module.path.length > best.path.length)
    ) {
      best = module;
    }
  }

  return best;
};

/**
 * Navigation for the main layout.
 *
 * The URL is the single source of truth: the active module, its tabs and the
 * active menu are all derived from it during render, so they can never lag
 * behind or disagree with the page being shown. Navigating anywhere (links,
 * buttons, search) is just `navigate()`; nothing has to be "set" first.
 */
const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { pathname, search } = location;

  /* ---------------------------------------------------------------------- */
  /*                                 MODULES                                */
  /* ---------------------------------------------------------------------- */

  const modulesQuery = useQuery(modulesQueryOptions());

  const modules = modulesQuery.data ?? EMPTY_MODULES;

  const { sidebarModules, profileModules } = useMemo(() => {
    const isProfile = (m) => m.placeHolder === PLACEHOLDER.SIDEBAR_PROFILE_MENU;

    return {
      sidebarModules: modules.filter((m) => !isProfile(m)),
      profileModules: modules.filter(isProfile),
    };
  }, [modules]);

  const activeModule = useMemo(
    () => findModuleForPath(modules, pathname),
    [modules, pathname],
  );

  const prefetchModuleTabs = useTabsPrefetch();

  /* ---------------------------------------------------------------------- */
  /*                                   TABS                                 */
  /* ---------------------------------------------------------------------- */

  const hasTabs = Boolean(activeModule?.hasChildren);

  const selectTree = useCallback(
    (res) => buildMenuTree(res?.data, activeModule),
    [activeModule],
  );

  const tabsQuery = useQuery({
    ...tabsQueryOptions(activeModule?.id),
    enabled: hasTabs,
    select: selectTree,
  });

  const tree = (hasTabs && tabsQuery.data) || EMPTY_TREE;

  const isTabsSettled = !hasTabs || !tabsQuery.isPending;

  /* ---------------------------------------------------------------------- */
  /*                               ACTIVE MENU                              */
  /* ---------------------------------------------------------------------- */

  const leafModuleMenu = useMemo(
    () => (activeModule && !hasTabs ? moduleAsMenu(activeModule) : null),
    [activeModule, hasTabs],
  );

  // Last matched menu, so URLs below a menu that aren't themselves menus
  // (e.g. detail routes) keep it. Scoped to its module so it never leaks.
  const lastMatchRef = useRef(null);

  const activeMenu = useMemo(() => {
    if (!activeModule) return null;

    if (!hasTabs) return leafModuleMenu;

    const matched = matchMenu(tree, pathname);

    if (matched) {
      lastMatchRef.current = { moduleId: activeModule.id, menu: matched };

      return matched;
    }

    const last = lastMatchRef.current;

    return last?.moduleId === activeModule.id ? last.menu : null;
  }, [activeModule, hasTabs, leafModuleMenu, tree, pathname]);

  const breadcrumb = useMemo(
    () => buildBreadcrumb(activeModule, activeMenu, tree.parentById),
    [activeModule, activeMenu, tree.parentById],
  );

  /* ---------------------------------------------------------------------- */
  /*                       MODULE ENTRY / INDEX REDIRECT                    */
  /* ---------------------------------------------------------------------- */

  const getEntryUrl = useModuleMemory({ activeModule, activeMenu, location });

  // A module URL that matches none of its tabs (e.g. "/cases", or a tab the
  // user can no longer see) opens the module's last page or first tab.
  const redirectTo = useMemo(() => {
    if (!hasTabs || !isTabsSettled || activeMenu) return null;

    const entry = getEntryUrl(activeModule, tree);

    return entry && entry !== pathname + search ? entry : null;
  }, [
    hasTabs,
    isTabsSettled,
    activeMenu,
    getEntryUrl,
    activeModule,
    tree,
    pathname,
    search,
  ]);

  useEffect(() => {
    if (redirectTo) navigate(redirectTo, { replace: true });
  }, [redirectTo, navigate]);

  /* ---------------------------------------------------------------------- */
  /*                               OPEN MODULE                              */
  /* ---------------------------------------------------------------------- */

  const [loadingModuleId, setLoadingModuleId] = useState(null);

  // Only the latest open request navigates (fast double clicks).
  const openRequestRef = useRef(0);

  /** Sidebar entry point: open a module at its last page or first tab. */
  const openModule = useCallback(
    async (module) => {
      const request = ++openRequestRef.current;

      if (!module.hasChildren) {
        if (module.path) navigate(module.path);
        return;
      }

      if (module.id === activeModule?.id) return;

      const options = tabsQueryOptions(module.id);

      if (queryClient.getQueryData(options.queryKey) === undefined) {
        setLoadingModuleId(module.id);
      }

      let moduleTree;

      try {
        const res = await queryClient.ensureQueryData(options);

        moduleTree = buildMenuTree(res?.data, module);
      } catch (error) {
        console.error(
          `[navigation] failed to load tabs of "${module.label}"`,
          error,
        );
        return;
      } finally {
        if (request === openRequestRef.current) setLoadingModuleId(null);
      }

      if (request !== openRequestRef.current) return;

      navigate(getEntryUrl(module, moduleTree) ?? module.path);
    },
    [activeModule?.id, navigate, queryClient, getEntryUrl],
  );

  /* ---------------------------------------------------------------------- */
  /*                                  READY                                 */
  /* ---------------------------------------------------------------------- */

  // Pages render once the module's tabs are known and no redirect is pending,
  // so they never see a half-resolved activeMenu.
  const isReady =
    !modulesQuery.isPending &&
    (!activeModule || (isTabsSettled && !redirectTo));

  const value = useMemo(
    () => ({
      modules,
      sidebarModules,
      profileModules,
      isModulesLoading: modulesQuery.isPending,

      activeModule,

      tabs: tree.tabs,
      isTabsLoading: hasTabs && tabsQuery.isPending,

      activeMenu,
      breadcrumb,

      isReady,

      openModule,
      loadingModuleId,
      prefetchModuleTabs,
    }),
    [
      modules,
      sidebarModules,
      profileModules,
      modulesQuery.isPending,
      activeModule,
      tree.tabs,
      hasTabs,
      tabsQuery.isPending,
      activeMenu,
      breadcrumb,
      isReady,
      openModule,
      loadingModuleId,
      prefetchModuleTabs,
    ],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;
