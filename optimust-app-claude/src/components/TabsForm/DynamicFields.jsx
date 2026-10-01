import { memo, useMemo } from "react";
import Input from "../../components/Forms/Input/Input";
import SelectField from "../../components/Forms/Select/Select";
import DateInput from "../../components/Forms/Date/Date";
import CustomCheckBox from "../../components/Forms/Checkbox/CustomCheckBox";
import BodySelect from "../Common/BodyComponent/BodySelect";
import Signature from "../Forms/Signature/Signature";
import { clearCascadeField, getCascadeRelations } from "./utils/cascadeUtils";
import CustomAutomation from "../../pages/Forms/AutomationForm/CustomAutomation";
import SelectOpField from "../Forms/Select/SelectOpField";
import AddDateTimeButton from "../Forms/Buttons/AddDateTimeButton/AddDateTimeButton";
import {
  validateParentField,
  getParentSelectedValue,
} from "../NoTabsForm/noTabConstant";

const DynamicFields = ({
  fieldMeta,
  effects,
  relationLookup,
  formMethods,
  dependentFields,
  control,
  workFlowId,
  moduleId,
  tableFieldPath,
  colSize,
}) => {
  const { setValue, getValues } = formMethods || {};

  const { type, name } = fieldMeta;
  const isSelectType = type === "select" || type === "multiselect";
  const isDateType = type?.includes("date");

  const isReadOnly = fieldMeta?.readOnly === true;
  // ✅ Memo only when needed
  const payload = useMemo(() => {
    if (!isSelectType && type !== "selectoperator" && type !== "customselect") {
      return null;
    }
    const basePayload = {
      dataTable: fieldMeta.dropdownTable,
      dataField: fieldMeta.dropdownTableColumn,
    };

    if (effects?.isRelationChild) {
      const selectedValue = Array.isArray(effects?.parentValue)
        ? effects.parentValue
            .map((item) => item?.[effects?.parentKey])
            .join(",")
        : effects?.parentValue?.[effects?.parentKey];

      return {
        ...basePayload,
        fieldDefinitionId: fieldMeta.id,
        relationId: effects.relationId,
        entityCode: fieldMeta.entityCode,
        entityId: fieldMeta.entityId,
        selectedValue,
      };
    }

    if (fieldMeta?.is_overwrite_dropdown) {
      return {
        ...basePayload,
        entityCode: fieldMeta.entityCode,
        entityId: fieldMeta.entityId,
        fieldDefinitionId: fieldMeta.id,
      };
    }

    return basePayload;
  }, [isSelectType, fieldMeta, effects, type]);

  if (!fieldMeta) return null;

  // ✅ SELECT FIELD
  if (fieldMeta?.id === 5092) {
    return (
      <CustomAutomation
        payload={payload}
        fieldMeta={fieldMeta}
        effects={effects}
        formMethods={formMethods}
        control={control}
        moduleId={moduleId}
      />
    );
  }
  if (isSelectType) {
    const relations = getCascadeRelations(relationLookup, fieldMeta.id);
    return isReadOnly && effects?.isRelationChild ? (
      <SelectOpField
        // {...fieldMeta}
        label={fieldMeta?.label || name}
        isMulti={type !== "select"}
        payload={payload}
        fieldMeta={fieldMeta}
        formMethods={formMethods}
        effects={effects}
        isRelation={
          effects?.isRelationChild || fieldMeta?.is_overwrite_dropdown
        }
      />
    ) : (
      <SelectField
        {...fieldMeta}
        label={fieldMeta?.label || name}
        isMulti={type !== "select"}
        payload={payload}
        disabled={effects?.disabled || isReadOnly}
        isRelation={
          effects?.isRelationChild || fieldMeta?.is_overwrite_dropdown
        }
        onChange={(value) => {
          fieldMeta.onChange(value);

          if (!relations.length) return;
          clearCascadeField({
            relations,
            dependentFields,
            getValues,
            currentFieldName: fieldMeta.name,
            setValue,
            ...(tableFieldPath && {
              getFieldPath: ({ field }) => tableFieldPath(field),
            }),
          });
        }}
      />
    );
  }
  if (type === "customselect") {
    return (
      <SelectField
        {...fieldMeta}
        label={fieldMeta?.label || name}
        payload={payload}
        disabled={effects?.disabled || isReadOnly}
        isRelation={
          effects?.isRelationChild || fieldMeta?.is_overwrite_dropdown
        }
        onChange={(value) => {
          const rows = getValues(`multiFields.${workFlowId}`) || [];
          const isValid = validateParentField(value, rows);
          if (!isValid) return;
          const rowPrefix = fieldMeta.name.substring(
            0,
            fieldMeta.name.lastIndexOf("."),
          );
          setValue(`${rowPrefix}.operator`, null, {
            shouldDirty: true,
            shouldValidate: true,
          });

          setValue(`${rowPrefix}.Source_Field_Values`, null, {
            shouldDirty: true,
            shouldValidate: true,
          });

          setValue(`${rowPrefix}.Target_Field_Values`, null, {
            shouldDirty: true,
            shouldValidate: true,
          });

          fieldMeta.onChange(value);
        }}
      />
    );
  }

  if (type === "customfield") {
    const selectedField = fieldMeta.selectedField;
    const check = getValues(`multiFields.${workFlowId}`) || [];
    if (!selectedField) return null;

    const parentValue = getParentSelectedValue(selectedField, check);

    return (
      <DynamicFields
        fieldMeta={{
          ...fieldMeta,
          type: selectedField?.operatorType ?? selectedField.type,
          dropdownTable: selectedField.dropdownTable,
          dropdownTableColumn: selectedField.dropdownTableColumn,
        }}
        effects={{
          ...effects,

          // Make customfield behave like relation child
          ...(selectedField.parentFieldName && {
            isRelationChild: true,
            parentValue,
            parentKey: "value",
            relationId: selectedField.relationId,
            // selectedValue,
          }),
        }}
        formMethods={formMethods}
        relationLookup={relationLookup}
        dependentFields={dependentFields}
        control={control}
        moduleId={moduleId}
      />
    );
  }

  if (type === "selectoperator") {
    return (
      <SelectField
        {...fieldMeta}
        label={fieldMeta?.label || name}
        payload={payload}
        // defaultOptions={operators}
        disabled={effects?.disabled || isReadOnly}
        isRelation={
          effects?.isRelationChild || fieldMeta?.is_overwrite_dropdown
        }
        filterType={fieldMeta.selectedField?.type}
        onChange={(value) => {
          const rowPrefix = fieldMeta.name.substring(
            0,
            fieldMeta.name.lastIndexOf("."),
          );

          setValue(`${rowPrefix}.Source_Field_Values`, null, {
            shouldDirty: true,
            shouldValidate: true,
          });

          setValue(`${rowPrefix}.Target_Field_Values`, null, {
            shouldDirty: true,
            shouldValidate: true,
          });

          fieldMeta.onChange(value);
        }}
      />
    );
  }

  // ✅ DATE FIELD
  if (isDateType) {
    return (
      <DateInput
        {...fieldMeta}
        value={fieldMeta.value}
        type="date"
        showTime={type === "datetime"}
        label={fieldMeta?.label || name}
        disabled={effects?.disabled || isReadOnly}
      />
    );
  }

  if (type === "signature") {
    return (
      <Signature
        {...fieldMeta}
        type="date"
        showTime={type === "datetime"}
        label={fieldMeta?.label || name}
        disabled={effects?.disabled || isReadOnly}
      />
    );
  }

  if (type === "body select") {
    return <BodySelect {...fieldMeta} />;
  }

  // ✅ CHECKBOX
  if (type === "checkbox") {
    return (
      <div className="flex items-center gap-2">
        <CustomCheckBox
          {...fieldMeta}
          label={fieldMeta?.label || name}
          disabled={effects?.disabled || isReadOnly}
        />
      </div>
    );
  }

  // ✅ DEFAULT INPUT
  return (
    <div
      className={`relative ${type === "textarea" && (colSize || 3) > 1 ? "col-span-2" : "col-span-1"}`}
    >
      {type === "textarea" && (name === "Comments" || name === "comments") && (
        <AddDateTimeButton
          fieldName={fieldMeta.name}
          formMethods={formMethods}
        />
      )}
      <Input
        {...fieldMeta}
        label={fieldMeta?.label || name}
        disabled={effects?.disabled || isReadOnly}
      />
    </div>
  );
};

export default memo(DynamicFields);
