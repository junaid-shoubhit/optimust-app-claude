import { memo, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";

import CustomButton from "../Forms/Buttons/CustomButton";
import { NoTabSkeleton } from "./NoTabSkeleton";
import { useDynamicFieldSubmit } from "./hooks/useDynamicFieldSubmit";
import NoTabsFieldsRenderer from "./NoTabsFieldsRenderer";

const NoTabsForm = ({
  colSize,
  isLoading,
  isError,
  fieldData,
  error,
  dynamicValues,
  handleClose,
  designType,
  setStep,
  setEntityId,
  entityParentId,
  entityCodeId,
  entityId = 0,
  moduleId,
  rowIndex,
  details,
  queryKeys,
  tabQueryKey,
  onColSizeChange,
  hideParentFields,
}) => {
  const hasDynamicValues = designType !== "no-tab-static";

  /**
   * Keep the existing RHF form instance.
   * All recursive/dynamic fields will use this same control.
   */
  const { handleSubmit, control, setValue, getValues } = useForm({
    defaultValues: hasDynamicValues
      ? {
          ...dynamicValues?.singleFields,
          multiFields: dynamicValues?.multiFields || {},
          ...details?.defaultValues,
        }
      : { ...details },
    mode: "onChange",
  });

  /**
   * Keep the same automation ref.
   *
   * This is intentionally created only once at the root
   * NoTabsForm level and passed through formMethods.
   */
  const automationFieldsRef = useRef({});

  const fieldDefinitionsRef = useRef({
    fieldDefinitions: [],
    multipleFieldDefinitions: [],
  });

  /**
   * Existing submit functionality remains unchanged.
   */
  const { onSubmit, isSaving } = useDynamicFieldSubmit({
    fieldData,
    dynamicValues,
    entityId,
    entityParentId,
    entityCodeId,
    rowIndex,
    designType,
    queryKeys,
    tabQueryKey,
    handleClose,
    setEntityId,
    setStep,
    automationFieldsRef,
    fieldDefinitionsRef,
  });

  /**
   * Shared form methods.
   *
   * The same object is passed to:
   * - SingleMapFields
   * - WorkflowFields
   * - RelationFieldsTab
   * - recursively rendered NoTabsFieldsRenderer
   *
   * This preserves the existing automationFieldsRef behavior.
   */
  const formMethods = useMemo(
    () => ({
      setValue,
      getValues,
      automationFieldsRef,
    }),
    [setValue, getValues],
  );

  if (isLoading) {
    return <NoTabSkeleton colSize={colSize} />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      {isError && (
        <div className="text-red-500 px-2 py-1">
          {error?.message || "Something went wrong"}
        </div>
      )}

      {/* 
        All field/tab rendering is now handled here.

        NoTabsFieldsRenderer is responsible for:
        - grouping tabs
        - tab navigation
        - MultiFields defaults
        - SingleMapFields
        - WorkflowFields
        - RelationFieldsTab
        - recursively rendering relation fields

        It uses the SAME RHF control and formMethods.
      */}
      <NoTabsFieldsRenderer
        fieldData={fieldData}
        control={control}
        formMethods={formMethods}
        colSize={colSize}
        entityId={entityId}
        entityCodeId={entityCodeId}
        moduleId={moduleId}
        onColSizeChange={onColSizeChange}
        fieldDefinitionsRef={fieldDefinitionsRef}
        designType={designType}
        hideParentFields={hideParentFields}
      />

      {/* SAVE / CANCEL remain part of the root form only */}
      <div className="mt-4 sticky bottom-0 bg-white border-t py-2 px-2 flex justify-end gap-3">
        <CustomButton
          onClick={() => {
            handleClose();
          }}
          label="CANCEL"
          type="button"
          className="outlineBtn"
        />

        <CustomButton
          label={isSaving ? "Saving..." : "SAVE"}
          type="submit"
          className="saveBtn"
          disabled={isSaving}
        />
      </div>
    </form>
  );
};

export default memo(NoTabsForm);
