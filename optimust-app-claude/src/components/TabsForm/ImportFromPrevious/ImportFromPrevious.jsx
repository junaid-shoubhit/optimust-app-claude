import React, { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import CustomButton from "../../Forms/Buttons/CustomButton";
import { fetchDynamicValues } from "../../NoTabsForm/hooks/useNoTabFormData";
import { getFieldKey, normalizeValue } from "../tabConstant";

const ImportFromPrevious = ({
  isTable = false,
  fields = [],
  payload,
  formMethods,
  tabName,
}) => {
  const [showPreviousData, setShowPreviousData] = useState(false);
  const [hasFetchedPreviousData, setHasFetchedPreviousData] = useState(false);

  const { setValue } = formMethods || {};

  /* =========================================================
     FETCH PREVIOUS DATA
  ========================================================= */
  const {
    mutate,
    data: response,
    isPending,
  } = useMutation({
    mutationFn: fetchDynamicValues,

    onSuccess: (response) => {
      console.log("fetchDynamic API response:", response);

      setHasFetchedPreviousData(true);
      setShowPreviousData(true);
    },

    onError: (error) => {
      console.error("fetchDynamic API error:", error);

      setHasFetchedPreviousData(false);
    },
  });

  /* =========================================================
     API DATA
  ========================================================= */
  const importedData = useMemo(() => {
    return Array.isArray(response?.data) ? response.data : [];
  }, [response]);

  /* =========================================================
     SORT FIELDS
  ========================================================= */
  const tableFields = useMemo(() => {
    if (!Array.isArray(fields)) {
      return [];
    }

    return [...fields]
      .filter((field) => field?.id != null)
      .sort(
        (a, b) =>
          Number(a?.orderByExpression ?? 0) - Number(b?.orderByExpression ?? 0),
      );
  }, [fields]);

  /* =========================================================
     GROUP API DATA INTO ROWS
     
     IMPORTANT:
     
     API can contain:
     
     entityId = 195
     rowIndex = 1
     
     entityId = 199
     rowIndex = 1
     
     These MUST be different rows.
     
     Also API may contain:
     
     entityId = 195
     definitionId = 4260
     rowIndex = 1
     
     entityId = 195
     definitionId = 4260
     rowIndex = 1
     
     In that case we treat the second occurrence as
     another row for the same entity.
  ========================================================= */
  const tableRows = useMemo(() => {
    if (importedData.length === 0) {
      return [];
    }

    /*
     * First group everything by entityId.
     */
    const entityGroups = new Map();

    importedData.forEach((item) => {
      const entityId = item?.entityId;

      if (entityId == null) {
        return;
      }

      if (!entityGroups.has(entityId)) {
        entityGroups.set(entityId, []);
      }

      entityGroups.get(entityId).push(item);
    });

    const finalRows = [];

    /*
     * Process each entity separately.
     */
    entityGroups.forEach((entityItems, entityId) => {
      /*
       * Keep track of how many times each definition
       * has appeared for this entity.
       *
       * Example:
       *
       * Make -> occurrence 1 -> row 1
       * Make -> occurrence 2 -> row 2
       */
      const definitionOccurrences = new Map();

      /*
       * Rows belonging to this entity.
       *
       * Map key:
       *
       * `${rowIndex}-${occurrence}`
       */
      const entityRows = new Map();

      entityItems.forEach((item) => {
        const definitionId = item?.definitionId;

        if (definitionId == null) {
          return;
        }

        const originalRowIndex = Number(item?.rowIndex ?? 1);

        /*
         * Count occurrence of this definition within
         * this entity.
         */
        const currentOccurrence =
          (definitionOccurrences.get(definitionId) ?? 0) + 1;

        definitionOccurrences.set(definitionId, currentOccurrence);

        /*
         * If API gives the same rowIndex for duplicate
         * definitions, occurrence separates them.
         *
         * Example:
         *
         * entity 195:
         *
         * Make sasas       -> occurrence 1
         * Make hgeuwsherwf -> occurrence 2
         *
         * becomes:
         *
         * row 1
         * row 2
         */
        const generatedRowIndex =
          currentOccurrence === 1
            ? originalRowIndex
            : `${originalRowIndex}-${currentOccurrence}`;

        const rowKey = `${originalRowIndex}-${currentOccurrence}`;

        if (!entityRows.has(rowKey)) {
          entityRows.set(rowKey, {
            rowIndex: generatedRowIndex,
            originalRowIndex,
            entityId,
            occurrence: currentOccurrence,
          });
        }

        const row = entityRows.get(rowKey);

        /*
         * Store field data.
         */
        row[definitionId] = {
          value: item?.value ?? "",
          label: item?.label ?? "",
          definitionId: item?.definitionId,
          definitionName: item?.definitionName,
          type: item?.type,
          dataType: item?.dataType,
          entityId: item?.entityId,
        };
      });

      /*
       * Add entity rows to final result.
       */
      finalRows.push(...Array.from(entityRows.values()));
    });

    /*
     * Sort:
     *
     * 1. entityId
     * 2. original row index
     * 3. occurrence
     */
    return finalRows.sort((a, b) => {
      const entityCompare = Number(a.entityId ?? 0) - Number(b.entityId ?? 0);

      if (entityCompare !== 0) {
        return entityCompare;
      }

      const rowCompare =
        Number(a.originalRowIndex ?? 0) - Number(b.originalRowIndex ?? 0);

      if (rowCompare !== 0) {
        return rowCompare;
      }

      return Number(a.occurrence ?? 0) - Number(b.occurrence ?? 0);
    });
  }, [importedData]);

  /* =========================================================
     DISPLAY VALUE
  ========================================================= */
  const getFieldValue = (row, field) => {
    const fieldData = row?.[field?.id];

    if (!fieldData) {
      return "-";
    }

    const value =
      fieldData?.label !== null &&
      fieldData?.label !== undefined &&
      fieldData?.label !== ""
        ? fieldData.label
        : fieldData.value;

    if (value === null || value === undefined || value === "") {
      return "-";
    }

    /*
     * Checkbox display
     */
    if (field?.type === "checkbox") {
      if (value === "1" || value === 1 || value === true) {
        return "Yes";
      }

      if (value === "0" || value === 0 || value === false) {
        return "No";
      }
    }

    return value;
  };

  /* =========================================================
     VIEW PREVIOUS DATA
  ========================================================= */
  const handleImport = () => {
    /*
     * Already fetched.
     *
     * Don't call API again.
     */
    if (hasFetchedPreviousData) {
      setShowPreviousData(true);
      return;
    }

    mutate({
      entityId: payload?.entityId,
      entityCodeId: payload?.entityCodeId,
      moduleId: payload?.moduleId,
      isParent: payload?.isParent,
      tabName: payload?.tabName ?? "No Tab",
      workFlowId: payload?.workFlowId,
      isImport: true,
    });
  };

  /* =========================================================
     ADD DATA
  ========================================================= */
  const handleAddData = (row) => {
    if (!setValue) {
      console.error("setValue is not available");
      return;
    }

    console.log("========================================");
    console.log("Importing previous row:", row);
    console.log("Entity ID:", row?.entityId);
    console.log("Row Index:", row?.rowIndex);
    console.log("========================================");

    tableFields.forEach((field) => {
      const fieldData = row?.[field?.id];

      /*
       * Field doesn't exist in this previous row.
       */
      if (!fieldData) {
        return;
      }

      /*
       * Preserve multiFields path.
       */
      const fieldKey = field?.name?.startsWith("multiFields.")
        ? field.name
        : getFieldKey(field.name);

      /*
       * For table fields:
       *
       * draftRows.Criminal History.First_Name
       *
       * For normal fields:
       *
       * First_Name
       */
      const fieldName = isTable ? `draftRows.${tabName}.${fieldKey}` : fieldKey;

      /*
       * Normalize according to field type.
       */
      const value = normalizeValue(field, fieldData?.value, fieldData?.label);

      console.log("Setting imported field:", {
        definitionId: field.id,
        definitionName: field.name,
        fieldName,
        value,
        rawValue: fieldData?.value,
        label: fieldData?.label,
        entityId: row?.entityId,
        rowIndex: row?.rowIndex,
        isTable,
      });

      setValue(fieldName, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    });

    /*
     * Hide previous data after importing.
     *
     * API response stays cached locally.
     * Reopening the component will NOT call the API.
     */
    setShowPreviousData(false);
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="w-full">
      {/* =====================================================
          VIEW PREVIOUS DATA
      ====================================================== */}
      <div className="flex justify-start pb-2">
        <CustomButton
          type="button"
          className="outlineBtn"
          label={
            isPending
              ? "Loading..."
              : showPreviousData
                ? "Hide Previous Data"
                : "View Previous Data"
          }
          onClick={() => {
            if (showPreviousData) {
              setShowPreviousData(false);
              return;
            }

            handleImport();
          }}
          disabled={isPending}
        />
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}
      {isPending && (
        <div className="py-4 text-sm text-gray-500">
          Loading previous data...
        </div>
      )}

      {/* =====================================================
          PREVIOUS DATA TABLE
      ====================================================== */}
      {showPreviousData && !isPending && tableRows.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full min-w-max border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                {/* Add Data */}
                <th
                  className="
                    sticky left-0 z-20
                    w-[120px] min-w-[120px]
                    whitespace-nowrap
                    border-b border-r border-gray-200
                    bg-gray-100
                    px-4 py-3
                    text-left font-semibold
                  "
                >
                  Add Data
                </th>

                {/* Entity */}
                <th
                  className="
                    whitespace-nowrap
                    border-b border-gray-200
                    px-4 py-3
                    text-left font-semibold
                  "
                >
                  Entity ID
                </th>

                {/* Row */}
                <th
                  className="
                    whitespace-nowrap
                    border-b border-gray-200
                    px-4 py-3
                    text-left font-semibold
                  "
                >
                  Row
                </th>

                {/* Fields */}
                {tableFields.map((field) => (
                  <th
                    key={field.id}
                    className="
                      whitespace-nowrap
                      border-b border-gray-200
                      px-4 py-3
                      text-left font-semibold
                    "
                  >
                    {field?.name ?? field?.label ?? "-"}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row) => (
                <tr
                  key={`${row.entityId}-${row.rowIndex}`}
                  className="hover:bg-gray-50"
                >
                  {/* Add Data */}
                  <td
                    className="
                      sticky left-0 z-10
                      w-[120px] min-w-[120px]
                      whitespace-nowrap
                      border-b border-r border-gray-100
                      bg-white
                      px-4 py-3
                    "
                  >
                    <button
                      type="button"
                      className="
                        rounded-md
                        border border-gray-300
                        px-2 py-1.5
                        text-[10px] font-medium
                        hover:bg-gray-100
                      "
                      onClick={() => handleAddData(row)}
                    >
                      Add Data
                    </button>
                  </td>

                  {/* Entity ID */}
                  {/* <td
                    className="
                      whitespace-nowrap
                      border-b border-gray-100
                      px-4 py-3
                      font-medium
                    "
                  >
                    {row?.entityId ?? "-"}
                  </td> */}

                  {/* Row */}
                  {/* <td
                    className="
                      whitespace-nowrap
                      border-b border-gray-100
                      px-4 py-3
                    "
                  >
                    {row?.rowIndex ?? "-"}
                  </td> */}

                  {/* Fields */}
                  {tableFields.map((field) => (
                    <td
                      key={`${row.entityId}-${row.rowIndex}-${field.id}`}
                      className="
                        whitespace-nowrap
                        border-b border-gray-100
                        px-4 py-3
                      "
                    >
                      {getFieldValue(row, field)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ====================================================== */}
      {showPreviousData && !isPending && tableRows.length === 0 && (
        <div className="py-4 text-sm text-gray-500">
          No previous data found.
        </div>
      )}
    </div>
  );
};

export default ImportFromPrevious;
