const normalizeValue = (value) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "value" in value
  ) {
    return value.value;
  }

  return value;
};

const normalizeComparable = (value) => {
  const normalized = normalizeValue(value);

  if (normalized === null || normalized === undefined) {
    return "";
  }

  return String(normalized).trim().toLowerCase();
};

const isEmpty = (value) => {
  if (value === null || value === undefined || value === "") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return isEmpty(normalizeValue(value));
  }

  return false;
};

/**
 * Get all comparable values from a field value.
 *
 * Examples:
 *
 * { value: 19103, label: "Adjuster" }
 * =>
 * ["19103", "adjuster"]
 *
 * [
 *   { value: "19103", label: "Adjuster" }
 * ]
 * =>
 * ["19103", "adjuster"]
 */
const getComparableValues = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => getComparableValues(item));
  }

  if (value && typeof value === "object") {
    const values = [];

    if (value.value !== undefined && value.value !== null) {
      values.push(normalizeComparable(value.value));
    }

    if (value.label !== undefined && value.label !== null) {
      values.push(normalizeComparable(value.label));
    }

    return values.filter(Boolean);
  }

  const normalized = normalizeComparable(value);

  return normalized ? [normalized] : [];
};

/**
 * Multiselect comparison.
 *
 * Supports:
 * actual:
 * [
 *   { value: "19103", label: "Adjuster" }
 * ]
 *
 * expected:
 * { value: 19103, label: "Adjuster" }
 */
const evaluateMultiselectOperator = (actualValue, expectedValue, operator) => {
  const actualValues = getComparableValues(actualValue);
  const expectedValues = getComparableValues(expectedValue);

  if (operator === "=" || operator === "==" || operator === "EQ") {
    return expectedValues.some((expected) => actualValues.includes(expected));
  }

  if (operator === "!=" || operator === "<>" || operator === "NEQ") {
    return !expectedValues.some((expected) => actualValues.includes(expected));
  }

  return false;
};

const evaluateOperator = (actualValue, expectedValue, operator) => {
  const normalizedOperator = operator?.toUpperCase();

  switch (normalizedOperator) {
    case "=":
    case "==":
    case "EQ":
    case "!=":
    case "<>":
    case "NEQ": {
      /*
       * If either side is an array/object option,
       * use multiselect/object-aware comparison.
       */
      if (
        Array.isArray(actualValue) ||
        Array.isArray(expectedValue) ||
        (actualValue && typeof actualValue === "object") ||
        (expectedValue && typeof expectedValue === "object")
      ) {
        return evaluateMultiselectOperator(
          actualValue,
          expectedValue,
          normalizedOperator,
        );
      }

      const actual = normalizeComparable(actualValue);
      const expected = normalizeComparable(expectedValue);

      if (
        normalizedOperator === "=" ||
        normalizedOperator === "==" ||
        normalizedOperator === "EQ"
      ) {
        return actual === expected;
      }

      return actual !== expected;
    }

    case "IS NULL":
      return isEmpty(actualValue);

    case "IS NOT NULL":
      return !isEmpty(actualValue);

    default:
      return false;
  }
};

/**
 * Compile validations once.
 *
 * Output:
 *
 * {
 *   rules: [...],
 *   showTargetIds: Set(...)
 * }
 */
export const compileVisibilityRules = (validations = [], mode = "all") => {
  const rules = [];
  const showTargetIds = new Set();

  for (const validation of validations) {
    let parsedRule;

    try {
      parsedRule =
        typeof validation.ruleJson === "string"
          ? JSON.parse(validation.ruleJson)
          : validation.ruleJson;
    } catch {
      continue;
    }

    if (!parsedRule) continue;

    const applicableRules = [
      ...(parsedRule.all || []),
      ...(mode !== "all" ? parsedRule[mode] || [] : []),
    ];

    for (const rule of applicableRules) {
      const targetIds = [];

      for (const action of rule.actions || []) {
        if (action.actionType?.toUpperCase() !== "SHOW") {
          continue;
        }

        const targetId = Number(action.targetFieldId);

        if (Number.isNaN(targetId)) {
          continue;
        }

        targetIds.push(targetId);
        showTargetIds.add(targetId);
      }

      if (!targetIds.length) continue;

      rules.push({
        logic: rule.logic?.toUpperCase() || "AND",

        conditions: (rule.conditions || []).map((condition) => ({
          fieldId: Number(condition.fieldId),
          operator: condition.operator,
          value: condition.value,
        })),

        targetIds,
      });
    }
  }

  return {
    rules,
    showTargetIds,
  };
};

/**
 * Build fieldId -> current value lookup.
 *
 * O(n)
 */
export const buildFieldValueMap = (fieldDefinitions = [], dynamicValues) => {
  const valueMap = new Map();

  const singleFields = dynamicValues?.singleFields || {};

  for (const field of fieldDefinitions) {
    const id = Number(field.id ?? field.definitionId);

    const key = field.name?.replace(/\s+/g, "_");

    valueMap.set(id, singleFields[key]);
  }

  return valueMap;
};

/**
 * Evaluate compiled rules.
 */
export const evaluateVisibilityRules = (compiledRules, fieldValueMap) => {
  const visibleTargetIds = new Set();

  for (const rule of compiledRules.rules) {
    let matched;

    if (rule.logic === "OR") {
      matched = rule.conditions.some((condition) =>
        evaluateOperator(
          fieldValueMap.get(condition.fieldId),
          condition.value,
          condition.operator,
        ),
      );
    } else {
      matched = rule.conditions.every((condition) =>
        evaluateOperator(
          fieldValueMap.get(condition.fieldId),
          condition.value,
          condition.operator,
        ),
      );
    }

    if (!matched) continue;

    for (const targetId of rule.targetIds) {
      visibleTargetIds.add(targetId);
    }
  }

  return visibleTargetIds;
};
