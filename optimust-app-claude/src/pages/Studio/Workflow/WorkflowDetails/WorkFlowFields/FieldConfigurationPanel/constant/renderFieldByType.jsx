import CustomCheckBox from "../../../../../../../components/Forms/Checkbox/CustomCheckBox";
import Input from "../../../../../../../components/Forms/Input/Input";
import SelectField from "../../../../../../../components/Forms/Select/Select";
import DateInput from "../../../../../../../components/Forms/Date/Date";

const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
  page: 1,
  pageSize: 500,
});

export const renderFieldByType = ({
  field,
  fieldState,
  selectedField,
  label,
  mode = "value", // "value" | "default"
}) => {
  if (!selectedField) {
    return (
      <Input
        label={label}
        disabled
        value=""
        placeholder="Select an option first"
      />
    );
  }

  const type = selectedField?.type?.toLowerCase();

  const dropdownPayload = createPayload(
    selectedField?.dropdownTable,
    selectedField?.dropdownColumnName || "name",
  );

  const commonProps = {
    ...field,
    value: field.value,
    onChange: field.onChange,
    label,
    invalid: fieldState?.error,
  };

  switch (type) {
    /* =====================================================
       SELECT
    ===================================================== */
    case "select":
      return (
        <SelectField
          {...commonProps}
          payload={dropdownPayload}
          placeholder={
            mode === "default"
              ? "Select default value"
              : `Select ${selectedField.name}`
          }
        />
      );

    /* =====================================================
       MULTISELECT
    ===================================================== */
    case "multiselect":
      return (
        <SelectField
          {...commonProps}
          isMulti
          //   {...(mode === "value" && {
          //     isRelation: true,
          //   })}
          payload={dropdownPayload}
          placeholder={
            mode === "default"
              ? "Select default value"
              : `Select ${selectedField.name}`
          }
        />
      );

    /* =====================================================
       CHECKBOX
    ===================================================== */
    case "checkbox":
      return (
        <CustomCheckBox
          value={Boolean(field.value)}
          name={selectedField.name}
          label={label}
          required={selectedField.required}
          onChange={(e) => field.onChange(e.checked)}
          invalid={fieldState?.error}
        />
      );

    /* =====================================================
       DATE / DATETIME
    ===================================================== */
    case "date":
    case "datetime":
      return (
        <DateInput
          {...commonProps}
          type="date"
          showTime={type === "datetime"}
        />
      );

    /* =====================================================
       NUMBER
    ===================================================== */
    case "number":
    case "decimal":
    case "int":
    case "integer":
      return (
        <Input
          {...commonProps}
          type="number"
          value={field.value ?? ""}
          placeholder={
            mode === "default"
              ? "Enter default value"
              : `Enter ${selectedField.name}`
          }
          noErrorMessage={mode !== "value"}
        />
      );

    /* =====================================================
       TEXT / STRING
    ===================================================== */
    case "text":
    case "string":
    default:
      return (
        <Input
          {...commonProps}
          value={field.value ?? ""}
          placeholder={
            mode === "default"
              ? "Enter default value"
              : `Enter ${selectedField.name}`
          }
          noErrorMessage={mode !== "value"}
        />
      );
  }
};
