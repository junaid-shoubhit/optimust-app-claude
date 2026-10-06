import { isValidElement } from "react";

import { formatDateUI } from "../../utils/constant";

/*
 * Text formatting for table cells, shared by the table and the Excel export
 * so an exported sheet always reads exactly like the table on screen.
 */

const CASE_LINK_COLUMNS = ["Case", "Case Number"];

/** "Case" / "Case Number" columns render as links to the case. */
export const isCaseLinkColumn = (column) =>
  CASE_LINK_COLUMNS.includes(column?.columnName);

/** Key used to read a column's value from a row. */
export const columnField = (column) =>
  String(column?.field ?? column?.parameterName ?? column?.key ?? "");

const isBlank = (value) =>
  value === null || value === undefined || value === "";

/** formatterId 6 marks dates already in local time; everything else is UTC. */
export const formatDateCell = (value, column, type = "date") =>
  value ? formatDateUI(value, type, column?.formatterId !== 6) : "-";

export const formatYesNo = (isYes) => (isYes ? "Yes" : "No");

const TYPE_FORMATTERS = {
  boolean: (value) => formatYesNo(value),
  checkbox: (value) => formatYesNo(Number(value)),
  date: (value, column) => formatDateCell(value, column, "date"),
  datetime: (value, column) => formatDateCell(value, column, "datetime"),
};

/** Visible text of rendered JSX (strings/numbers in the element tree). */
export const toPlainText = (node) => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") return String(node);

  if (Array.isArray(node)) return node.map(toPlainText).join("");

  if (isValidElement(node)) return toPlainText(node.props?.children);

  return "";
};

/**
 * A cell's display value as plain text (numbers stay numbers so a
 * spreadsheet can still sum them).
 *
 * Mirrors Table's rendering: case-link columns, then `customTemplate`, then
 * the type template, then the raw value.
 */
export const formatCellText = (value, column, row) => {
  if (isCaseLinkColumn(column)) return isBlank(value) ? "-" : String(value);

  const formatByType = () => {
    const formatter = TYPE_FORMATTERS[column?.type];

    if (formatter) return formatter(value, column);

    if (value === null || value === undefined) return "";

    return typeof value === "number" ? value : String(value);
  };

  if (column?.customTemplate) {
    // Templates are plain functions returning elements; reading their text
    // never renders components. Interactive cells (e.g. selects) have no
    // static text, so they fall back to the underlying value.
    const text = toPlainText(column.customTemplate(value, row)).trim();

    return text !== "" ? text : formatByType();
  }

  return formatByType();
};
