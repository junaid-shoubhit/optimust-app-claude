import { useMemo } from "react";
import { STATIC_PAGE_CONFIG } from "../../dynamicPage.config";

export const useDynamicConfig = (activeMenu) => {
  return useMemo(() => {
    if (!activeMenu) return null;

    const isStatic =
      !activeMenu.designType ||
      activeMenu.designType === "tabs-hybrid-contacts";

    if (isStatic) {
      return STATIC_PAGE_CONFIG[activeMenu.path];
    }

    return { headerName: activeMenu.label };
  }, [activeMenu]);
};
