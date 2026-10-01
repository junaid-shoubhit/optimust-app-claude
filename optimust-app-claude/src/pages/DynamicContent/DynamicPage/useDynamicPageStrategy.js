import { useMemo } from "react";

export const useDynamicPageStrategy = ({
  designType,
  isFormOpen,
  setVisible,
  setDetails,
  navigate,
}) => {
  return useMemo(() => {
    const isModalFlow =
      designType === "no-tabs" ||
      designType === "no-tabs-static" ||
      designType === "no-tabs-card";
    /* ================= UI ================= */
    const UI_MAP = {
      "no-tabs-static": {
        showTable: true,
        showOutlet: false,
        isFullScreen: false,
        enableQuery: true,
        type: "static",
      },
      "tabs-hybrid-contacts": {
        showTable: true,
        showOutlet: true,
        isFullScreen: false,
        enableQuery: true,
        type: "hybrid",
      },
      "no-tabs": {
        showTable: true,
        showOutlet: false,
        isFullScreen: false,
        enableQuery: true,
        type: "dynamic",
      },
      "no-tabs-card": {
        showTable: true,
        showOutlet: false,
        isFullScreen: false,
        enableQuery: true,
        type: "dynamic",
      },
      "tabs-dynamic": {
        showTable: true,
        showOutlet: isFormOpen,
        isFullScreen: false,
        enableQuery: true,
        type: "dynamic",
      },
      "tabs-dynamic-edit": {
        showTable: true,
        showOutlet: isFormOpen,
        isFullScreen: false,
        enableQuery: true,
        type: "dynamic",
        isEditScreen: true,
      },
      "tabs-nested-dynamic": {
        showTable: !isFormOpen,
        showOutlet: isFormOpen,
        isFullScreen: isFormOpen,
        enableQuery: !isFormOpen,
        type: "dynamic",
      },
      "tabs-dynamic-contacts": {
        showTable: true,
        showOutlet: isFormOpen,
        isFullScreen: false,
        enableQuery: true,
        type: "dynamic",
      },
    };

    const config = UI_MAP[designType] || UI_MAP["no-tabs-static"];

    /* ================= ACTION HANDLER ================= */
    const handleRowAction = (row) => {
      if (isModalFlow) {
        setDetails(row);
        setVisible(true);
      } else {
        if (designType === "tabs-dynamic-edit") {
          navigate(`manage?id=${row.id}`);
        } else if (row?.id) {
          navigate(`overview?id=${row.id}`);
        }
      }
    };

    return {
      isStatic: config.type === "static" || config.type === "hybrid",

      // UI
      showTable: config.showTable,
      showOutlet: config.showOutlet,
      isFullScreenOutlet: config.isFullScreen,
      isQueryEnabled: config.enableQuery,
      isEditScreen: config.isEditScreen || false,
      // Behavior
      handleRowAction,
      isModalFlow,
    };
  }, [designType, isFormOpen, navigate, setVisible, setDetails]);
};
