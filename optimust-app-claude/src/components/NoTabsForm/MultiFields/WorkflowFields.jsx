import { useFieldArray } from "react-hook-form";
import MultiFields from "./MultiFields";
import { memo } from "react";

const WorkflowFields = ({
  workflow,
  control,
  watch,
  colSize,
  entityId,
  formMethods,
  validation,
  relation,
  allFields,
}) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `multiFields.${workflow.workFlowId}`,
  });

  return (
    <div className="border-[0.5px] border-(--border-inverse) bg-(--background-table) my-2 rounded-md">
      <MultiFields
        workflowKey={workflow.workFlowId}
        workFlowId={workflow.workFlowId}
        rows={fields}
        append={append}
        remove={remove}
        update={update}
        fields={workflow.fields}
        validation={validation}
        relation={relation}
        control={control}
        watch={watch}
        colSize={colSize}
        entityId={entityId}
        formMethods={formMethods}
        allFields={allFields}
      />
    </div>
  );
};

export default memo(WorkflowFields);
