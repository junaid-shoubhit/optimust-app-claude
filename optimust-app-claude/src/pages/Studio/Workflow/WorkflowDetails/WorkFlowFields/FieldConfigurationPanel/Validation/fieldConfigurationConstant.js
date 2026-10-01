export const operatorConfig = {
  "=": { valueCount: 1 },
  "!=": { valueCount: 1 },
  ">": { valueCount: 1 },
  "<": { valueCount: 1 },
  ">=": { valueCount: 1 },
  "<=": { valueCount: 1 },

  CONTAINS: { valueCount: 1 },
  "NOT CONTAINS": { valueCount: 1 },
  "STARTS WITH": { valueCount: 1 },
  "ENDS WITH": { valueCount: 1 },

  BETWEEN: { valueCount: 2 },
  true: { valueCount: 0 },
  false: { valueCount: 0 },

  "IS NULL": { valueCount: 0 },
  "IS NOT NULL": { valueCount: 0 },

  TODAY: { valueCount: 0 },
  PAST: { valueCount: 0 },
  FUTURE: { valueCount: 0 },
};

const operatorOptionsByType = {
  number: [
    { label: "= Equal", value: "=" },
    { label: "!=", value: "!=" },
    { label: ">", value: ">" },
    { label: "<", value: "<" },
    { label: ">=", value: ">=" },
    { label: "<=", value: "<=" },
    { label: "Between", value: "BETWEEN" },
    { label: 10, value: 10 },
    { label: "Is Not Null", value: "IS NOT NULL" },
  ],
  checkbox: [
    { label: "True", value: "true" },
    { label: "False", value: "false" },
  ],

  text: [
    { label: "Contains", value: "CONTAINS" },
    { label: "Not Contains", value: "NOT CONTAINS" },
    { label: "Starts With", value: "STARTS WITH" },
    { label: "Ends With", value: "ENDS WITH" },
    { label: "Is Null", value: "IS NULL" },
    { label: "Is Not Null", value: "IS NOT NULL" },
  ],

  textarea: [
    { label: "Contains", value: "CONTAINS" },
    { label: "Not Contains", value: "NOT CONTAINS" },
    { label: "Starts With", value: "STARTS WITH" },
    { label: "Ends With", value: "ENDS WITH" },
    { label: "Is Null", value: "IS NULL" },
    { label: "Is Not Null", value: "IS NOT NULL" },
  ],

  select: [
    { label: "=", value: "=" },
    { label: "!=", value: "!=" },
    { label: "Contains", value: "CONTAINS" },
    { label: "Not Contains", value: "NOT CONTAINS" },
    { label: "Starts With", value: "STARTS WITH" },
    { label: "Ends With", value: "ENDS WITH" },
    { label: "Is Null", value: "IS NULL" },
    { label: "Is Not Null", value: "IS NOT NULL" },
  ],
  multiselect: [
    { label: "=", value: "=" },
    { label: "!=", value: "!=" },
    { label: "Contains", value: "CONTAINS" },
    { label: "Not Contains", value: "NOT CONTAINS" },
    { label: "Starts With", value: "STARTS WITH" },
    { label: "Ends With", value: "ENDS WITH" },
    { label: "Is Null", value: "IS NULL" },
    { label: "Is Not Null", value: "IS NOT NULL" },
  ],

  date: [
    { label: "=", value: "=" },
    { label: "!=", value: "!=" },
    { label: ">", value: ">" },
    { label: "<", value: "<" },
    { label: ">=", value: ">=" },
    { label: "<=", value: "<=" },
    { label: "Between", value: "BETWEEN" },
    { label: "Today", value: "TODAY" },
    { label: "Past", value: "PAST" },
    { label: "Future", value: "FUTURE" },
    { label: "Is Null", value: "IS NULL" },
    { label: "Is Not Null", value: "IS NOT NULL" },
  ],

  datetime: [
    { label: "=", value: "=" },
    { label: "!=", value: "!=" },
    { label: ">", value: ">" },
    { label: "<", value: "<" },
    { label: ">=", value: ">=" },
    { label: "<=", value: "<=" },
    { label: "Between", value: "BETWEEN" },
    { label: "Today", value: "TODAY" },
    { label: "Past", value: "PAST" },
    { label: "Future", value: "FUTURE" },
    { label: "Is Null", value: "IS NULL" },
    { label: "Is Not Null", value: "IS NOT NULL" },
  ],
};

export const getOperatorOptions = (type) => {
  return operatorOptionsByType[type] || operatorOptionsByType.text;
};

export const formatValue = (condition) => {
  const { operator, value, extra } = condition;

  // operators without value
  if (
    ["IS NULL", "IS NOT NULL", "TODAY", "PAST", "FUTURE"].includes(operator)
  ) {
    return "";
  }

  // BETWEEN
  if (operator === "BETWEEN" && Array.isArray(extra)) {
    return `${extra[0]} AND ${extra[1]}`;
  }

  // DATE OBJECT (fix)
  if (value instanceof Date) {
    return value.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // array values
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === "object") return v?.label ?? v?.value;
        return v;
      })
      .join(", ");
  }

  // select object
  if (typeof value === "object" && value !== null) {
    return value?.label ?? value?.value ?? "";
  }

  // ISO date string
  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return value ?? "";
};
