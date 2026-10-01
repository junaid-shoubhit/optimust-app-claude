import { useMemo } from "react";

import { useQuery, useMutation } from "@tanstack/react-query";

import { apiRequest } from "../../../services/apiBinding";

/* ================= DEFAULT FILTERS ================= */
export const defaultFilters = {
  page: 1,
  pageSize: 50,
  filters: [],
};

/* ================= FILTER QUERY ================= */
export const useTableFiltersQuery = ({
  activeMenu,
  enabled = true,
  tableName = "dynamicPage",
  filterPayload,
}) => {
  return useQuery({
    queryKey: [
      "table-filters",
      activeMenu?.id,
      activeMenu?.entityCodeId,
      tableName,
    ],

    queryFn: () =>
      apiRequest({
        apiPath: "/TableFilter/GetTableFilters",
        method: "POST",
        payload: {
          moduleId: activeMenu?.id,
          entityCodeId: activeMenu?.entityCodeId,
          tableName,
        },
      }),

    select: (response) => {
      const hiddenParameterName = filterPayload?.parameterName;

      let data = response.data;

      // Remove hidden parameter
      if (hiddenParameterName) {
        data = data.filter(
          (filter) => filter.parameterName !== hiddenParameterName,
        );
      }

      // Add isQuickFilter for Category
      data = data.map((filter) => ({
        ...filter,
        ...(filter.parameterName === "5077" && {
          isQuickFilter: true,
        }),
      }));

      // Sort by orderByExpression
      data.sort((a, b) => {
        const orderA = a.orderByExpression ?? Infinity;
        const orderB = b.orderByExpression ?? Infinity;

        return orderA - orderB;
      });

      return {
        ...response,
        data,
      };
    },

    enabled: enabled && !!activeMenu?.id && !!activeMenu?.entityCodeId,

    staleTime: 5 * 60 * 1000,
  });
};

/* ================= PAYLOAD BUILDER ================= */
export const buildPayload = ({
  appliedFilters,
  activeMenu,
  config,
  pageSize,
}) => {
  const payload = {
    ...appliedFilters,

    ...(pageSize && {
      page: 1,
      pageSize,
    }),

    moduleId: activeMenu?.id,

    ...(activeMenu?.entityCodeId && {
      entityCodeId: activeMenu.entityCodeId,
    }),
  };

  if (config?.payload) {
    return {
      ...payload,

      ...(typeof config.payload === "function"
        ? config.payload({
            appliedFilters,
            activeMenu,
          })
        : config.payload),
    };
  }

  return payload;
};

/* ================= MAIN DATA QUERY ================= */
export const useDynamicPageQuery = ({
  config,
  activeMenu,
  appliedFilters,
  enabled = true,
}) => {
  const requestPayload = useMemo(
    () =>
      buildPayload({
        appliedFilters,
        activeMenu,
        config,
      }),

    [appliedFilters, activeMenu, config],
  );

  const queryKey = useMemo(
    () => [config?.queryKey ?? "dynamicPage", activeMenu?.id, appliedFilters],
    [config?.queryKey, activeMenu?.id, appliedFilters],
  );

  return useQuery({
    queryKey,

    enabled: enabled && !!config?.apiPath,

    staleTime: 5 * 60 * 1000,

    keepPreviousData: true,

    refetchOnWindowFocus: false,

    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: config?.apiPath,
        method: "POST",
        signal,
        payload: requestPayload,
      }),
  });
};

/* ================= EXPORT QUERY ================= */
export const useExportDynamicPageQuery = ({
  config,
  activeMenu,
  appliedFilters,
}) => {
  return useMutation({
    mutationFn: async () => {
      const payload = buildPayload({
        appliedFilters,
        activeMenu,
        config,
        pageSize: 999999,
      });

      return apiRequest({
        apiPath: config?.apiPath,
        method: "POST",
        payload,
      });
    },
  });
};
