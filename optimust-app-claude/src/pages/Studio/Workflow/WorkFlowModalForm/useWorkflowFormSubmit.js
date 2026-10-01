import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../services/apiBinding";
import {
  buildWorkflowTypeMappingPayload,
  getOptionId,
  getOptionIds,
} from "./workflowFormUtils";

export const useWorkflowFormSubmit = ({
  isEdit,
  workflowTypeId,
  activeMenu,
  cascadeData,
  reset,
  setVisible,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const saveWorkflowMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/DynamicWorkflow",
        method,
        payload,
        apiClient: "optimust",
      }),
    onSuccess: async (response) => {
      const workflow = response?.data;
      if (!workflow) return;

      queryClient.setQueryData(["workflow-details", workflow.id], response);
      await queryClient.invalidateQueries({
        queryKey: ["workflowList", workflowTypeId],
      });
      queryClient.removeQueries({ queryKey: ["selectOptions", "tabId"] });
    },
  });

  const handleClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset, setVisible]);

  const onSubmit = useCallback(
    async (values) => {
      console.log("values", values);
      const payload = {
        ...values,
        moduleId: activeMenu?.id,
        tabId: getOptionId(values.tabId),
        workflowTypeId: getOptionId(values.workflowTypeId),
        parentWorkflows: getOptionIds(values.parentWorkflows),
        workflowTypeMapping: cascadeData?.options?.length
          ? buildWorkflowTypeMappingPayload(
              values.workflowTypeMapping,
              cascadeData.options,
            )
          : [],
      };

      try {
        const response = await saveWorkflowMutation.mutateAsync({
          payload,
          method: isEdit ? "patch" : "post",
        });

        toast.success(
          isEdit
            ? "Workflow updated successfully"
            : "Workflow created successfully",
        );

        if (!isEdit) {
          navigate(`overview?id=${response?.data?.id}`, { replace: true });
        }

        handleClose();
      } catch (error) {
        console.error("Failed to save workflow:", error);
      }
    },
    [
      activeMenu,
      cascadeData,
      isEdit,
      navigate,
      saveWorkflowMutation,
      handleClose,
    ],
  );

  return { onSubmit, handleClose, isSaving: saveWorkflowMutation.isPending };
};
