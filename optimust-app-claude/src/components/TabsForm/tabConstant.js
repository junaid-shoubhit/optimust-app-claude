// export const getFieldKey = (name) => name.replace(/\s+/g, "_");

import { saveformatDate, withOutUTCDateTime } from "../../utils/constant";
import { RAW_TEXT_DATE_DEFINITION_IDS } from "../NoTabsForm/noTabConstant";

export const getFieldKey = (name) => name?.replace(/[\s.]+/g, "_");
const normalize = (val) => {
  if (val == null) return null;
  if (Array.isArray(val)) return val.map(normalize);

  if (typeof val === "object") {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [k, normalize(v)]),
    );
  }

  return val;
};

export const isEqual = (a, b) => {
  const isEmpty = (val) => typeof val === "string" && val.trim() === "";

  const isNullish = (val) => val === null || val === undefined;

  if ((isEmpty(a) && isNullish(b)) || (isEmpty(b) && isNullish(a))) {
    return true;
  }
  // Date handling
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
};

export const normalizeCheckboxValue = (val) => {
  if (val === true || val === false) return val;

  if (val === "true" || val === "1" || val === 1) return true;
  if (val === "false" || val === "0" || val === 0) return false;

  return false;
};

export const normalizeValue = (def, value, label, isMassUpdate) => {
  // Default value
  let val = value ?? (isMassUpdate ? null : def.defaultValue) ?? null;

  // not added defaultValue here because will check this later
  if (def.type === "checkbox" || def.dataType?.includes("checkbox")) {
    val = normalizeCheckboxValue(value);
  }

  if (def.type === "checkbox" || def.dataType?.includes("checkbox")) {
    val = normalizeCheckboxValue(value);
  }

  if (
    (def.datatype?.toLowerCase().includes("date") && val) ||
    val instanceof Date
  ) {
    if (val === "current_date") {
      return new Date();
    }
    val = new Date(val);
  }

  if (def.type === "select" && val) {
    val = { value: val, label };
  }

  if (
    (def.type === "multiselect" || def.type === "body select") &&
    val &&
    label
  ) {
    const values = val.split(",");
    const labels = label.split(",");

    val = values
      .map((v, i) => ({
        value: v,
        label: labels[i],
      }))
      .filter((item) => item.value && item.label); // remove invalid pairs
  }

  return val;
};

export const groupTableRows = (dyn) => {
  return dyn
    .filter(
      (d) =>
        d &&
        d.rowIndex !== null &&
        d.rowIndex !== undefined &&
        d.rowIndex !== 0,
    )
    .reduce((acc, item) => {
      if (!acc[item.rowIndex]) acc[item.rowIndex] = [];
      acc[item.rowIndex].push(item);
      return acc;
    }, {});
};

// 🔥 core evaluation function for all operators and field types
export const evaluateOperator = (left, operator, right, extra, fieldType) => {
  // 🔹 normalize emptiness
  // console.log('left', left)
  // console.log('right', right)
  // console.log('fieldType', fieldType)
  // console.log('operator', operator)
  // const isEmpty =
  //   left === undefined ||
  //   left === null ||
  //   left === "" ||
  //   (Array.isArray(left) && left.length === 0);
  const isSelectEmpty =
    (fieldType === "select" || fieldType === "customselect") &&
    (!left ||
      left.value === undefined ||
      left.value === null ||
      left.value === "");

  const isMultiSelectEmpty =
    fieldType === "mutiselect" && (!Array.isArray(left) || left.length === 0);
  // console.log('isSelectEmpty', isSelectEmpty)
  const isEmpty =
    left === undefined ||
    left === null ||
    left === "" ||
    (Array.isArray(left) && left.length === 0) ||
    isSelectEmpty ||
    isMultiSelectEmpty;

  // 🔹 normalize TODAY keyword
  const todayStr = new Date().toISOString().split("T")[0];
  if (right === "TODAY") right = todayStr;

  // 🔹 helper normalizers
  const toNumber = (v) => Number(v);
  const toLower = (v) => String(v ?? "").toLowerCase();
  const toDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };
  // ===============================
  // 🔢 NUMBER OPERATORS
  // ===============================
  if (fieldType === "number" || fieldType === "int" || fieldType === "float") {
    const l = toNumber(left);
    const r = toNumber(right);

    switch (operator) {
      case "=":
        return l === r;

      case "!=":
        return l !== r;

      case ">":
        return l > r;

      case "<":
        return l < r;

      case ">=":
        return l >= r;

      case "<=":
        return l <= r;

      case "BETWEEN":
        if (!Array.isArray(extra)) return false;
        return l >= Number(extra[0]) && l <= Number(extra[1]);

      case "IS NULL":
        return isEmpty;

      case "IS NOT NULL":
        return !isEmpty;

      default:
        return true;
    }
  }

  // ===============================
  // 🔤 TEXT OPERATORS
  // ===============================
  if (
    fieldType === "text" ||
    fieldType === "textarea" ||
    fieldType === "string"
  ) {
    const l = toLower(left);
    const r = toLower(right);
    switch (operator) {
      case "=":
        return l === r;

      case "!=":
        return l !== r;

      case "CONTAINS":
        return l.includes(r);

      case "NOT CONTAINS":
        return !l.includes(r);

      case "STARTS WITH":
        return l.startsWith(r);

      case "ENDS WITH":
        return l.endsWith(r);

      case "IS NULL":
        return isEmpty;

      case "IS NOT NULL":
        return !isEmpty;

      default:
        return true;
    }
  }
  if (fieldType === "select" || fieldType === "customselect") {
    const l = toLower(left?.value);
    const r = toLower(right?.value);
    //  console.log('left', l)
    //  console.log('right', r)
    switch (operator) {
      case "=":
        return l === r;

      case "!=":
        return l !== r;

      case "CONTAINS":
        return l.includes(r);

      case "NOT CONTAINS":
        return !l.includes(r);

      case "STARTS WITH":
        return l.startsWith(r);

      case "ENDS WITH":
        return l.endsWith(r);

      case "IS NULL":
        // alert('here')
        return isEmpty;

      case "IS NOT NULL":
        return !isEmpty;

      default:
        return true;
    }
  }

  if (fieldType === "multiselect") {
    const selectedValues = Array.isArray(left)
      ? left
      : left && typeof left === "object"
        ? [left]
        : [];

    const rightValues = Array.isArray(right)
      ? right
      : right && typeof right === "object"
        ? [right]
        : [];

    const selectedIds = selectedValues
      .map((item) => (typeof item === "object" ? item?.value : item))
      .filter((value) => value !== undefined && value !== null);

    const rightIds = rightValues
      .map((item) => (typeof item === "object" ? item?.value : item))
      .filter((value) => value !== undefined && value !== null);

    console.log("selectedIds", selectedIds);
    console.log("rightIds", rightIds);

    switch (operator) {
      case "=":
        return rightIds.some((rightId) =>
          selectedIds.some(
            (selectedId) => String(selectedId) === String(rightId),
          ),
        );

      case "!=":
        return !rightIds.some((rightId) =>
          selectedIds.some(
            (selectedId) => String(selectedId) === String(rightId),
          ),
        );

      case "CONTAINS":
        return rightIds.some((rightId) =>
          selectedIds.some(
            (selectedId) => String(selectedId) === String(rightId),
          ),
        );

      case "NOT CONTAINS":
        return rightIds.every(
          (rightId) =>
            !selectedIds.some(
              (selectedId) => String(selectedId) === String(rightId),
            ),
        );

      case "STARTS WITH":
        return rightIds.some((rightId) =>
          selectedIds.some((selectedId) =>
            String(selectedId).startsWith(String(rightId)),
          ),
        );

      case "ENDS WITH":
        return rightIds.some((rightId) =>
          selectedIds.some((selectedId) =>
            String(selectedId).endsWith(String(rightId)),
          ),
        );

      case "IS NULL":
        return isEmpty;

      case "IS NOT NULL":
        return !isEmpty;

      default:
        return true;
    }
  }

  // ===============================
  // 📅 DATE OPERATORS
  // ===============================
  if (fieldType === "date" || fieldType === "datetime") {
    if (operator === "IS NULL") return isEmpty;
    if (operator === "IS NOT NULL") return !isEmpty;
    const l = toDate(left);
    const r = toDate(right);
    const today = toDate(todayStr);

    if (!l) return false;

    switch (operator) {
      case "=":
        return l?.toDateString() === r?.toDateString();

      case "!=":
        return l?.toDateString() !== r?.toDateString();

      case ">":
        return l > r;

      case "<":
        return l < r;

      case ">=":
        return l >= r;

      case "<=":
        return l <= r;

      case "BETWEEN": {
        if (!Array.isArray(extra)) return false;
        const start = toDate(extra[0]);
        const end = toDate(extra[1]);
        return l >= start && l <= end;
      }

      case "TODAY":
        return l.toDateString() === today.toDateString();

      case "PAST":
        return l < today;

      case "FUTURE":
        return l > today;

      // case "IS NULL":
      //   return isEmpty;

      // case "IS NOT NULL":
      //   return !isEmpty;

      default:
        return true;
    }
  }

  // ===============================
  // ☑️ CHECKBOX OPERATORS
  // ===============================
  if (fieldType === "checkbox") {
    const checked =
      left === true || left === 1 || left === "1" || left === "true";

    switch (operator?.toLowerCase()) {
      case "true":
        return checked;

      case "false":
        return !checked;

      case "=":
        return (
          checked ===
          (right === true || right === 1 || right === "1" || right === "true")
        );

      case "!=":
        return (
          checked !==
          (right === true || right === 1 || right === "1" || right === "true")
        );

      case "is null":
        return !checked;

      case "is not null":
        return checked;

      default:
        return false;
    }
  }

  // ===============================
  // 🧩 FALLBACK (safe default)
  // ===============================
  switch (operator) {
    case "IS NULL":
      return isEmpty;
    case "IS NOT NULL":
      return !isEmpty;
    default:
      return left == right;
  }
};

// determine if a rule's conditions are satisfied based on current field values
export const evaluateRule = (rule, valuesByFieldId, fieldType) => {
  if (!rule?.conditions?.length) return true;
  const results = rule.conditions.map((cond) => {
    const fieldValue = valuesByFieldId[cond.fieldId];

    return evaluateOperator(
      fieldValue,
      cond.operator,
      cond.value,
      cond.values,
      fieldType,
    );
  });

  return rule.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
};

export const parsedValidations = (validation) => {
  if (!validation?.length) return [];

  const normalized = [];

  validation.forEach((v) => {
    try {
      const parsed = JSON.parse(v.ruleJson);

      // ✅ CASE 1 — array of rules
      if (Array.isArray(parsed)) {
        parsed.forEach((rule) => {
          normalized.push({
            ...v,
            rule,
          });
        });
      }
      // ✅ CASE 2 — single rule object
      else {
        normalized.push({
          ...v,
          rule: parsed,
        });
      }
    } catch (err) {
      console.error("Invalid ruleJson", err);
    }
  });

  return normalized;
};

/**
 * Reusable per-field validation builder
 */
export const useFieldValidationRule = (validation, fieldId) => {
  if (!validation?.length) return null;

  const allRules = [];

  validation.forEach((v) => {
    try {
      const parsed = JSON.parse(v.ruleJson);

      if (Array.isArray(parsed)) {
        parsed.forEach((r) => allRules.push({ ...r, fieldType: v.fieldType }));
      } else {
        allRules.push({ ...parsed, fieldType: v.fieldType });
      }
    } catch {
      console.error("Invalid ruleJson");
    }
  });

  const matchedRules = allRules.filter((rule) =>
    rule?.conditions?.some((c) => c.fieldId === fieldId),
  );

  if (!matchedRules.length) return null;

  return (value) => {
    for (const rule of matchedRules) {
      const cond = rule.conditions.find((c) => c.fieldId === fieldId);
      if (!cond) continue;

      const ok = evaluateOperator(
        value,
        cond.operator,
        cond.value,
        cond.values,
        rule.fieldType,
      );

      if (!ok) {
        return cond.message || "Invalid value";
      }
    }

    return true;
  };
};

export const transformValue = (value, field) => {
  if (value == null) return value;

  // ✅ checkbox
  if (field.type === "checkbox") {
    return value ? 1 : 0;
  }

  // ✅ array (multi select)
  if (Array.isArray(value)) {
    return value.map((v) => v?.value ?? v).join(",");
  }

  // if (RAW_TEXT_DATE_DEFINITION_IDS.includes(field?.id)) {
  if (field?.formatterId === 6) {
    return withOutUTCDateTime(value);
  }

  // ✅ date
  if (value instanceof Date) {
    return saveformatDate(value, field?.type); // or your formatDate
  }

  // ✅ object (select dropdown)
  if (typeof value === "object") {
    return value?.value ?? value?.label ?? "";
  }

  return value;
};

export const getOperatorParentId = {
  5054: 5053,
  5058: 5057,
  5051: 5050,
};

export const getFieldValueParentId = {};

export const invalidateCaseOverviewIfNeeded = async ({
  queryClient,
  entityId,
  changedFieldIds,
}) => {
  console.log("invalidateCaseOverviewIfNeeded", {
    entityId,
    changedFieldIds,
  });
  if (!entityId || !changedFieldIds?.length) return;

  const overview = queryClient.getQueryData(["caseOverviewDetails", entityId]);
  const overviewFieldIds =
    overview?.fieldsDetails
      ?.map((field) => Number(field.fieldDefinitionId))
      .filter(Boolean) || [];
  if (!overviewFieldIds.length) return;

  const hasOverviewFieldChanged = changedFieldIds.some((fieldId) =>
    overviewFieldIds.includes(Number(fieldId)),
  );

  if (!hasOverviewFieldChanged) return;

  await queryClient.invalidateQueries({
    queryKey: ["caseOverviewDetails", entityId],
  });
};
