import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { getFieldKey } from "../tabConstant";

export const useTableFields = ({ fields, tabName, control, formMethods }) => {
  const { setValue, getValues } = formMethods;
  /* ---------------- FORM FIELDS ---------------- */
  const formFields = useMemo(() => fields.filter((f) => !f.isStatic), [fields]);

  /* ---------------- FIELD ARRAY ---------------- */
  const {
    fields: rows,
    append,
    update,
    remove,
  } = useFieldArray({
    control,
    name: `tableRows.${tabName}`,
    keyName: "fieldId",
  });

  /* ---------------- UI STATE ---------------- */
  const [mode, setMode] = useState("list");
  const [editingIndex, setEditingIndex] = useState(null);

  /* ---------------- ROW ID REF ---------------- */
  const nextRowIdRef = useRef(1);

  /* ---------------- HELPERS ---------------- */
  const cleanValues = useCallback((values = {}, allowNull = false) => {
    return Object.fromEntries(
      Object.entries(values).filter(([key, v]) => {
        if (key.startsWith("__") || key === "fieldId") return false;
        if (typeof v === "boolean") return true;
        if (v == null) return allowNull;
        if (typeof v === "string" && !v.trim()) return allowNull;

        if (
          typeof v === "object" &&
          !(v instanceof Date) &&
          !Array.isArray(v)
        ) {
          if (!v.value && !v.label) return allowNull;
        }

        if (Array.isArray(v)) return v.length > 0 || allowNull;

        return true;
      }),
    );
  }, []);

  const buildEmptyRow = useCallback(() => {
    const obj = {};
    fields.forEach((f) => {
      obj[getFieldKey(f.name)] = null;
    });
    return obj;
  }, [fields]);

  const saveRow = useCallback(() => {
    const draftValues = getValues(`draftRows.${tabName}`) || {};

    const cleaned =
      mode === "edit"
        ? cleanValues(draftValues, true)
        : cleanValues(draftValues, false);

    if (!Object.keys(cleaned).length) return;

    const emptyRow = buildEmptyRow();

    if (mode === "add") {
      append({
        ...emptyRow,
        ...cleaned,
        __rowId: nextRowIdRef.current++,
        __isNew: true,
      });
    }

    if (mode === "edit" && editingIndex !== null) {
      const currentRow = rows[editingIndex];

      // ORIGINAL CLEANED VALUES
      const originalCleaned = cleanValues(currentRow, true);

      // REMOVE INTERNAL FLAGS
      delete originalCleaned.__isEdit;
      delete originalCleaned.__isDeleted;
      delete originalCleaned.__isNew;
      delete originalCleaned.__rowId;

      // CHECK IF ANYTHING CHANGED
      const hasChanges =
        JSON.stringify(originalCleaned) !== JSON.stringify(cleaned);

      update(editingIndex, {
        ...emptyRow,
        ...cleaned,
        __rowId: currentRow.__rowId,
        __isNew: !!currentRow.__isNew,

        // ONLY TRUE WHEN ACTUAL CHANGE EXISTS
        __isEdit: !currentRow.__isNew && hasChanges,
      });
    }

    setValue(`draftRows.${tabName}`, {});
    setMode("list");
    setEditingIndex(null);
  }, [
    mode,
    editingIndex,
    rows,
    append,
    update,
    getValues,
    setValue,
    tabName,
    cleanValues,
    buildEmptyRow,
  ]);
  /* ---------------- ACTIONS ---------------- */
  const handleAdd = useCallback(() => {
    setMode("add");
    setEditingIndex(null);
    setValue(`draftRows.${tabName}`, {});
  }, [setValue, tabName]);

  const handleEdit = useCallback(
    (rowData, index) => {
      setMode("edit");
      setEditingIndex(index);
      setValue(`draftRows.${tabName}`, rowData);
    },
    [setValue, tabName],
  );

  const handleDelete = useCallback(
    (index) => {
      const currentRow = rows[index];

      if (currentRow?.__isNew) {
        remove(index);
        return;
      }

      update(index, {
        ...currentRow,
        __isDeleted: true,
      });

      if (editingIndex === index) {
        setMode("list");
        setEditingIndex(null);
        setValue(`draftRows.${tabName}`, {});
      }
    },
    [rows, remove, update, editingIndex, setValue, tabName],
  );

  const handleUndoDelete = useCallback(
    (index) => {
      const currentRow = rows[index];
      update(index, { ...currentRow, __isDeleted: false });
    },
    [rows, update],
  );

  /* ---------------- ROW ID SYNC ---------------- */
  useEffect(() => {
    if (!rows?.length) {
      nextRowIdRef.current = 1;
      return;
    }

    const maxId = rows.reduce(
      (max, row) => Math.max(max, Number(row.__rowId) || 0),
      0,
    );

    nextRowIdRef.current = maxId + 1;
  }, [rows]);

  return {
    rows,
    formFields,
    mode,
    editingIndex,
    setMode,
    setEditingIndex,
    saveRow,
    handleAdd,
    handleEdit,
    handleDelete,
    handleUndoDelete,
  };
};
