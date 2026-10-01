import { memo } from "react";

import FieldRow from "../SingleFields/FieldRow";
import ImportFromPrevious from "../ImportFromPrevious/ImportFromPrevious";

import { getFieldKey } from "../tabConstant";

import useFieldValidation from "../hooks/useFieldValidation";

const TableFields = ({
  tabName,
  mode,
  formFields = [],
  control,
  controller,
  validation = [],
  relation = [],
  entityId,
  formMethods,
  isMassUpdate,
  isImport,
  importPayload,
}) => {
  const { validationIndex, fieldEffectsMap, valuesByFieldId, relationLookup } =
    useFieldValidation({
      fields: formFields,

      validation,

      relation,

      control,

      entityId,

      isMassUpdate,

      /**
       * Table-specific field path
       *
       * Example:
       *
       * draftRows.Client.Make
       */
      getFieldName: (field) => {
        const fieldKey = field.name?.startsWith("multiFields.")
          ? field.name
          : getFieldKey(field.name);

        return `draftRows.${tabName}.${fieldKey}`;
      },
      trackChanges: false,
    });

  /**
   * List mode
   */
  if (mode === "list") {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full justify-between">
      <div className="p-3 grid grid-cols-3 gap-3 mb-4">
        {formFields.map((fieldMeta) => {
          const effects = fieldEffectsMap[fieldMeta.id] || {
            visible: true,
            disabled: false,
            required: false,
          };

          /**
           * Hidden by validation
           */
          if (!effects.visible) {
            return null;
          }

          const fieldKey = fieldMeta.name?.startsWith("multiFields.")
            ? fieldMeta.name
            : getFieldKey(fieldMeta.name);

          const name = `draftRows.${tabName}.${fieldKey}`;

          const isRequired =
            fieldMeta.isMandatory || fieldMeta.isFieldMandatory;

          return (
            <FieldRow
              key={fieldMeta.id}
              name={name}
              fieldMeta={fieldMeta}
              control={control}
              controller={controller}
              entityId={entityId}
              isRequired={isRequired}
              validationRules={validationIndex[fieldMeta.id]}
              effects={effects}
              value={valuesByFieldId[fieldMeta.id]}
              formMethods={formMethods}
              relationLookup={relationLookup}
              dependentFields={formFields}
              tableFieldPath={(field) =>
                `draftRows.${tabName}.${getFieldKey(field.name)}`
              }
            />
          );
        })}
      </div>

      {isImport && (
        <ImportFromPrevious
          isTable={true}
          fields={formFields}
          payload={importPayload}
          formMethods={formMethods}
          tabName={tabName}
        />
      )}
    </div>
  );
};

export default memo(TableFields);
