import { createContext, useContext } from "react";

export const NavigationContext = createContext(null);

/**
 * Navigation state for the main layout: modules, the active module, its tabs,
 * the active menu and breadcrumb. Provided by `NavigationProvider`.
 */
export const useCustomNavigation = () => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useCustomNavigation must be used inside NavigationProvider",
    );
  }

  return context;
};
