import { memo } from "react";
import classNames from "classnames";
import { Skeleton } from "primereact/skeleton";

import FieldRow from "./FieldRow";
import ImportFromPrevious from "../ImportFromPrevious/ImportFromPrevious";
import { getFieldKey } from "../tabConstant";
import useFieldValidation from "../hooks/useFieldValidation";

const renderSkeletonGrid = (colSize) => (
  <div className={`grid grid-cols-${colSize || 3} gap-3 p-3`}>
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton width="40%" height="14px" />
        <Skeleton width="100%" height="30px" />
      </div>
    ))}
  </div>
);

const SingleFields = ({
  fields,
  validation,
  relation,
  control,
  originalValues,
  entityId,
  dependentFields,
  colSize,
  formMethods,
  isLoading,
  workFlowId,
  moduleId,
  isMassUpdate,
  isImport,
  importPayload,
}) => {
  const {
    sortedFields,
    validationIndex,
    fieldEffectsMap,
    changedMap,
    valuesByFieldId,
    relationLookup,
  } = useFieldValidation({
    fields,
    validation,
    relation,
    dependentFields,
    control,
    entityId,
    originalValues,
    isMassUpdate,

    /**
     * Normal SingleFields name
     */
    getFieldName: (field) => {
      if (field.name?.startsWith("multiFields.")) {
        return field.name;
      }

      return getFieldKey(field.name);
    },
  });

  if (isLoading) {
    return renderSkeletonGrid(colSize);
  }
  return (
    <div className="flex flex-col gap-5 h-full w-full justify-between">
      <div
        className={classNames(`grid gap-x-3 gap-y-2 grid-cols-${colSize || 3}`)}
      >
        {sortedFields?.map((fieldMeta) => {
          const effects = fieldEffectsMap[fieldMeta.id] || {
            visible: true,
            disabled: false,
            required: false,
          };

          if (!effects.visible) {
            return null;
          }

          const name = fieldMeta.name?.startsWith("multiFields.")
            ? fieldMeta.name
            : getFieldKey(fieldMeta.name);

          /**
           * Existing operator logic
           */
          let selectedField = null;

          if (
            fieldMeta.type === "selectoperator" ||
            fieldMeta.type === "customfield"
          ) {
            let sourceField = null;
            let operatorField = null;

            for (const field of sortedFields) {
              if (field.type === "customselect") {
                sourceField = field;
              } else if (field.type === "selectoperator") {
                operatorField = field;
              }

              if (sourceField && operatorField) {
                break;
              }
            }

            if (sourceField) {
              const selected = valuesByFieldId[sourceField.id];

              const selectedOperator = operatorField
                ? valuesByFieldId[operatorField.id]
                : null;

              selectedField = {
                ...selected,

                ...((selectedOperator?.label === "In" ||
                  selectedOperator?.label === "Not In") && {
                  operatorType: "multiselect",
                }),
              };
            }
          }

          return (
            <FieldRow
              key={fieldMeta.id}
              name={name}
              fieldMeta={fieldMeta}
              control={control}
              validationRules={validationIndex[fieldMeta.id]}
              effects={effects}
              isChanged={changedMap[fieldMeta.id]}
              value={valuesByFieldId[fieldMeta.id]}
              entityId={entityId}
              formMethods={formMethods}
              selectedField={selectedField}
              relationLookup={relationLookup}
              dependentFields={dependentFields}
              workFlowId={workFlowId}
              moduleId={moduleId}
              colSize={colSize}
            />
          );
        })}
      </div>

      {isImport && (
        <ImportFromPrevious
          fields={sortedFields}
          payload={importPayload}
          formMethods={formMethods}
        />
      )}
    </div>
  );
};

export default memo(SingleFields);
