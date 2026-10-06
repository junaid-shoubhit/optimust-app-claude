import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { columnField, formatCellText } from "../cellFormat";

const MIN_COLUMN_WIDTH = 10;
const MAX_COLUMN_WIDTH = 60;

// Rows sampled when sizing columns, so huge exports stay fast.
const WIDTH_SAMPLE_ROWS = 300;

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

const textLength = (value) => String(value ?? "").length;

/**
 * Worksheet matching the table: same columns in the same order, same
 * headers, and every cell formatted the way the table displays it.
 *
 * @param {object[]} columns ordered column configs ({ header, parameterName, type, ... })
 * @param {object[]} rows    API rows
 */
export const buildWorksheet = (columns, rows) => {
  const header = columns.map((column) => column.header || columnField(column));

  const body = rows.map((row) =>
    columns.map((column) =>
      formatCellText(row?.[columnField(column)], column, row),
    ),
  );

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);

  // Size each column to its header and (sampled) content.
  worksheet["!cols"] = header.map((title, index) => {
    const longest = body
      .slice(0, WIDTH_SAMPLE_ROWS)
      .reduce(
        (max, cells) => Math.max(max, textLength(cells[index])),
        textLength(title),
      );

    return {
      wch: Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, longest + 2)),
    };
  });

  // Filter dropdowns on the header row, like the table's column filters.
  if (columns.length) {
    worksheet["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: rows.length, c: columns.length - 1 },
      }),
    };
  }

  return worksheet;
};

/** Downloads `rows` as `<fileName>.xlsx`. Returns false when there's nothing to export. */
export const downloadExcel = ({
  columns = [],
  rows = [],
  fileName = "export",
}) => {
  if (!columns.length || !rows.length) return false;

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, buildWorksheet(columns, rows), "Data");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  saveAs(new Blob([buffer], { type: XLSX_MIME }), `${fileName}.xlsx`);

  return true;
};

/**
 * Ordered columns from `excelData`. Prefers the `columns` array; the older
 * `renderColumns` object is keyed by numeric parameter ids, which JavaScript
 * sorts ascending, so its order can't be trusted.
 */
export const resolveExportColumns = (excelData, fallbackRenderColumns) => {
  if (Array.isArray(excelData?.columns) && excelData.columns.length) {
    return excelData.columns;
  }

  return Object.values(excelData?.renderColumns || fallbackRenderColumns || {});
};
