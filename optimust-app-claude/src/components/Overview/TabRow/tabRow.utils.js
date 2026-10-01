import {
  FIELD_GRID_BASIS,
  MAX_BASIS,
  MIN_BASIS,
  PX_PER_COLUMN,
} from "./tabRow.constants";

export const normalizeFieldName = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getSafeOrder = (value) => {
  const order = Number(value);

  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
};

export const sortFieldsNameList = (fieldsNameList = []) => {
  if (!Array.isArray(fieldsNameList)) {
    return [];
  }

  return [...fieldsNameList].sort((a, b) => {
    const importantA = Boolean(a?.isImportant);
    const importantB = Boolean(b?.isImportant);

    if (importantA !== importantB) {
      return importantA ? -1 : 1;
    }

    return getSafeOrder(a?.orderNo) - getSafeOrder(b?.orderNo);
  });
};

export const orderFieldsByMetadata = (fields = [], metadata = []) => {
  if (!Array.isArray(fields) || !Array.isArray(metadata)) {
    return [];
  }

  const orderMap = new Map();

  metadata.forEach((column, index) => {
    orderMap.set(normalizeFieldName(column?.name), index);
  });

  return fields
    .filter((field) => orderMap.has(normalizeFieldName(field?.name)))
    .sort((a, b) => {
      const orderA =
        orderMap.get(normalizeFieldName(a?.name)) ?? Number.MAX_SAFE_INTEGER;

      const orderB =
        orderMap.get(normalizeFieldName(b?.name)) ?? Number.MAX_SAFE_INTEGER;

      if (a?.rowIndex != null && b?.rowIndex != null) {
        const rowDifference = Number(a.rowIndex) - Number(b.rowIndex);

        if (rowDifference !== 0) {
          return rowDifference;
        }
      }

      return orderA - orderB;
    });
};

export const getCardBasis = (tab) => {
  if (tab?.tabTypeId !== 2) {
    return FIELD_GRID_BASIS;
  }

  const importantColumnCount =
    tab?.fieldsNameList?.reduce(
      (count, column) => count + (column?.isImportant ? 1 : 0),
      0,
    ) || 1;

  return Math.min(
    Math.max(importantColumnCount * PX_PER_COLUMN, MIN_BASIS),
    MAX_BASIS,
  );
};

export const getUniqueRowCount = (fields = []) => {
  const rows = new Set();

  fields.forEach((field) => {
    if (field?.rowIndex != null) {
      rows.add(field.rowIndex);
    }
  });

  return rows.size;
};
