/* ------------------ HELPERS ------------------ */

import { getCascadeOptions } from "../../services/apiBinding";
import { fetchFieldDefinition } from "./CustomValues";
import { formatDateForm, formatDateForPrime } from "../../utils/constant";
import { toast } from "react-toastify";

export const normalizeKey = (key = "") => key.replace(/\s+/g, "_");
export const RAW_TEXT_DATE_DEFINITION_IDS = [4349, 4476, 4361, 1];
/* 🔥 Normalize date for comparison */

/* 🔥 Prefill mapper */
const mapFieldValue = (field, val) => {
  if (!val) return undefined;
  if (field.type === "select") return { label: val.label, value: val.value };
  if (field.type === "date") return formatDateForPrime(val.value);
  return val.value;
};

export const mapDynamicToForm = (fieldData, dynamicValues) => {
  const singleDefs = fieldData?.fieldDefinitions || [];
  const multiDefs = fieldData?.multipleFieldDefinitions || [];
  const singleValues = dynamicValues?.singleFields || {};
  const multiValues = dynamicValues?.multiFields || [];

  const singleMapped = {};
  singleDefs.forEach((field) => {
    const key = normalizeKey(field.name);
    const mapped = mapFieldValue(field, singleValues[key]);
    if (mapped !== undefined) singleMapped[key] = mapped;
  });

  const multiMapped = multiValues.map((row) => {
    const mappedRow = {};
    multiDefs.forEach((field) => {
      const key = normalizeKey(field.name);
      const mapped = mapFieldValue(field, row?.[key]);
      if (mapped !== undefined) mappedRow[key] = mapped;
    });
    return mappedRow;
  });

  return {
    ...singleMapped,
    multiFields: multiMapped.length ? multiMapped : [{}],
  };
};

/* 🔥 Build lookup map */
export const buildExistingMap = (data = []) => {
  const map = new Map();

  data.forEach((item) => {
    const key = `${item.definitionId}_${item.rowNo || 1}`;
    map.set(key, item);
  });

  return map;
};

export const getStoredValue = (item) => {
  // if (RAW_TEXT_DATE_DEFINITION_IDS.includes(item?.definitionId)) {
  if (item?.formatterId === 6) {
    if (item?.type === "date") {
      if (!item?.value) {
        return null;
      }
      if (item?.value === "current_date") {
        return new Date();
      }
      return formatDateForm(item.value, item?.type, false);
    } else if (item?.type === "datetime") {
      return formatDateForm(item.value, item?.type, false);
    }
  }
  if (
    (item.type === "select" || item.type === "customselect") &&
    item.isRelation
  ) {
    return item.relationOption
      ? {
          label: item.relationOption.label,
          value: item.relationOption.value,
          ...item.relationOption,
        }
      : null;
  }
  switch (item.type) {
    case "select":
    case "selectoperator":
    case "customfield":
      return item.value
        ? { label: item.label, value: item.value, type: item.type }
        : null;

    case "multiselect": {
      const values = (item.value || "").split(",");
      const labels = (item.label || "").split(",");

      return values
        .map((value, index) => ({
          value: value.trim(),
          label: (labels[index] || "").trim(),
          type: item.type,
        }))
        .filter((x) => x.value);
    }

    case "checkbox":
      return Number(item.value) === 1;

    case "date":
    case "datetime":
      return formatDateForm(item.value, item?.type, true);

    default:
      return item.value;
  }
};

export const convertToFormData = (singleFields) => {
  return Object.entries(singleFields).reduce((acc, [key, item]) => {
    acc[key] = getStoredValue(item);
    return acc;
  }, {});
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
};

/**
 * Converts a raw field ({ type, value, label }) into its hydrated form,
 * based on the field's `type`. This is the single source of truth for
 * the checkbox/date/select/multiselect conversion rules — previously
 * duplicated three times across this file.
 */
const normalizeFieldValue = (type, field) => {
  switch (type) {
    case "checkbox":
      return toBoolean(field.value);

    case "date":
      return field.value ? new Date(field.value) : null;

    case "select":
    case "selectoperator":
    case "customselect":
      return { value: field.value, label: field.label };

    case "multiselect":
      return Array.isArray(field.value)
        ? field.value.map((item) =>
            typeof item === "object" ? item : { value: item, label: item },
          )
        : [];

    default:
      return field.value;
  }
};

/**
 * Resolves a "customfield" value against its field definition, including
 * the select/multiselect cascade-options lookup. Returns the hydrated
 * result object (mutating a copy of `base`), or null if no definition
 * was found (caller falls back to treating it as a normal field).
 */
const resolveCustomFieldValue = async ({
  queryClient,
  fields,
  fieldValues,
  fieldKey,
  fieldValueKey,
  base,
}) => {
  const { data: definition } = await queryClient.fetchQuery({
    queryKey: ["field-definition", fields.value],
    queryFn: () => fetchFieldDefinition(fields.value),
    staleTime: 1000 * 60 * 30,
  });

  if (!definition) return null;

  const result = { ...base };

  if (result[fieldKey]) {
    result[fieldKey] = {
      ...result[fieldKey],
      type: definition.type,
      dropdownTable: definition.dropdownTable ?? null,
      dropdownTableColumn: definition.dropdownTableColumn ?? null,
    };
  }

  if (definition.type === "select" || definition.type === "multiselect") {
    const { options } = await queryClient.fetchQuery({
      queryKey: ["customfield", fields.value, fieldValues.value],
      queryFn: () =>
        getCascadeOptions({
          fieldDefinitionId: Number(fields.value),
          selectedValue: fieldValues.value,
          dataTable: "CtCustomFieldValues",
          dataField: "name",
          page: 1,
          pageSize: 999999,
        }),
      staleTime: 1000 * 60 * 30,
    });

    if (definition.type === "select" || definition.type === "multiselect") {
      const option = options;
      result[fieldValueKey] = option;
    } else {
      result[fieldValueKey] = (options || []).map((item) => ({
        value: item.value,
        label: item.label || item.name,
      }));
    }

    return result;
  }

  // checkbox / date / default all follow the normal conversion rules
  result[fieldValueKey] = normalizeFieldValue(definition.type, fieldValues);
  return result;
};

/**
 * Hydrates a single row. Rows come in two shapes:
 *  - "filter builder" rows: a dynamically-named field key (e.g. Source_Field /
 *    Target_Field / Target_Fields) paired with its _Values counterpart, plus
 *    an optional operator.
 *  - generic multifield rows: a flat map of { key: field }.
 */
const hydrateRow = async (row, queryClient) => {
  const operator = row.operator;

  const fieldKey = Object.keys(row).find(
    (key) => key !== "operator" && row[key]?.type === "customselect",
  );
  const fieldValueKey = Object.keys(row).find(
    (key) => key !== "operator" && row[key]?.type === "customfield",
  );

  const fields = fieldKey ? row[fieldKey] : null;
  const fieldValues = fieldValueKey ? row[fieldValueKey] : null;

  const isFilterBuilderRow =
    !!fields &&
    !!fieldValues &&
    (!operator || operator.type === "selectoperator");

  if (isFilterBuilderRow) {
    const base = {};

    if (fields) {
      base[fieldKey] = {
        value: fields.value,
        label: fields.label,
        type: fields.type,
      };
    }

    if (operator) {
      base.operator = { value: operator.value, label: operator.label };
    }

    if (fieldValues.type === "customfield" && fields?.value) {
      const resolved = await resolveCustomFieldValue({
        queryClient,
        fields,
        fieldValues,
        fieldKey,
        fieldValueKey,
        base,
      });
      if (resolved) return resolved;
      // no definition found — fall through to normal-field handling below
    }

    base[fieldValueKey] = normalizeFieldValue(fieldValues.type, fieldValues);
    return base;
  }

  // Generic multifield row: hydrate every key independently.
  const result = {};
  for (const [key, field] of Object.entries(row)) {
    result[key] = field ? normalizeFieldValue(field.type, field) : null;
  }
  return result;
};

export const hydrateMultiFields = async (multiFields, queryClient) => {
  if (!multiFields) return {};

  const entries = Object.entries(multiFields);

  // Hydrate every workflow's rows in parallel rather than awaiting one
  // workflow at a time — queryClient already dedupes/caches identical
  // fetchQuery calls, so this is safe and meaningfully faster when there
  // are multiple workflows to hydrate.
  const hydratedEntries = await Promise.all(
    entries.map(async ([workflowId, rows]) => [
      workflowId,
      await Promise.all(rows.map((row) => hydrateRow(row, queryClient))),
    ]),
  );

  return Object.fromEntries(hydratedEntries);
};

const parsedRuleCache = new Map();

const parseRuleJson = (ruleJson) => {
  if (parsedRuleCache.has(ruleJson)) return parsedRuleCache.get(ruleJson);
  let rules = [];
  try {
    const parsed = JSON.parse(ruleJson);
    rules = Array.isArray(parsed)
      ? parsed
      : [
          ...(parsed.create || []),
          ...(parsed.edit || []),
          ...(parsed.all || []),
        ];
  } catch (e) {
    console.warn("Invalid ruleJson", e);
  }
  parsedRuleCache.set(ruleJson, rules);
  return rules;
};

export const getDependentFields = ({
  currentFields = [],
  allFields = [],
  relation = [],
  validation = [],
}) => {
  const currentIds = new Set(currentFields.map((f) => f.id));
  const dependentIds = new Set();

  /* ---------------- Relation (Recursive) ---------------- */

  const graph = new Map();

  relation.forEach(({ parentFieldId, childFieldId }) => {
    if (!graph.has(parentFieldId)) {
      graph.set(parentFieldId, new Set());
    }

    if (!graph.has(childFieldId)) {
      graph.set(childFieldId, new Set());
    }

    graph.get(parentFieldId).add(childFieldId);
    graph.get(childFieldId).add(parentFieldId);
  });

  const visited = new Set();

  const traverse = (fieldId) => {
    // Already visited
    if (visited.has(fieldId)) return;

    // Ignore fields that don't participate in any relation
    if (!graph.has(fieldId)) return;

    visited.add(fieldId);
    dependentIds.add(fieldId);

    graph.get(fieldId).forEach(traverse);
  };

  // Start traversal only from current fields
  currentIds.forEach(traverse);

  /* ---------------- Validation ---------------- */

  validation.forEach((item) => {
    try {
      const rules = parseRuleJson(item.ruleJson);

      rules.forEach((rule) => {
        // Condition fields
        rule.conditions?.forEach((condition) => {
          if (!currentIds.has(condition.fieldId)) {
            dependentIds.add(condition.fieldId);
          }
        });

        // Target fields
        rule.actions?.forEach((action) => {
          if (!currentIds.has(action.targetFieldId)) {
            dependentIds.add(action.targetFieldId);
          }
        });
      });
    } catch (e) {
      console.error("Validation Parse Error:", e);
    }
  });

  /* ---------------- Return Field Objects ---------------- */

  return allFields.filter((field) => dependentIds.has(field.id));
};

export const getParentSelectedValue = (selectedValue, check = []) => {
  if (!selectedValue?.parentFieldId) return null;

  const parentRow = check.find((item) => {
    // Find whichever property contains the field definition
    const field = Object.values(item).find(
      (value) =>
        value &&
        typeof value === "object" &&
        Number(value?.value) === Number(selectedValue.parentFieldId),
    );

    return !!field;
  });

  if (!parentRow) return null;

  // Find whichever key contains the selected field value
  const valueKey = Object.keys(parentRow).find(
    (key) => key.endsWith("_Field_Values") && parentRow[key],
  );

  return valueKey ? parentRow[valueKey] : null;
};

export const validateParentField = (value, rows = []) => {
  if (!value?.parentFieldId) return true;

  let parentFieldRow = null;
  let parentFieldKey = null;

  for (const row of rows) {
    if (row?.__isDeleted) continue;

    const matchedKey = Object.keys(row).find((key) => {
      const field = row[key];

      return (
        field &&
        typeof field === "object" &&
        !Array.isArray(field) &&
        Number(field?.value) === Number(value.parentFieldId)
      );
    });

    if (matchedKey) {
      parentFieldRow = row;
      parentFieldKey = matchedKey;
      break;
    }
  }

  // Parent field does not exist
  if (!parentFieldRow) {
    toast.error(`Please add "${value.parentFieldName}" field first.`);
    return false;
  }

  // Determine the corresponding value key
  const valueKey =
    parentFieldKey === "Source_Field"
      ? "Source_Field_Values"
      : parentFieldKey === "Target_Fields"
        ? "Target_Field_Values"
        : `${parentFieldKey}_Values`;

  const parentValue = parentFieldRow[valueKey];

  const hasValue = Array.isArray(parentValue)
    ? parentValue.length > 0
    : parentValue !== null && parentValue !== undefined && parentValue !== "";

  if (!hasValue) {
    toast.error(`Please select a value for "${value.parentFieldName}" first.`);
    return false;
  }

  return true;
};

export const buildDefaultDynamicValues = (fieldData) => {
  const singleFormData = {};

  (fieldData?.fieldDefinitions || []).forEach((field) => {
    if (
      field.defaultValue === null ||
      field.defaultValue === undefined ||
      field.defaultValue === ""
    ) {
      return;
    }

    const key = normalizeKey(field.name);

    singleFormData[key] = {
      definitionId: field.id,
      definitionName: field.name,
      type: field.type,
      value: String(field.defaultValue),
      label: field.defaultLabel ?? "",
      isRelation: field.isRelation ?? false,
      dropdownTable: field.dropdownTable,
      dropdownTableColumn: field.dropdownTableColumn,
      relationId: field.relationId,
    };
  });
  console.log("singleFormData", singleFormData);
  return {
    // Uses the SAME conversion as dynamic API
    singleFields: convertToFormData(singleFormData),
    multiFields: {},
  };
};
