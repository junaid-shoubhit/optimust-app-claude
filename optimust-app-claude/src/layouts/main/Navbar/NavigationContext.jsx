import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../../services/apiBinding";
import { useNavigationData } from "./useNavigationData";

const NavigationContext = createContext(null);

const matchPath = (currentPath, targetPath) => {
  if (!targetPath) return false;
  const baseTarget = targetPath.split("?")[0];
  return currentPath === baseTarget || currentPath.startsWith(baseTarget + "/");
};

export const NavigationProvider = ({ children }) => {
  const location = useLocation();

  const [activeModule, setActiveModule] = useState(null);

  const lastModuleUrlsRef = useRef({});

  /* -----------------------------
   * Modules (Single Source)
   * ----------------------------- */

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],

    queryFn: () =>
      apiRequest({
        apiPath: "/Module/user",
        method: "get",
      }),

    select: (res) =>
      [...(res?.data || [])].sort(
        (a, b) => (a.orderByExpression ?? 0) - (b.orderByExpression ?? 0),
      ),

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,
  });

  /* -----------------------------
   * Active Module
   * ----------------------------- */

  useEffect(() => {
    if (!modules.length) return;

    const matched =
      modules.find((m) => matchPath(location.pathname, m.path)) || modules[0];

    setActiveModule((prev) => (prev?.id === matched?.id ? prev : matched));
  }, [modules, location.pathname]);

  const navigationData = useNavigationData(activeModule);

  const navReady = useMemo(() => {
    return (
      !!activeModule &&
      (!activeModule.hasChildren || navigationData.tabs.length > 0)
    );
  }, [activeModule, navigationData.tabs]);

  const value = useMemo(
    () => ({
      modules,

      activeModule,
      setActiveModule,

      navReady,

      lastModuleUrlsRef,

      tabs: navigationData.tabs,
      activeMenu: navigationData.activeMenu,
      breadcrumb: navigationData.breadcrumb,
      isLoading: navigationData.isLoading,
    }),
    [
      modules,

      activeModule,
      navReady,

      navigationData.tabs,
      navigationData.activeMenu,
      navigationData.breadcrumb,
      navigationData.isLoading,
    ],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useCustomNavigation = () => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useCustomNavigation must be used inside NavigationProvider",
    );
  }

  return context;
};
