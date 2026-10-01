import { apiRequest } from "../../../../services/apiBinding";
import {
  MODULES_STALE_TIME,
  TABS_GC_TIME,
  TABS_STALE_TIME,
  navigationKeys,
} from "./constants";

const byOrder = (a, b) =>
  (a.orderByExpression ?? 0) - (b.orderByExpression ?? 0);

/* -------------------------------------------------------------------------- */
/*                                   MODULES                                  */
/* -------------------------------------------------------------------------- */

export const modulesQueryOptions = () => ({
  queryKey: navigationKeys.modules,

  queryFn: () =>
    apiRequest({
      apiPath: "/Module/user",
      method: "get",
    }),

  select: (res) => [...(res?.data || [])].sort(byOrder),

  staleTime: MODULES_STALE_TIME,

  refetchOnWindowFocus: false,
});

/* -------------------------------------------------------------------------- */
/*                                    TABS                                    */
/* -------------------------------------------------------------------------- */

/**
 * Raw (unselected) tabs query for a module. Shared by the tabs hook and the
 * sidebar prefetch so both read and write the same cache entry.
 */
export const tabsQueryOptions = (moduleId) => ({
  queryKey: navigationKeys.tabs(moduleId),

  queryFn: () =>
    apiRequest({
      apiPath: `/Module/userChild/${moduleId}`,
      method: "get",
    }),

  staleTime: TABS_STALE_TIME,
  gcTime: TABS_GC_TIME,
});
