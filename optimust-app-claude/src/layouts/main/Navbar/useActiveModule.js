import { useMemo } from "react";

import { useCustomNavigation } from "./NavigationContext";
import { PLACEHOLDER } from "./navigation/constants";

/** Modules split into sidebar entries and profile-menu entries. */
export const useActiveModule = () => {
  const { modules, activeModule, setActiveModule } = useCustomNavigation();

  const { sidebarMenus, profileMenu } = useMemo(() => {
    const isProfileMenu = (module) =>
      module.placeHolder === PLACEHOLDER.SIDEBAR_PROFILE_MENU;

    return {
      sidebarMenus: modules.filter((module) => !isProfileMenu(module)),
      profileMenu: modules.filter(isProfileMenu),
    };
  }, [modules]);

  return {
    modules,
    sidebarMenus,
    profileMenu,

    activeModule,
    setActiveModule,

    isLoading: modules.length === 0,
  };
};
