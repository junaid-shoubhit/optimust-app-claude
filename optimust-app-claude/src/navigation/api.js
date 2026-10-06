import { apiRequest } from "../services/apiBinding";
import { MODULES_STALE_TIME, navigationKeys } from "./constants";

const byOrder = (a, b) =>
  (a.orderByExpression ?? 0) - (b.orderByExpression ?? 0);

/** Sidebar modules (`/Module/user`), sorted for display. */
export const modulesQueryOptions = () => ({
  queryKey: navigationKeys.modules,

  queryFn: () => apiRequest({ apiPath: "/Module/user", method: "get" }),

  select: (res) => [...(res?.data || [])].sort(byOrder),

  staleTime: MODULES_STALE_TIME,

  refetchOnWindowFocus: false,
});

/**
 * Raw tab menus of one module (`/Module/userChild/:id`). Shared by the tabs
 * hook, sidebar prefetching and module opening so they hit one cache entry.
 * Tabs only change on a firm switch (which invalidates every query), so they
 * are kept for the whole session.
 */
export const tabsQueryOptions = (moduleId) => ({
  queryKey: navigationKeys.tabs(moduleId),

  queryFn: () =>
    apiRequest({ apiPath: `/Module/userChild/${moduleId}`, method: "get" }),

  staleTime: Infinity,
  gcTime: Infinity,

  refetchOnWindowFocus: false,
});
