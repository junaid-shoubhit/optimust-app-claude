import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { tabsQueryOptions } from "./api";

/**
 * Loads a module's tabs ahead of a click (sidebar hover). Only the active
 * module's tabs load on their own; every other module's load on demand.
 */
export const useTabsPrefetch = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (module) => {
      if (!module?.hasChildren) return;

      const options = tabsQueryOptions(module.id);

      if (queryClient.getQueryData(options.queryKey) === undefined) {
        queryClient.prefetchQuery(options);
      }
    },
    [queryClient],
  );
};
