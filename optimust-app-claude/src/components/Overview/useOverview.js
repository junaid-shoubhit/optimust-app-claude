import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../services/apiBinding";

export const useOverview = ({
  entityId,
  // entityCode,
  entityCodeId,
  tabsApiPath,
}) => {
  const [modalState, setModalState] = useState({
    visible: false,
    tab: null,
  });

  const [expandedTab, setExpandedTab] = useState(null);
  const tabRefs = useRef({});

  /* ---------- Tabs Query ---------- */
  const tabsQuery = useQuery({
    queryKey: ["overview-tabs", entityCodeId, entityId],
    queryFn: () =>
      apiRequest({
        apiPath: tabsApiPath(entityId),
        method: "get",
      }),
    enabled: Boolean(entityCodeId && entityId),
    staleTime: 5 * 60 * 1000,
  });

  /* ---------- Actions ---------- */
  const toggleTab = useCallback((tabName) => {
    setExpandedTab((prev) => {
      const next = prev === tabName ? null : tabName;

      if (next && tabRefs.current[next]) {
        requestAnimationFrame(() => {
          tabRefs.current[next]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }

      return next;
    });
  }, []);

  const openModal = useCallback((tab) => {
    setModalState({ visible: true, tab });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ visible: false, tab: null });
  }, []);

  return {
    tabsQuery,
    expandedTab,
    toggleTab,
    openModal,
    closeModal,
    modalState,
    tabRefs,
  };
};
