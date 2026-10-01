import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCascadeOptions } from "../../../../services/apiBinding";
import { buildLookupPayload } from "./workflowFormUtils";

export const useWorkflowQueries = ({
  parentWorkflow,
  selectedParentWorkflowIds,
  watchFormName,
  selectedWorkflowIds,
  isEdit,
  workflowData,
}) => {
  const tabPayload = useMemo(() => buildLookupPayload("ctDynamicTabs"), []);

  const formTypePayload = useMemo(
    () => buildLookupPayload("dynWorkflowType"),
    [],
  );

  const relationWorkflowPayload = useMemo(
    () => buildLookupPayload("CtWorkflowRelation"),
    [],
  );

  /**
   * Parent Workflow is now MULTI SELECT.
   *
   * Example:
   *
   * selectedParentWorkflowIds = "101,102,103"
   *
   * This value will be sent to the API as:
   *
   * selectedValue: "101,102,103"
   */
  const cascadePayload = useMemo(() => {
    if (!selectedParentWorkflowIds) {
      return null;
    }

    return {
      dataField: "name",
      dataTable: "CtWorkflowRelationFields",
      page: 1,
      pageSize: 100,
      searchTerm: "",
      selectedValue: selectedParentWorkflowIds,
      entityId: isEdit ? workflowData?.data?.id : 0,
    };
  }, [selectedParentWorkflowIds, isEdit, workflowData]);

  const { data: cascadeData } = useQuery({
    queryKey: [
      "parent-workflow-options",
      selectedParentWorkflowIds,
      isEdit ? workflowData?.data?.id : 0,
    ],

    queryFn: () => getCascadeOptions(cascadePayload),

    enabled: !!cascadePayload,

    staleTime: 0,
  });

  /**
   * Tab payload
   *
   * selectedWorkflowIds is already comma separated.
   *
   * Example:
   * "101,102,103"
   */
  const tabPayloadWithSelection = useMemo(
    () => ({
      ...tabPayload,
      selectedValue: selectedWorkflowIds,
      relationId: watchFormName?.value,
      entityId: isEdit ? workflowData?.data?.id : 0,
    }),
    [tabPayload, selectedWorkflowIds, watchFormName, workflowData, isEdit],
  );

  return {
    formTypePayload,
    relationWorkflowPayload,
    cascadeData,
    tabPayloadWithSelection,
  };
};
