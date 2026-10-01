import { memo, useCallback, useMemo } from "react";
import SingleFields from "../../TabsForm/SingleFields/SingleFields";
import CustomButton from "../../Forms/Buttons/CustomButton";
import { getDependentFields } from "../noTabConstant";

const normalizeKey = (key = "") => key.replace(/\s+/g, "_");

/**
 * Single Row Component
 * Memoized so only the changed row re-renders.
 */
const MultiFieldRow = memo(
  ({
    row,
    rowIndex,
    rowsLength,
    fields,
    allFields,
    validation,
    relation,
    control,
    colSize,
    entityId,
    formMethods,
    workflowKey,
    update,
    remove,
    workFlowId,
  }) => {
    const rowFields = useMemo(() => {
      return fields.map((field) => ({
        ...field,
        name: `multiFields.${workflowKey}.${rowIndex}.${normalizeKey(
          field.name,
        )}`,
        label: field.label || field.name,
        payload: field.payload || field.props?.payload,
        type: field.type || field.fieldType,
      }));
    }, [fields, workflowKey, rowIndex]);

    const dependentFields = useMemo(() => {
      return getDependentFields({
        currentFields: rowFields,
        allFields,
        validation,
        relation,
      });
    }, [rowFields, allFields, validation, relation]);

    const handleDelete = useCallback(() => {
      if (!row.__isNew) {
        update(rowIndex, {
          ...row,
          rowIndex: rowIndex + 1,
          __isDeleted: true,
        });
      } else {
        remove(rowIndex);
      }
    }, [row, rowIndex, update, remove]);

    const handleRestore = useCallback(() => {
      update(rowIndex, {
        ...row,
        __isDeleted: false,
      });
    }, [row, rowIndex, update]);

    return (
      <div className="relative">
        {rowIndex !== 0 &&
          (row?.__isDeleted ? (
            <button
              type="button"
              onClick={handleRestore}
              className="absolute right-1 top-1.5 z-20 rounded-full text-xs font-medium text-green-700 transition"
            >
              <i className="pi pi-undo text-[12px]!" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute right-1 top-1.5 z-20 flex items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
            >
              <i className="pi pi-trash text-[12px]!" />
            </button>
          ))}

        <div
          className={`px-1 py-2 transition-opacity ${
            row?.__isDeleted ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <SingleFields
            colSize={colSize}
            fields={rowFields}
            dependentFields={dependentFields}
            validation={validation}
            relation={relation}
            control={control}
            entityId={entityId}
            formMethods={formMethods}
            workFlowId={workFlowId}
          />
        </div>

        {rowIndex !== rowsLength - 1 && (
          <div className="border-b-[0.5px] border-(--border-inverse)" />
        )}
      </div>
    );
  },
);

MultiFieldRow.displayName = "MultiFieldRow";

const MultiFields = ({
  rows = [],
  append,
  fields = [],
  control,
  colSize,
  validation = [],
  relation = [],
  entityId = 0,
  formMethods,
  workflowKey,
  allFields = [],
  update,
  remove,
  workFlowId,
}) => {
  /**
   * Default empty row
   */
  const baseEmptyRow = useMemo(() => {
    return fields.reduce((acc, field) => {
      const key = normalizeKey(field.name);
      const type = field.type || field.fieldType;

      switch (type) {
        case "select":
        case "customselect":
        case "autocomplete":
          acc[key] = null;
          break;

        case "multiselect":
          acc[key] = [];
          break;

        case "checkbox":
        case "switch":
          acc[key] = false;
          break;

        default:
          acc[key] = "";
      }

      return acc;
    }, {});
  }, [fields]);

  const handleAddRow = useCallback(() => {
    append({
      ...baseEmptyRow,
      __isDeleted: false,
      __isNew: true,
    });
  }, [append, baseEmptyRow]);

  if (!fields.length || !workflowKey) {
    return null;
  }
  return (
    <div className="px-1">
      {rows.map((row, rowIndex) => (
        <MultiFieldRow
          key={row.id}
          row={row}
          rowIndex={rowIndex}
          rowsLength={rows.length}
          fields={fields}
          allFields={allFields}
          validation={validation}
          relation={relation}
          control={control}
          colSize={colSize}
          entityId={entityId}
          formMethods={formMethods}
          workflowKey={workflowKey}
          update={update}
          remove={remove}
          workFlowId={workFlowId}
        />
      ))}

      <CustomButton
        type="button"
        icon="pi pi-plus"
        iconPos="left"
        label="Add Fields"
        text
        onClick={handleAddRow}
        className="py-0! pb-1! text-(--text-secondary)!"
      />
    </div>
  );
};

export default memo(MultiFields);
