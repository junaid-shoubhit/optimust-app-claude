import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { NavigationContext } from "./NavigationContext";
import { useNavigationData } from "./useNavigationData";
import { modulesQueryOptions } from "./navigation/navigationApi";
import { isPathWithin } from "./navigation/pathUtils";

const EMPTY_MODULES = [];

const NavigationProvider = ({ children }) => {
  const { pathname } = useLocation();

  const [activeModule, setActiveModule] = useState(null);

  // moduleId -> { path, search } of the last URL visited inside that module,
  // used to restore it when the user comes back to the module.
  const lastModuleUrlsRef = useRef({});

  const { data: modules = EMPTY_MODULES } = useQuery(modulesQueryOptions());

  /* ---------------------------------------------------------------------- */
  /*                     SYNC ACTIVE MODULE WITH THE URL                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!modules.length) return;

    const matched =
      modules.find((module) => isPathWithin(pathname, module.path)) ??
      modules[0];

    setActiveModule((prev) => (prev?.id === matched?.id ? prev : matched));
  }, [modules, pathname]);

  const { tabs, activeMenu, breadcrumb, isLoading } =
    useNavigationData(activeModule);

  // Pages render only once the module (and its tabs, if it has any) resolved.
  const navReady =
    Boolean(activeModule) && (!activeModule.hasChildren || tabs.length > 0);

  const value = useMemo(
    () => ({
      modules,

      activeModule,
      setActiveModule,

      navReady,

      lastModuleUrlsRef,

      tabs,
      activeMenu,
      breadcrumb,
      isLoading,
    }),
    [modules, activeModule, navReady, tabs, activeMenu, breadcrumb, isLoading],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;
