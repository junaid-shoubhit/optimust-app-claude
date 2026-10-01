import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../components/Forms/DynamicForm/UserDynamicForm";

import { useWorkflowDefaultValues } from "./useWorkflowDefaultValues";
import { useWorkflowQueries } from "./useWorkflowQueries";
import { useWorkflowFormEffects } from "./useWorkflowFormEffects";
import { useWorkflowFormFields } from "./useWorkflowFormFields";
import { useWorkflowFormSubmit } from "./useWorkflowFormSubmit";

const WorkFlowForm = ({
  setVisible,
  mode,
  workflowData,
  workflowTypeId,
  activeMenu,
}) => {
  const isEdit = mode === "edit";
  const defaultValues = useWorkflowDefaultValues({
    activeMenu,
    workflowData,
    isEdit,
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const tab = watch("tabId");

  const workflowTypeMapping = watch("workflowTypeMapping");

  const watchFormName = watch("workflowTypeId");

  // NOW MULTI SELECT
  const parentWorkflow = watch("parentWorkflows");

  const hasFormName = !!watchFormName?.value;

  /**
   * workflowTypeMapping selected IDs
   * Example:
   * [
   *   { value: 101, label: "Case" },
   *   { value: 102, label: "Claim" }
   * ]
   *
   * => "101,102"
   */
  const selectedWorkflowIds = useMemo(
    () =>
      workflowTypeMapping
        ?.map((item) => item?.value)
        .filter(Boolean)
        .join(",") || "",
    [workflowTypeMapping],
  );

  /**
   * Parent workflow selected IDs
   *
   * Example:
   * [
   *   { value: 10, label: "Workflow A" },
   *   { value: 20, label: "Workflow B" }
   * ]
   *
   * => "10,20"
   */
  const selectedParentWorkflowIds = useMemo(
    () =>
      parentWorkflow
        ?.map((item) => item?.value)
        .filter(Boolean)
        .join(",") || "",
    [parentWorkflow],
  );

  const isTabDisabled = !hasFormName || isEdit;
  const isTabNameDisabled = !hasFormName;

  const {
    formTypePayload,
    relationWorkflowPayload,
    cascadeData,
    tabPayloadWithSelection,
  } = useWorkflowQueries({
    parentWorkflow,
    selectedParentWorkflowIds,
    watchFormName,
    selectedWorkflowIds,
    isEdit,
    workflowData,
  });

  useWorkflowFormEffects({
    tab,
    hasFormName,
    workflowTypeMapping,
    parentWorkflow,
    isEdit,
    setValue,
  });

  /**
   * Edit mode:
   * Once cascade options resolve, hydrate saved workflowTypeMapping
   * into React Hook Form.
   */
  useEffect(() => {
    if (
      !isEdit ||
      !cascadeData?.options?.length ||
      !workflowData?.workflowTypeMapping?.length
    ) {
      return;
    }

    const grouped = cascadeData.options.map((option) => ({
      value: workflowData.workflowTypeMapping
        .filter((item) => item.relationalFieldDefinitionId === option.value)
        .map((item) => ({
          value: item.value,
          label: item.label,
        })),
    }));

    setValue("workflowTypeMapping", grouped);
  }, [cascadeData, isEdit, workflowData, setValue]);

  const formFields = useWorkflowFormFields({
    isEdit,
    formTypePayload,
    workflowTypeId,
    relationWorkflowPayload,
    cascadeData,
    tabPayloadWithSelection,
    isTabDisabled,
    isTabNameDisabled,
    parentWorkflow,
    isImport: watchFormName?.isImport,
  });

  const { onSubmit, handleClose, isSaving } = useWorkflowFormSubmit({
    isEdit,
    workflowTypeId,
    activeMenu,
    cascadeData,
    reset,
    setVisible,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3">
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={{
          ...errors,
          [`workflowTypeMapping.0.value`]:
            errors.workflowTypeMapping?.[0]?.value ??
            errors.workflowTypeMapping,
        }}
      />

      <div className="flex justify-end gap-3 my-3">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={isSaving ? "SAVING..." : mode === "edit" ? "UPDATE" : "NEXT"}
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || isSaving}
        />
      </div>
    </form>
  );
};

export default WorkFlowForm;
