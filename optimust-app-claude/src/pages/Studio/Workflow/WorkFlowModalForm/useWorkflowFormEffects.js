import { useEffect, useRef } from "react";

export const useWorkflowFormEffects = ({
  tab,
  hasFormName,
  workflowTypeMapping,
  parentWorkflow,
  isEdit,
  setValue,
}) => {
  useEffect(() => {
    if (isEdit) return;
    setValue("tabName", tab?.label || "");
  }, [tab, setValue, isEdit]);

  useEffect(() => {
    if (hasFormName) return;
    setValue("workflowTypeMapping", []);
    setValue("tabId", null);
    setValue("tabName", "");
  }, [hasFormName, setValue]);

  useEffect(() => {
    if (isEdit || !hasFormName || workflowTypeMapping?.length) return;
    setValue("tabName", "");
    setValue("tabId", null);
  }, [workflowTypeMapping, setValue, isEdit, hasFormName]);

  // Reset cascade field values whenever Relation Workflow actually changes
  // (cleared, or switched to a different relation) — but not on initial mount,
  // so edit-mode hydration of workflowTypeMapping from saved data isn't wiped out.
  const previousParentWorkflowRef = useRef(parentWorkflow?.value);
  useEffect(() => {
    if (previousParentWorkflowRef.current === parentWorkflow?.value) return;
    previousParentWorkflowRef.current = parentWorkflow?.value;
    setValue("workflowTypeMapping", []);
  }, [parentWorkflow?.value, setValue]);
};
