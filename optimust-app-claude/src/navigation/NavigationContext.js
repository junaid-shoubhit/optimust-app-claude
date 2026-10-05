import { createContext, useContext } from "react";

export const NavigationContext = createContext(null);

/**
 * App navigation state, derived from the URL.
 *
 * @returns {{
 *   modules: object[], sidebarModules: object[], profileModules: object[],
 *   isModulesLoading: boolean,
 *   activeModule: object|null,
 *   tabs: object[], isTabsLoading: boolean,
 *   activeMenu: object|null, breadcrumb: object[],
 *   isReady: boolean,
 *   openModule: (module: object) => Promise<void>, loadingModuleId: number|null,
 *   prefetchModuleTabs: (module: object) => void,
 * }}
 */
export const useAppNavigation = () => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useAppNavigation must be used inside NavigationProvider");
  }

  return context;
};
