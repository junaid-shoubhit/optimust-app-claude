import { useMemo } from "react";

const buildRelationOption = (label, value, extra = {}) =>
  value ? { label, value, ...extra } : null;

export const useWorkflowDefaultValues = ({
  activeMenu,
  workflowData,
  isEdit,
}) =>
  useMemo(
    () => ({
      moduleId: activeMenu?.id,
      ...workflowData,
      workflowTypeId: buildRelationOption(
        workflowData?.formName,
        workflowData?.formId,
        {
          relationId: workflowData?.relationId,
          isImport: workflowData?.isImportVisible,
        },
      ),
      parentWorkflows: workflowData?.parentWorkflows,
      tabId: buildRelationOption(
        workflowData?.masterTabName,
        workflowData?.tabId,
      ),
      isActive: isEdit ? workflowData?.isActive : true,
      workflowTypeMapping: workflowData?.workflowTypeMapping || [],
    }),
    [activeMenu, workflowData, isEdit],
  );
