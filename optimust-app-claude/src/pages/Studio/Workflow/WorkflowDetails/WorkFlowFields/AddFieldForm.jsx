import { useForm } from "react-hook-form";
import Field from "../../../../../components/Forms/Field";
import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import Input from "../../../../../components/Forms/Input/Input";
import { AiFillStar } from "react-icons/ai";
import { useEffect } from "react";
import SelectField from "../../../../../components/Forms/Select/Select";
import { renderFieldByType } from "./FieldConfigurationPanel/constant/renderFieldByType";

const normalizeDefaultValueForBackend = (data) => {
  const fieldType = data?.type?.toLowerCase();
  const value = data?.defaultValue;

  // No default value
  if (value === null || value === undefined || value === "") {
    return "";
  }

  // CHECKBOX
  if (fieldType === "checkbox") {
    if (typeof value === "boolean") {
      return value ? "1" : "0";
    }

    if (typeof value === "string") {
      return value.toLowerCase() === "true" ? "1" : "0";
    }

    return String(value);
  }

  // SELECT
  if (fieldType === "select") {
    if (typeof value === "object") {
      return String(value.value ?? value.id ?? "");
    }

    return String(value);
  }

  // MULTISELECT
  if (fieldType === "multiselect") {
    if (!Array.isArray(value)) {
      return String(value);
    }

    return value
      .map((item) => {
        if (typeof item === "object") {
          return item.value ?? item.id;
        }

        return item;
      })
      .filter((item) => item !== null && item !== undefined && item !== "")
      .join(",");
  }

  // Other field types
  return value;
};

const getDefaultValue = (field) => {
  if (!field) return "";

  const type = field?.type?.toLowerCase();
  const defaultValue = field?.defaultValue;
  const defaultLabel = field?.defaultLabel;

  // CHECKBOX
  if (type === "checkbox") {
    if (
      defaultValue === null ||
      defaultValue === undefined ||
      defaultValue === ""
    ) {
      return false;
    }

    // Backend: 1 / 0
    if (defaultValue === 1 || defaultValue === "1") {
      return true;
    }

    if (defaultValue === 0 || defaultValue === "0") {
      return false;
    }

    // Backend/string: "true" / "false"
    if (typeof defaultValue === "string") {
      return defaultValue.toLowerCase() === "true";
    }

    // Already boolean
    if (typeof defaultValue === "boolean") {
      return defaultValue;
    }

    return Boolean(defaultValue);
  }

  // SELECT
  if (type === "select") {
    if (
      defaultValue === null ||
      defaultValue === undefined ||
      defaultValue === ""
    ) {
      return null;
    }

    // Already an option object
    if (typeof defaultValue === "object") {
      return {
        ...defaultValue,
        value: defaultValue.value ?? defaultValue.id,
        label:
          defaultValue.label ??
          defaultValue.name ??
          defaultLabel ??
          defaultValue.value,
      };
    }

    // Comma/string backend value
    return {
      value: defaultValue,
      label: defaultLabel ?? defaultValue,
    };
  }

  // MULTISELECT
  if (type === "multiselect") {
    if (
      defaultValue === null ||
      defaultValue === undefined ||
      defaultValue === ""
    ) {
      return [];
    }

    // Already option objects
    if (Array.isArray(defaultValue)) {
      return defaultValue.map((item) => ({
        ...item,
        value: item?.value ?? item?.id,
        label: item?.label ?? item?.name ?? item?.value,
      }));
    }

    // Comma-separated backend values
    const values = String(defaultValue)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const labels = String(defaultLabel ?? "")
      .split(",")
      .map((item) => item.trim());

    return values.map((value, index) => ({
      value,
      label: labels[index] ?? value,
    }));
  }

  // DATE / DATETIME / NUMBER / TEXT
  return defaultValue ?? "";
};

const AddFieldForm = ({ selectedField, onAdd }) => {
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      ...selectedField,
      name: selectedField?.name || "",
      isImportant: selectedField?.isImportant || false,
      isRelation: selectedField?.isRelation || false,
      isEdit: selectedField?.isEdit || false,
      formatter: selectedField?.formatterId
        ? {
            value: selectedField.formatterId,
            label: selectedField.formatterName,
          }
        : null,

      validation: selectedField?.validationId
        ? {
            value: selectedField.validationId,
            label: selectedField.validationName,
          }
        : null,
      defaultValue: getDefaultValue(selectedField),
    },
  });

  const createPayload = (dataTable, dataField = "name") => ({
    dataTable,
    dataField,
    searchTerm: "",
    page: 1,
    pageSize: 500,
  });
  const formValues = watch();

  const onSubmit = (data) => {
    const payload = {
      ...data,

      defaultValue: normalizeDefaultValueForBackend(data),
    };

    onAdd(payload);
  };

  useEffect(() => {
    if (!selectedField) return;
    console.log("selectedField", selectedField);
    reset({
      ...selectedField,
      name: selectedField.name ?? "",
      isImportant: selectedField.isImportant ?? false,
      isEdit: selectedField.isEdit ?? false,
      defaultValue: getDefaultValue(selectedField),
      formatter: selectedField?.formatterId
        ? {
            value: selectedField.formatterId,
            label: selectedField.formatterName,
          }
        : null,
      validation: selectedField?.validationId
        ? {
            value: selectedField.validationId,
            label: selectedField.validationName,
          }
        : null,
    });
  }, [selectedField, reset]);

  // const renderDefaultValueField = ({ field, fieldState }) => {
  //   const type = selectedField?.type?.toLowerCase();
  //   const label = "Default Value";
  //   switch (type) {
  //     case "select":
  //       return (
  //         <SelectField
  //           {...field}
  //           error={fieldState.error}
  //           label={label}
  //           payload={createPayload(
  //             selectedField?.dropdownTable,
  //             selectedField?.dropdownColumnName || "name",
  //           )}
  //         />
  //       );

  //     case "multiselect":
  //       return (
  //         <SelectField
  //           {...field}
  //           error={fieldState.error}
  //           label={label}
  //           isMulti
  //           payload={createPayload(
  //             selectedField?.dropdownTable,
  //             selectedField?.dropdownColumnName || "name",
  //           )}
  //         />
  //       );
  //     case "datetime":
  //     case "date":
  //       return (
  //         <DateInput
  //           {...field}
  //           type="date"
  //           showTime={type === "datetime"}
  //           label={label}
  //         />
  //       );

  //     case "number":
  //     case "decimal":
  //     case "int":
  //     case "integer":
  //       return (
  //         <Input
  //           {...field}
  //           type="number"
  //           placeholder="Enter value"
  //           noErrorMessage
  //           label={label}
  //         />
  //       );

  //     case "text":
  //     case "string":
  //     default:
  //       return (
  //         <Input
  //           {...field}
  //           placeholder="Enter default value"
  //           noErrorMessage
  //           label={label}
  //         />
  //       );
  //   }
  // };

  const renderDefaultValueField = ({ field, fieldState }) => {
    return renderFieldByType({
      field,
      fieldState,
      selectedField,
      label: "Default Value",
      mode: "default",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {/* FIELD NAME */}

          <Field
            controller={{
              name: "name",
              control,
              render: ({ field }) => (
                <Input
                  {...field}
                  label="Field Name"
                  placeholder="Enter field name"
                  noErrorMessage
                />
              ),
            }}
          />
          {/* Default Value */}
          <Field
            controller={{
              name: "defaultValue",
              control,
              render: ({ field, fieldState }) =>
                renderDefaultValueField({
                  field,
                  fieldState,
                }),
            }}
          />
        </div>

        {/* IMPORTANT */}
        <div className="flex items-center justify-between border-[0.5px] border-(--border-inverse)  rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <AiFillStar
              className={`text-lg ${
                formValues?.isImportant ? "text-yellow-400" : "text-gray-300"
              }`}
            />

            <div>
              <p className="text-sm font-medium">Mark as Important</p>
              <p className="text-xs text-gray-500">
                Important fields will be highlighted in workflow
              </p>
            </div>
          </div>

          <Field
            controller={{
              name: "isImportant",
              control,
              render: ({ field }) => (
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    {...field}
                    checked={field.value}
                    className="peer sr-only"
                  />

                  <div className="h-5 w-10 rounded-full bg-gray-300 peer-checked:bg-blue-500 transition"></div>

                  <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
                </label>
              ),
            }}
          />
        </div>

        {["select", "multiselect"].includes(selectedField?.type) && (
          <div className="flex items-center justify-between border-[0.5px] border-(--border-inverse)  rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              {/* <AiFillStar
              className={`text-lg ${
                formValues?.isImportant ? "text-yellow-400" : "text-gray-300"
              }`}
            /> */}

              <div>
                <p className="text-sm font-medium">Is Relation</p>
                <p className="text-xs text-gray-500">
                  Important fields will be highlighted in workflow
                </p>
              </div>
            </div>

            <Field
              controller={{
                name: "isRelation",
                control,
                render: ({ field }) => (
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      className="peer sr-only"
                    />

                    <div className="h-5 w-10 rounded-full bg-gray-300 peer-checked:bg-blue-500 transition"></div>

                    <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
                  </label>
                ),
              }}
            />
          </div>
        )}

        {/* FORMATTER & VALIDATION */}
        {["number", "text", "date", "datetime"].includes(
          selectedField?.type,
        ) && (
          <div className="grid grid-cols-2 gap-4">
            <Field
              controller={{
                name: "formatter",
                control,
                render: ({ field, fieldState }) => (
                  <SelectField
                    {...field}
                    error={fieldState.error}
                    label="Formatter"
                    payload={createPayload("ctFieldFormatter")}
                    // isRelation={true}
                  />
                ),
              }}
            />

            <Field
              controller={{
                name: "validation",
                control,
                render: ({ field, fieldState }) => (
                  <SelectField
                    {...field}
                    error={fieldState.error}
                    label="Validation"
                    payload={createPayload("ctFieldValidation")}
                    // isRelation={true}
                  />
                ),
              }}
            />
          </div>
        )}

        {/* PREVIEW */}
        <div className="border-[0.5px] border-(--border-inverse)  rounded-lg p-3 bg-white">
          <p className="text-xs text-gray-400 mb-1">Preview</p>

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {formValues?.name || "Field Name"}
            </p>

            {formValues?.isImportant && (
              <AiFillStar className="text-yellow-400 text-sm" />
            )}
          </div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-(--border-inverse) p-3 bg-white">
        <CustomButton
          type="submit"
          label={`${formValues?.isEdit ? "Update" : "Add"} Field`}
          className="w-full saveBtn"
        />
      </div>
    </form>
  );
};

export default AddFieldForm;
