import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../../../../../../services/apiBinding";
import TabRulesList from "./TabRulesList";
import TabRulesForm from "./TabRulesForm";

const TabRules = ({ workflowId, fields = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTabRules, setEditingTabRules] = useState(null);

  /* =========================================================
     HELPERS
  ========================================================= */

  /**
   * Normalize field type.
   */
  const normalizeFieldType = (type) => {
    return String(type ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  };

  /**
   * Check whether field is Select.
   */
  const isSelectField = (type) => {
    return normalizeFieldType(type) === "select";
  };

  /**
   * Check whether field is Multi Select.
   */
  const isMultiSelectField = (type) => {
    const normalizedType = normalizeFieldType(type);

    return (
      normalizedType === "multiselect" || normalizedType === "multioptionselect"
    );
  };

  /**
   * Get dropdown options from a field.
   */
  const getFieldOptions = (field) => {
    if (!field) return [];

    const possibleOptions = [
      field?.options,
      field?.dropdownOptions,
      field?.dropdownData,
      field?.data,
      field?.items,
      field?.values,
      field?.lookupOptions,
    ];

    const options = possibleOptions.find((item) => Array.isArray(item));

    return options || [];
  };

  /**
   * Get option value.
   */
  const getOptionValue = (option) => {
    if (!option) return "";

    return option?.value ?? option?.id ?? option?.key ?? option?.code ?? "";
  };

  /**
   * Get option label.
   */
  const getOptionLabel = (option) => {
    if (!option) return "";

    return (
      option?.label ??
      option?.name ??
      option?.text ??
      option?.title ??
      option?.description ??
      String(getOptionValue(option))
    );
  };

  /**
   * Normalize value into array.
   *
   * Supports:
   *
   * 12853
   * "12853"
   * "12853,12854"
   * [12853,12854]
   * [{ value: 12853 }]
   */
  const normalizeMultiValue = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (item && typeof item === "object") {
            return item?.value ?? item?.id ?? item?.key ?? item?.code ?? "";
          }

          return item;
        })
        .filter((item) => item !== null && item !== undefined && item !== "");
    }

    if (value && typeof value === "object") {
      return [
        value?.value ?? value?.id ?? value?.key ?? value?.code ?? "",
      ].filter((item) => item !== null && item !== undefined && item !== "");
    }

    if (typeof value === "string" && value.includes(",")) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (value !== null && value !== undefined && value !== "") {
      return [value];
    }

    return [];
  };

  /**
   * Prepare Select / Multi Select value for the form.
   *
   * IMPORTANT:
   *
   * ruleJson.label is now the source of truth.
   *
   * Example:
   *
   * {
   *   fieldId: 3224,
   *   value: 12853,
   *   label: "A CLOSE FRIEND"
   * }
   *
   * We keep:
   *
   * value = 12853
   * label = "A CLOSE FRIEND"
   */
  const prepareFieldValue = (selectedField, apiValue, apiLabel) => {
    const fieldType = selectedField?.type;

    const isSelect = isSelectField(fieldType);
    const isMultiSelect = isMultiSelectField(fieldType);

    /* =======================================================
     NON SELECT FIELD
  ======================================================= */

    if (!isSelect && !isMultiSelect) {
      return apiValue ?? "";
    }

    const options = getFieldOptions(selectedField);

    const values = normalizeMultiValue(apiValue);

    /* =======================================================
     MULTI SELECT
     
     API:
     
     value:
       "11207, 11210, 11212"

     label:
       "45 DAY RULE,FEE SCHEDULE,INVESTIGATION PENDING"

     Result:
     
     [
       { label: "45 DAY RULE", value: "11207" },
       { label: "FEE SCHEDULE", value: "11210" },
       { label: "INVESTIGATION PENDING", value: "11212" }
     ]
  ======================================================= */

    if (isMultiSelect) {
      const labels =
        typeof apiLabel === "string"
          ? apiLabel
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : Array.isArray(apiLabel)
            ? apiLabel
            : [];

      return values.map((value, index) => {
        const option = options.find(
          (item) =>
            String(getOptionValue(item)).trim() === String(value).trim(),
        );

        return {
          label:
            labels[index] ?? (option ? getOptionLabel(option) : String(value)),

          value: option ? getOptionValue(option) : value,
        };
      });
    }

    /* =======================================================
     NORMAL SELECT
  ======================================================= */

    const selectedValue = values[0];

    const option = options.find(
      (item) =>
        String(getOptionValue(item)).trim() === String(selectedValue).trim(),
    );

    return {
      label:
        apiLabel ??
        (option ? getOptionLabel(option) : String(selectedValue ?? "")),

      value: option ? getOptionValue(option) : (selectedValue ?? ""),
    };
  };

  /* =========================================================
     GET WORKFLOW RULES
  ========================================================= */

  const { data, isLoading } = useQuery({
    queryKey: ["workflowRules", workflowId],

    enabled: !!workflowId,

    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: `WorkflowField/TabRulePage/${workflowId}`,
        method: "get",
        signal,
      }),
  });

  const tabRules = data?.data || [];

  /* =========================================================
     ADD RULE
  ========================================================= */

  const startAdd = () => {
    setEditingTabRules(null);
    setIsEditing(true);
  };

  /* =========================================================
     EDIT RULE
  ========================================================= */

  const startEdit = (tabRule) => {
    if (!tabRule) return;

    let parsedRuleJson = {};

    /* =======================================================
       PARSE RULE JSON
    ======================================================= */

    try {
      parsedRuleJson =
        typeof tabRule?.ruleJson === "string"
          ? JSON.parse(tabRule.ruleJson)
          : tabRule?.ruleJson || {};
    } catch (error) {
      console.error("Failed to parse Workflow Rule JSON:", error);

      parsedRuleJson = {};
    }

    /* =======================================================
       PREPARE RULES
    ======================================================= */

    const preparedRules =
      Array.isArray(parsedRuleJson?.rule) && parsedRuleJson.rule.length > 0
        ? parsedRuleJson.rule.map((rule) => {
            const fieldId = rule?.fieldId;

            const selectedField = fields?.find(
              (field) =>
                Number(field?.fieldDefinitionId ?? field?.id) ===
                Number(fieldId),
            );

            const preparedValue = prepareFieldValue(
              selectedField,
              rule?.value,
              rule?.label,
            );

            return {
              fieldId: {
                label:
                  selectedField?.name ??
                  selectedField?.label ??
                  String(fieldId),

                value: fieldId,
              },

              value: preparedValue,
            };
          })
        : [
            {
              fieldId: "",
              value: "",
            },
          ];

    /* =======================================================
       APPLY ON
    ======================================================= */

    const action = parsedRuleJson?.action || "all";

    const applyOn = {
      label:
        action === "create" ? "Create" : action === "edit" ? "Edit" : "All",

      value: action,
    };

    /* =======================================================
       OPERATOR
    ======================================================= */

    const condition = parsedRuleJson?.condition || "AND";

    const operator = {
      label: condition,
      value: condition,
    };

    /* =======================================================
       PREPARED DATA
    ======================================================= */

    const preparedData = {
      /* =====================================================
         ORIGINAL API DATA
      ===================================================== */

      id: tabRule?.id ?? 0,

      name: tabRule?.name ?? "Workflow Rule",

      workflowId: tabRule?.workflowId ?? workflowId,

      ruleType: tabRule?.ruleType ?? "",

      ruleTypeId: tabRule?.ruleTypeId ?? 0,

      /* =====================================================
         FORM DATA
      ===================================================== */

      applyOn,

      operator,

      ruleTypeValue: {
        label: tabRule?.ruleType ?? "",

        value: tabRule?.ruleTypeId ?? "",
      },

      errorMessage: parsedRuleJson?.message ?? "",

      rules: preparedRules,
    };

    /* =======================================================
       OPEN EDIT FORM
    ======================================================= */

    setEditingTabRules(preparedData);
    setIsEditing(true);
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    setEditingTabRules(null);
    setIsEditing(false);
  };

  /* =========================================================
     SUCCESS
  ========================================================= */

  const handleSuccess = () => {
    setEditingTabRules(null);
    setIsEditing(false);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="flex flex-col gap-6 h-full">
      {!isEditing && (
        <TabRulesList
          tabRules={tabRules}
          isLoading={isLoading}
          onAdd={startAdd}
          onEdit={startEdit}
          workflowId={workflowId}
        />
      )}

      {isEditing && (
        <TabRulesForm
          workflowId={workflowId}
          fields={fields}
          editingTabRules={editingTabRules}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default TabRules;
