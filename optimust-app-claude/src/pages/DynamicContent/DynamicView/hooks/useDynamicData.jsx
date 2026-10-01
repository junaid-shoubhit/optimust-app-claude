import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../../services/apiBinding";
import { useNoTabFormData } from "../../../../components/NoTabsForm/hooks/useNoTabFormData";

export const useDynamicData = ({ pageId, activeMenu, shouldFetch }) => {
  const detailsQuery = useQuery({
    queryKey: ["users", pageId, activeMenu?.entityCodeId],
    queryFn: () =>
      apiRequest({
        apiPath: `user/${pageId}`,
        method: "get",
      }),
    enabled: !!activeMenu && !shouldFetch && !!pageId,
  });
  const formData = useNoTabFormData(
    {
      entityId: pageId,
      entityCodeId: activeMenu?.entityCodeId,
      moduleId: activeMenu?.id,
      tabName: "No Tab",
    },
    { enabled: shouldFetch },
  );

  const mergedData = useMemo(() => {
    return detailsQuery.data || formData.fieldData || [];
  }, [detailsQuery.data, formData.fieldData]);

  return {
    apiData: detailsQuery.data,
    mergedData,
    dynamicValues: formData.dynamicValues,
    loading: detailsQuery.isLoading || formData.isLoading,
    error: formData.error,
  };
};
