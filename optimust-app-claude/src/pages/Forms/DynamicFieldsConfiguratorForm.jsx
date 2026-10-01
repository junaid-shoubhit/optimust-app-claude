import { useMemo, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import SelectField from "../../components/Forms/Select/Select";
import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import CustomToggle from "../../components/Forms/CustomToggle/CustomToggle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../services/apiBinding";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";
import CustomDate from "../../components/Forms/Date/Date";
import CustomCheckBox from "../../components/Forms/Checkbox/CustomCheckBox";
import { MdBusiness, MdPerson } from "react-icons/md";
import { getId } from "../../utils/constants/formConstants";

const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const DynamicFieldsConfiguratorForm = ({
  details,
  setVisible,
  setStep,
  setData,
  mode,
  moduleId,
  queryKeys,
}) => {
  console.log("queryKey", queryKeys);
  const queryClient = useQueryClient();

  const saveDynamicFieldsConfiguratorMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/fieldDefinition",
        method,
        payload,
        apiClient: "optimust",
      }),

    onSuccess: (response) => {
      if (!response) return;

      const partyId = response?.data?.id;

      /* ---------- Invalidate case details ---------- */

      toast.success(
        details?.id
          ? "DynamicFieldsConfigurator updated successfully"
          : "DynamicFieldsConfigurator created successfully",
      );
      reset();
      setVisible(false);
    },
  });

  /* ------------------ HELPERS ------------------ */
  const mapMultiValues = (values, key) =>
    values?.map((v) => ({ [key]: v.value })) || [];

  console.log("details", details);
  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(
    () => ({
      name: details?.name || "",

      moduleId: moduleId,

      isActive: details?.isActive ?? true,

      readonly: details?.readonly ?? false,

      isOverride: details?.isOverwriteDropdown ?? false,

      defaultValue: details?.defaultValue || "",

      type: details?.type
        ? {
            value: details?.typeId,
            label: details?.type,
          }
        : null,

      entityCode: details?.entityCode
        ? {
            value: details?.entityCodeId,
            label: details?.entityCode,
          }
        : null,

      tabName: details?.tabName
        ? {
            value: details?.tabid,
            label: details?.tabName,
          }
        : null,

      dropdownTable: details?.dropdownTable
        ? {
            value: details?.dropdownTableId,
            label: details?.dropdownTable,
          }
        : null,

      fields:
        details?.overwrite_field_definition_id &&
        details?.overwriteFieldDefinitionName
          ? {
              value: details?.overwrite_field_definition_id,
              label: details?.overwriteFieldDefinitionName,
            }
          : null,
    }),
    [details],
  );

  const entityCodePayload = useMemo(() => createPayload("ctEntityCodes"), []);

  const tabNamePayload = useMemo(() => createPayload("ctDynamicTabs"), []);

  const dataTypePayload = useMemo(() => createPayload("ctdatatype"), []);
  const typePayload = useMemo(() => createPayload("cttype"), []);

  const dropdownTablePayload = useMemo(
    () => createPayload("ctdynDropdownTablesConfiguration", "name"),
    [],
  );
  const fieldsPayload = useMemo(() => createPayload("OverWriteDropDown"), []);

  //       const dropdownColumnPayload = useMemo(
  //   () => createPayload("ctEntityCodes"),
  //   [],
  // );
  /* ------------------ FORM ------------------ */
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const isCompany = watch("isCompany");
  const isOverride = watch("isOverride");
  const entityCode = watch("entityCode");

  // Reset defaultValue when dataType changes
  const type = watch("type");
  console.log("entityCode", entityCode);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    setValue("defaultValue", null);
  }, [type?.value]);

  useEffect(() => {
    if (details) {
      reset(defaultValues);
    }
  }, [details, defaultValues, reset]);

  /* ------------------ FORM FIELDS SWITCH ------------------ */
  const formFields = useMemo(() => {
    const isDropdownType =
      type?.label === "select" || type?.label === "multiselect";

    let fields = [
      {
        name: "name",
        label: "Name",
        component: Input,
        rules: { required: "Name is required" },
        props: { isRequired: true },
      },
      {
        name: "type",
        label: "Type",
        component: SelectField,
        rules: { required: "Data type is required" },
        props: {
          payload: typePayload,
          isRequired: true,
        },
      },
    ];

    // --------------------------------------------
    // ⭐ ADD DEFAULT VALUE ONLY if NOT SELECT / MULTISELECT
    // --------------------------------------------
    if (!isDropdownType) {
      fields.push({
        name: "defaultValue",
        label: "Default Value",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Default Value
            </label>
            <div>
              {(() => {
                if (!type) return <Input {...field} type="text" />;

                switch (type?.label) {
                  case "datetime":
                    return (
                      <CustomDate
                        {...field}
                        value={field.value ? new Date(field.value) : null}
                        showTime
                        hourFormat="12"
                      />
                    );

                  case "checkbox":
                    return (
                      <CustomCheckBox
                        {...field}
                        checked={String(field.value).toLowerCase() === "true"}
                      />
                    );

                  case "date":
                    return (
                      <CustomDate
                        {...field}
                        value={field.value ? new Date(field.value) : null}
                      />
                    );
                  case 2:
                    return <SelectField {...field} />;
                  case "number":
                    return <Input {...field} type="number" />;
                  case ("text", "signature"):
                    return <Input {...field} type="text" />;
                  case ("textarea", "nvarchar(MAX)"):
                    return <Input {...field} type="textarea" />;
                  default:
                    return <Input {...field} type="text" />;
                }
              })()}
            </div>
          </div>
        ),
      });
    }

    // --------------------------------------------
    // Continue with Entity Code, Tab Name, ReadOnly
    // --------------------------------------------
    fields.push(
      {
        name: "entityCode",
        label: "Entity Code",
        component: SelectField,
        rules: { required: "Entity Code is required" },
        props: {
          payload: entityCodePayload,
          isRequired: true,
        },
      },
      {
        name: "tabName",
        label: "Tab Name",
        component: SelectField,
        rules: { required: "Tab Name is required" },
        props: {
          payload: {
            ...tabNamePayload,
            // searchTerm: entityCode?.label || "",
            entityId: entityCode?.value || 0,
          },
          isRequired: true,
          isDisabled: !entityCode?.value,
        },
      },
      {
        name: "readonly",
        label: "Read Only",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Read Only
            </label>
            <CustomToggle {...field} checked={field.value} />
          </div>
        ),
      },
    );

    // --------------------------------------------
    // Dropdown type → Add override + table/fields
    // --------------------------------------------
    if (isDropdownType) {
      fields.splice(3, 0, {
        name: "isOverride",
        label: "Override",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Override
            </label>
            <CustomToggle {...field} checked={field.value} />
          </div>
        ),
      });

      if (!isOverride) {
        fields.splice(4, 0, {
          name: "dropdownTable",
          label: "Dropdown Table",
          component: SelectField,
          rules: { required: "Dropdown Table is required" },
          props: {
            payload: dropdownTablePayload,
            isRequired: true,
          },
        });
      } else {
        fields.splice(4, 0, {
          name: "fields",
          label: "Fields",
          component: SelectField,
          rules: { required: "Field is required when override is ON" },
          props: {
            isRelation: true,
            payload: {
              ...fieldsPayload,
              entityCode: entityCode?.label,
              showAll: true,
              relationId: 0,
              fetchSize: 0,
              firmId: 0,
              userId: 0,
            },
            isRequired: true,
          },
        });
      }
    }

    return fields;
  }, [type, isOverride, entityCode]);

  useEffect(() => {
    if (!isDirty) return; //  Do nothing if user has not modified anything

    if (isCompany) {
      reset({ isCompany: true });
    } else {
      reset({ isCompany: false });
    }
  }, [isCompany]);

  /* ------------------ ACTIONS ------------------ */
  const handleClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset, setVisible]);

  const onSubmit = async (values) => {
    const dropdownTableValue =
      !values?.isOverride &&
      ["select", "multiselect"].includes(values.type?.label)
        ? values?.dropdownTable?.value1 || ""
        : "";
    const payload = {
      id: details?.id ?? 0,
      name: values.name || "",
      entityCode: values.entityCode?.label || "",
      entityCodeId: values.entityCode?.value ?? 0,

      tabName: values.tabName?.label || "",
      tabId: values.tabName?.value ?? 0,

      isDropdown: ["select", "multiselect"].includes(values.type?.label)
        ? true
        : false,
      readonly: values?.readonly ? true : false,
      isOverwriteDropdown: values?.isOverride ? true : false,

      dropdownTable: dropdownTableValue,

      dropdownTableColumn:
        dropdownTableValue === "" ? "" : dropdownTablePayload?.dataField || "",

      overwriteFieldDefinitionId: values?.isOverride
        ? getId(values?.fields)
        : null,

      isMultiSelect: values?.type?.label === "multiselect" ? true : false,
      isMultilineText: values?.type?.label === "textarea" ? true : false,

      defaultValue:
        values?.defaultValue?.value !== undefined
          ? values?.defaultValue?.value
          : (values?.defaultValue ?? ""),

      moduleId: moduleId,
      userId: 0,

      isBlank: null,
      dataType: null,
      isCalculatedField: null,

      calculationFunctionId: null,
      // TableFriendlyName: null,
      // ColumnFriendlyName: null,
      // DefaultLabel: null,
      // LinkPath: null,
      // IsMandatory: null,

      matterTypeIds: "",

      relatedInfoDataId: null,
      showAllOptions: true,
      firmId: 0,

      orderByExpression: "13",

      type: values?.type?.label || "",
    };
    console.log("payload", payload);

    try {
      await saveDynamicFieldsConfiguratorMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });
      if (queryKeys)
        await Promise.all(
          Object?.values(queryKeys)
            .filter(Boolean)
            .map((queryKey) =>
              queryClient.invalidateQueries({
                queryKey,
              }),
            ),
        );
    } catch (error) {
      console.error("error", error);

      toast.error(
        error?.response?.data?.message ||
          (mode === "edit"
            ? "Failed to update dynamic field defination"
            : "Failed to create dynamic field defination"),
      );
    }
    handleClose();
  };

  /* ------------------ JSX ------------------ */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3">
      {/* Tabs */}

      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-3"
      />

      <div className="flex justify-end gap-3 my-3">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveDynamicFieldsConfiguratorMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "NEXT"
          }
          type="submit"
          className="saveBtn"
          disabled={
            isSubmitting || saveDynamicFieldsConfiguratorMutation.isPending
          }
        />
      </div>
    </form>
  );
};

export default DynamicFieldsConfiguratorForm;
