import { useMemo } from "react";
import { BASE_FORM_CONFIG } from "../config/baseFormConfig";

export const useFormManagerConfig = ({ formManager, activeMenu }) => {
  return useMemo(() => {
    if (!formManager) {
      return { type: "NOT_FOUND" };
    }

    /* ✅ Overview always allowed */
    if (formManager === "overview") {
      const config = BASE_FORM_CONFIG.overview;

      if (!config) {
        return { type: "NOT_FOUND" };
      }

      return { type: "FOUND", config };
    }

    if (formManager === "manage") {
      const config = BASE_FORM_CONFIG.manage;

      if (!config) {
        return { type: "NOT_FOUND" };
      }

      return { type: "FOUND", config };
    }

    const dataMenu = [...activeMenu.dataMenu, ...activeMenu.buttonMenu];

    /* ❌ Must exist in backend */
    if (dataMenu.length === 0) {
      return { type: "NOT_FOUND" };
    }

    /* ✅ Handle nested menu items recursively */
    const flattenMenus = (menus = []) => {
      return menus.flatMap((item) => {
        const current = item;

        const children =
          item.items && item.items.length > 0 ? flattenMenus(item.items) : [];

        return [current, ...children];
      });
    };

    const allMenus = flattenMenus(dataMenu);

    const activeSectionMenu = allMenus.find(
      (item) => item.path?.replace("/", "") === formManager,
    );

    const allowedForms = allMenus
      .map((item) => item.path?.replace("/", ""))
      .filter(Boolean);

    if (!allowedForms.includes(formManager)) {
      return { type: "NOT_FOUND" };
    }

    const config = BASE_FORM_CONFIG[formManager];
    if (!config) {
      console.error(`Missing config for: ${formManager}`);
      return { type: "NOT_FOUND" };
    }

    return {
      type: "FOUND",
      // config,
      config: {
        ...config,
        activeSectionMenu,
      },
    };
  }, [formManager, activeMenu]);
};
