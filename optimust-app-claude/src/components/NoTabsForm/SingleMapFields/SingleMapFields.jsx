import { memo, useMemo } from "react";
import SingleFields from "../../TabsForm/SingleFields/SingleFields";
import { getDependentFields } from "../noTabConstant";

const SingleMapFields = ({
  workflow,
  validation,
  allFields,
  relation,
  control,
  entityId,
  colSize,
  formMethods,
  moduleId,
  parentDependentFields = [],
}) => {
  const dependentFields = useMemo(() => {
    return getDependentFields({
      currentFields: workflow.fields,
      allFields: [...allFields, ...parentDependentFields],
      relation,
      validation,
    });
  }, [workflow.fields, allFields, relation, validation, parentDependentFields]);
  return (
    <div className="my-2">
      <div className="mt-2">
        <SingleFields
          colSize={colSize}
          fields={workflow?.fields || []}
          validation={validation}
          relation={relation}
          control={control}
          entityId={entityId}
          dependentFields={dependentFields}
          formMethods={formMethods}
          moduleId={moduleId}
        />
      </div>
    </div>
  );
};

export default memo(SingleMapFields);
