// import { useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { apiRequest } from "../../../services/apiBinding";
// import { useCustomNavigation } from "./NavigationContext";

// const matchPath = (currentPath, targetPath) => {
//   if (!targetPath) return false;

//   const baseTarget = targetPath.split("?")[0];

//   return (
//     currentPath === baseTarget ||
//     currentPath.startsWith(baseTarget + "/")
//   );
// };

// export const useActiveModule = () => {
//   const location = useLocation();

//   const { activeModule, setActiveModule } =
//     useCustomNavigation();

//   const { data = [], isLoading } = useQuery({
//     queryKey: ["modules"],
//     queryFn: () =>
//       apiRequest({
//         apiPath: "/Module/user",
//         method: "get",
//       }),

//     select: (res) => res?.data || [],

//     staleTime: 5 * 60 * 1000,

//     refetchOnWindowFocus: false,
//   });

//   const modules = useMemo(
//     () =>
//       [...data].sort(
//         (a, b) =>
//           (a.orderByExpression ?? 0) -
//           (b.orderByExpression ?? 0),
//       ),
//     [data],
//   );

//   return {
//     modules,
//     activeModule,
//     isLoading,
//     setActiveModule,
//   };
// };

// import { useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { apiRequest } from "../../../services/apiBinding";
// import { useCustomNavigation } from "./NavigationContext";

// const matchPath = (currentPath, targetPath) => {
//   if (!targetPath) return false;

//   const baseTarget = targetPath.split("?")[0];

//   return currentPath === baseTarget || currentPath.startsWith(baseTarget + "/");
// };

// export const useActiveModule = () => {
//   const location = useLocation();

//   const { activeModule, setActiveModule } = useCustomNavigation();

//   const { data = [], isLoading } = useQuery({
//     queryKey: ["modules"],
//     queryFn: () =>
//       apiRequest({
//         apiPath: "/Module/user",
//         method: "get",
//       }),

//     select: (res) => res?.data || [],

//     staleTime: 5 * 60 * 1000,

//     refetchOnWindowFocus: false,
//   });

//   const modules = useMemo(
//     () =>
//       [...data].sort(
//         (a, b) => (a.orderByExpression ?? 0) - (b.orderByExpression ?? 0),
//       ),
//     [data],
//   );

//   return {
//     modules,
//     activeModule,
//     isLoading,
//     setActiveModule,
//   };
// };
// [];

import { useMemo } from "react";
import { useCustomNavigation } from "./NavigationContext";

export const useActiveModule = () => {
  const { modules, activeModule, setActiveModule } = useCustomNavigation();

  const sidebarMenus = useMemo(
    () => modules.filter((m) => m.placeHolder !== "Side Bar Profile Menu"),
    [modules],
  );

  const profileMenu = useMemo(
    () => modules.filter((m) => m.placeHolder === "Side Bar Profile Menu"),
    [modules],
  );

  return {
    modules,
    sidebarMenus,
    profileMenu,

    activeModule,
    setActiveModule,

    isLoading: modules.length === 0,
  };
};
