import React, { useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import SelectField from "../../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import Field from "../../../../../../../components/Forms/Field";
import Input from "../../../../../../../components/Forms/Input/Input";

import { apiRequest } from "../../../../../../../services/apiBinding";

import { FiArrowLeft } from "react-icons/fi";

import { renderFieldByType } from "../constant/renderFieldByType";

const TabRulesForm = ({
  fields = [],
  editingTabRules,
  workflowId,
  onCancel,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  /* =========================================================
     APPLY ON OPTIONS
  ========================================================= */

  const applyOnOptions = useMemo(
    () => [
      {
        label: "All",
        value: "all",
      },
      {
        label: "Create",
        value: "create",
      },
      {
        label: "Edit",
        value: "edit",
      },
    ],
    [],
  );

  /* =========================================================
     OPERATOR OPTIONS
  ========================================================= */

  const operatorOptions = useMemo(
    () => [
      {
        label: "AND",
        value: "AND",
      },
      {
        label: "OR",
        value: "OR",
      },
    ],
    [],
  );

  /* =========================================================
     FIELD OPTIONS
  ========================================================= */

  const fieldOptions = useMemo(() => {
    return (
      fields?.map((field) => ({
        label: field?.name,
        value: field?.fieldDefinitionId ?? field?.id,
      })) || []
    );
  }, [fields]);

  /* =========================================================
     DEFAULT VALUES
  ========================================================= */

  const defaultValues = useMemo(() => {
    /*
     * EDIT
     */

    if (editingTabRules) {
      return {
        applyOn: editingTabRules?.applyOn ?? {
          label: "All",
          value: "all",
        },
        name: editingTabRules?.name ?? "",
        operator: editingTabRules?.operator ?? {
          label: "AND",
          value: "AND",
        },

        ruleType: editingTabRules?.ruleTypeValue ?? {
          label: editingTabRules?.ruleType ?? "",
          value: editingTabRules?.ruleTypeId ?? "",
        },

        errorMessage: editingTabRules?.errorMessage ?? "",

        rules:
          editingTabRules?.rules?.length > 0
            ? editingTabRules.rules
            : [
                {
                  fieldId: "",
                  value: "",
                },
              ],
      };
    }

    /*
     * ADD
     */

    return {
      name: "",
      applyOn: {
        label: "All",
        value: "all",
      },

      operator: {
        label: "AND",
        value: "AND",
      },

      ruleType: "",

      errorMessage: "",

      rules: [
        {
          fieldId: "",
          value: "",
        },
      ],
    };
  }, [editingTabRules]);

  /* =========================================================
     FORM
  ========================================================= */

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    // reset,

    formState: { errors },
  } = useForm({
    mode: "onSubmit",

    reValidateMode: "onChange",

    defaultValues,
  });

  /* =========================================================
     FIELD ARRAY
  ========================================================= */

  const {
    fields: ruleFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "rules",
  });

  /* =========================================================
     WATCH RULES
  ========================================================= */

  const rules = useWatch({
    control,
    name: "rules",
  });

  /* =========================================================
     GET SELECTED FIELD
  ========================================================= */

  const getSelectedField = (fieldValue) => {
    const fieldId = fieldValue?.value ?? fieldValue;

    if (fieldId === null || fieldId === undefined || fieldId === "") {
      return null;
    }

    return fields?.find(
      (field) =>
        Number(field?.fieldDefinitionId ?? field?.id) === Number(fieldId),
    );
  };

  /* =========================================================
     ADD RULE
  ========================================================= */

  const addRule = () => {
    append({
      fieldId: "",
      value: "",
    });
  };

  /* =========================================================
     FIELD CHANGE
  ========================================================= */

  const handleFieldChange = (index, value) => {
    /*
     * Set selected field
     */

    setValue(`rules.${index}.fieldId`, value, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });

    /*
     * Reset value whenever field changes
     */

    setValue(`rules.${index}.value`, "", {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });

    /*
     * Remove old value error
     */

    clearErrors(`rules.${index}.value`);
  };

  /* =========================================================
     RENDER VALUE FIELD
  ========================================================= */

  const renderValueField = ({ field, fieldState, selectedField }) => {
    return renderFieldByType({
      field,

      fieldState,

      selectedField,

      label: "Value",

      mode: "value",
    });
  };

  /* =========================================================
     SAVE MUTATION
  ========================================================= */

  const saveRuleMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "WorkflowField/TabRule",

        method: editingTabRules?.id ? "patch" : "post",

        payload,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workflowRules", workflowId],
      });

      onSuccess?.();
    },
  });

  /* =========================================================
     SUBMIT
  ========================================================= */

  const onSubmit = (data) => {
    /* =======================================================
       ACTION
    ======================================================= */

    const action = data?.applyOn?.value ?? data?.applyOn ?? "all";

    /* =======================================================
       CONDITION
    ======================================================= */

    const condition = data?.operator?.value ?? data?.operator ?? "AND";

    /* =======================================================
       RULES
    ======================================================= */

    const rule = (data?.rules || [])
      .filter((item) => item?.fieldId)
      .map((item) => {
        const fieldId = item?.fieldId?.value ?? item?.fieldId;

        const selectedField = getSelectedField(item?.fieldId);
        const fieldType = selectedField?.type?.toLowerCase();

        let value = item?.value;
        let label = "";

        /* ===================================================
       CHECKBOX
    =================================================== */

        if (fieldType === "checkbox") {
          value = value === true ? 1 : 0;
          label = "";
        } else if (
          /* ===================================================
       SELECT / MULTI SELECT
    =================================================== */
          fieldType === "select" ||
          fieldType === "multiselect" ||
          fieldType === "multi-select"
        ) {
          /* =================================================
         MULTI SELECT
      ================================================= */

          if (Array.isArray(value)) {
            const values = value
              .map((option) =>
                typeof option === "object"
                  ? (option?.value ?? option?.id ?? "")
                  : option,
              )
              .filter(
                (item) => item !== null && item !== undefined && item !== "",
              );

            const labels = value
              .map((option) =>
                typeof option === "object"
                  ? (option?.label ?? option?.name ?? "")
                  : "",
              )
              .filter(
                (item) => item !== null && item !== undefined && item !== "",
              );

            value = values.join(",");
            label = labels.join(",");
          } else if (value && typeof value === "object") {
            /* =================================================
         SINGLE SELECT
      ================================================= */
            const selectedValue = value?.value ?? value?.id ?? "";
            const selectedLabel = value?.label ?? value?.name ?? "";

            value = selectedValue;
            label = selectedLabel;
          } else {
            value = value ?? "";
            label = "";
          }
        } else {
          /* ===================================================
       ALL OTHER FIELD TYPES
    =================================================== */
          if (value && typeof value === "object" && !Array.isArray(value)) {
            value = value?.value ?? value?.id ?? "";
          }

          label = "";
        }

        return {
          fieldId: Number(fieldId),
          value: value ?? "",
          label,
        };
      });

    /* =======================================================
       RULE JSON
    ======================================================= */

    const ruleJsonObject = {
      action,

      condition,

      rule,

      message: data?.errorMessage ?? "",
    };

    /* =======================================================
       PAYLOAD
    ======================================================= */

    const payload = {
      /*
       * Existing ID for PATCH
       * 0 for POST
       */
      id: editingTabRules?.id ?? 0,

      /*
       * Existing name
       */
      name: data?.name?.trim() ?? "",

      /*
       * Workflow
       */
      workflowId,

      /*
       * Rule Type
       */
      ruleTypeId: data?.ruleType?.value ?? data?.ruleType ?? 0,

      /*
       * Convert JSON object to string
       */
      ruleJson: JSON.stringify(ruleJsonObject),
    };

    saveRuleMutation.mutate(payload);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <form
      className="relative flex flex-col gap-4 my-2 h-full overflow-y-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-0 z-20 bg-white px-2 pt-1 pb-2 border-b-[0.5px] border-(--border-inverse)">
        <div className="flex items-center gap-3">
          {/* BACK + TITLE */}

          <div className="flex w-32.5 shrink-0 items-center gap-1">
            <button type="button" onClick={onCancel} className="cursor-pointer">
              <FiArrowLeft size={18} />
            </button>

            <h3 className="font-semibold text-sm">Select Logic</h3>
          </div>

          {/* =================================================
              APPLY ON
          ================================================= */}

          <div className="flex-1 min-w-0">
            <Field
              controller={{
                name: "applyOn",

                control,

                rules: {
                  required: "Apply On is required",
                },

                render: ({ field, fieldState }) => (
                  <SelectField
                    {...field}
                    label="Apply On"
                    value={field.value}
                    defaultOptions={applyOnOptions}
                    onChange={field.onChange}
                    isRequired
                    invalid={fieldState.error || errors?.applyOn}
                    placeholder="Select Apply On"
                    noErrorMessage
                  />
                ),
              }}
            />
          </div>

          {/* =================================================
              OPERATOR
          ================================================= */}

          <div className="flex-1 min-w-0">
            <Field
              controller={{
                name: "operator",

                control,

                rules: {
                  required: "Operator is required",
                },

                render: ({ field, fieldState }) => (
                  <SelectField
                    {...field}
                    label="Operator"
                    value={field.value}
                    defaultOptions={operatorOptions}
                    onChange={field.onChange}
                    isRequired
                    invalid={fieldState.error || errors?.operator}
                    placeholder="Select operator"
                    noErrorMessage
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          RULE TYPE + ERROR MESSAGE
      ===================================================== */}

      <div className="px-3 grid grid-cols-3 gap-2">
        {/* =====================================================
    RULE NAME
===================================================== */}

        <Field
          controller={{
            name: "name",

            control,

            rules: {
              required: "Rule Name is required",
            },

            render: ({ field, fieldState }) => (
              <Input
                {...field}
                label="Rule Name"
                value={field.value}
                onChange={field.onChange}
                isRequired
                invalid={fieldState.error}
                placeholder="Enter rule name"
              />
            ),
          }}
        />

        {/* RULE TYPE */}

        <Field
          controller={{
            name: "ruleType",

            control,

            rules: {
              required: "Rule Type is required",
            },

            render: ({ field, fieldState }) => (
              <SelectField
                {...field}
                label="Rule Type"
                value={field.value}
                onChange={field.onChange}
                isRequired
                invalid={fieldState.error}
                placeholder="Select Rule Type"
                payload={{
                  dataTable: "ctWorkflowTabRuleType",

                  dataField: "name",

                  searchTerm: "",
                }}
              />
            ),
          }}
        />

        {/* ERROR MESSAGE */}

        <Field
          controller={{
            name: "errorMessage",

            control,

            rules: {
              required: "Error Message is required",
            },

            render: ({ field, fieldState }) => (
              <Input
                {...field}
                label="Error Message"
                value={field.value}
                onChange={field.onChange}
                isRequired
                invalid={fieldState.error}
                placeholder="Enter error message"
              />
            ),
          }}
        />
      </div>

      {/* =====================================================
          RULES
      ===================================================== */}

      {ruleFields.map((rule, index) => {
        const selectedField = getSelectedField(rules?.[index]?.fieldId);

        return (
          <div
            key={rule.id}
            className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center px-3"
          >
            {/* =============================================
                  FIELD
              ============================================= */}

            <Field
              controller={{
                name: `rules.${index}.fieldId`,

                control,

                rules: {
                  required: "Option is required",
                },

                render: ({ field, fieldState }) => (
                  <SelectField
                    {...field}
                    label="Fields"
                    defaultOptions={fieldOptions}
                    value={field.value}
                    onChange={(value) => handleFieldChange(index, value)}
                    isRequired
                    invalid={
                      fieldState.error || errors?.rules?.[index]?.fieldId
                    }
                    placeholder="Select Fields"
                  />
                ),
              }}
            />

            {/* =============================================
                  VALUE
              ============================================= */}

            <Field
              controller={{
                name: `rules.${index}.value`,

                control,

                render: ({ field, fieldState }) =>
                  renderValueField({
                    field,

                    fieldState,

                    selectedField,
                  }),
              }}
            />

            {/* =============================================
                  DELETE
              ============================================= */}

            <CustomButton
              type="button"
              icon="pi pi-trash"
              severity="danger"
              text
              disabled={ruleFields.length === 1}
              onClick={() => {
                clearErrors(`rules.${index}`);

                remove(index);
              }}
            />
          </div>
        );
      })}

      {/* =====================================================
          ADD CONDITION
      ===================================================== */}

      <div className="px-3">
        <CustomButton
          type="button"
          className="saveBtn"
          label="+ Add Condition"
          onClick={addRule}
        />
      </div>

      {/* =====================================================
          BOTTOM BUTTONS
      ===================================================== */}

      <div className="bg-white px-3 sticky bottom-0 left-0 w-full flex gap-3 mt-auto pt-3 pb-1 z-10">
        {/* CANCEL */}

        <CustomButton
          type="button"
          className="outlineBtn"
          label="CANCEL"
          onClick={onCancel}
        />

        {/* SAVE / UPDATE */}

        <CustomButton
          type="submit"
          className="saveBtn"
          label={
            saveRuleMutation.isPending
              ? "Saving..."
              : editingTabRules?.id
                ? "Update Rules"
                : "Save Rules"
          }
          disabled={saveRuleMutation.isPending}
        />
      </div>
    </form>
  );
};

export default TabRulesForm;
