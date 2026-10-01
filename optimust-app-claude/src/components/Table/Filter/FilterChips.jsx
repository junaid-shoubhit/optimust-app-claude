import React, { memo, useMemo } from "react";

const formatDateUS = (dateString) => {
  if (!dateString) return "";

  const [year, month, day] = String(dateString).split("-");

  if (!year || !month || !day) {
    return dateString;
  }

  return `${month}/${day}/${year}`;
};

const FilterChips = memo(function FilterChips({
  filterValues,
  filtersMeta,
  setFilterValues,
  setFilters,
}) {
  /* =====================================================
     GROUP CHIPS
     ===================================================== */

  const groupedChips = useMemo(() => {
    const groups = {};

    filtersMeta.forEach((filter) => {
      const value = filterValues?.[filter.parameterName];

      if (value === undefined || value === null || value === "") {
        return;
      }

      /*
       * Make sure group exists.
       */
      if (!groups[filter.parameterName]) {
        groups[filter.parameterName] = {
          label: filter.columnName,
          key: filter.parameterName,
          values: [],
        };
      }

      /* =================================================
         SELECT / MULTISELECT
         ================================================= */

      if (Array.isArray(value)) {
        value.forEach((item) => {
          const displayValue = item?.label ?? item?.value ?? item;

          if (
            displayValue !== undefined &&
            displayValue !== null &&
            displayValue !== ""
          ) {
            groups[filter.parameterName].values.push(displayValue);
          }
        });

        return;
      }

      /* =================================================
         OBJECT
         ================================================= */

      if (typeof value === "object") {
        /*
         * DATE RANGE
         */
        if ("from" in value || "to" in value) {
          if (value.from) {
            groups[filter.parameterName].values.push(
              `From: ${formatDateUS(value.from)}`,
            );
          }

          if (value.to) {
            groups[filter.parameterName].values.push(
              `To: ${formatDateUS(value.to)}`,
            );
          }
        } else {
          /*
           * SINGLE SELECT / CHECKBOX
           */
          const displayValue = value?.label ?? value?.value;

          if (
            displayValue !== undefined &&
            displayValue !== null &&
            displayValue !== ""
          ) {
            groups[filter.parameterName].values.push(displayValue);
          }
        }

        return;
      }

      /* =================================================
         STRING
         ================================================= */

      if (typeof value === "string") {
        value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .forEach((v) => {
            groups[filter.parameterName].values.push(v);
          });
      }
    });

    return Object.values(groups);
  }, [filterValues, filtersMeta]);

  /* =====================================================
     REMOVE CHIP
     ===================================================== */

  const removeChip = (chip) => {
    const current = filterValues?.[chip.rawKey];

    /* =================================================
       MULTI SELECT / SELECT
       ================================================= */

    if (Array.isArray(current)) {
      const remaining = current.filter(
        (item) => (item?.label ?? item?.value ?? item) !== chip.value,
      );

      /*
       * Update local UI state.
       */
      setFilterValues((prev) => {
        const updated = {
          ...prev,
        };

        if (remaining.length) {
          updated[chip.rawKey] = remaining;
        } else {
          delete updated[chip.rawKey];
        }

        return updated;
      });

      /*
       * Update actual table filters.
       */
      setFilters?.((prev) => {
        const existingFilters = prev?.filters || [];

        /*
         * If all values are removed,
         * remove the filter completely.
         */
        if (remaining.length === 0) {
          return {
            ...prev,

            filters: existingFilters.filter(
              (item) => String(item?.parameterName) !== String(chip.rawKey),
            ),

            page: 1,
          };
        }

        /*
         * Convert remaining values
         * back to API format.
         */
        const values = remaining
          .map((item) => item?.value ?? item?.id ?? item)
          .filter((item) => item !== undefined && item !== null && item !== "")
          .join(",");

        const labels = remaining
          .map((item) => item?.label ?? item?.value ?? item?.id ?? item)
          .filter(Boolean)
          .join(",");

        return {
          ...prev,

          filters: existingFilters.map((item) => {
            if (String(item?.parameterName) !== String(chip.rawKey)) {
              return item;
            }

            return {
              ...item,
              value: values,
              label: labels,
            };
          }),

          page: 1,
        };
      });

      return;
    }

    /* =================================================
       STRING
       ================================================= */

    if (typeof current === "string") {
      const parts = current
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .filter((v) => v !== chip.value);

      setFilterValues((prev) => {
        const updated = {
          ...prev,
        };

        if (parts.length) {
          updated[chip.rawKey] = parts.join(",");
        } else {
          delete updated[chip.rawKey];
        }

        return updated;
      });

      setFilters?.((prev) => {
        const existingFilters = prev?.filters || [];

        if (!parts.length) {
          return {
            ...prev,

            filters: existingFilters.filter(
              (item) => String(item?.parameterName) !== String(chip.rawKey),
            ),

            page: 1,
          };
        }

        return {
          ...prev,

          filters: existingFilters.map((item) => {
            if (String(item?.parameterName) !== String(chip.rawKey)) {
              return item;
            }

            return {
              ...item,
              value: parts.join(","),
              label: parts.join(","),
            };
          }),

          page: 1,
        };
      });

      return;
    }

    /* =================================================
       DATE RANGE
       ================================================= */

    if (
      current &&
      typeof current === "object" &&
      ("from" in current || "to" in current)
    ) {
      const updatedObj = {
        ...current,
      };

      if (chip.value.startsWith("From:")) {
        updatedObj.from = "";
      }

      if (chip.value.startsWith("To:")) {
        updatedObj.to = "";
      }

      const hasFrom = Boolean(updatedObj.from);

      const hasTo = Boolean(updatedObj.to);

      setFilterValues((prev) => {
        const updated = {
          ...prev,
        };

        if (!hasFrom && !hasTo) {
          delete updated[chip.rawKey];
        } else {
          updated[chip.rawKey] = updatedObj;
        }

        return updated;
      });

      setFilters?.((prev) => {
        const existingFilters = prev?.filters || [];

        /*
         * If both dates removed,
         * remove both corresponding
         * filters.
         */
        if (!hasFrom && !hasTo) {
          return {
            ...prev,

            filters: existingFilters.filter(
              (item) => String(item?.parameterName) !== String(chip.rawKey),
            ),

            page: 1,
          };
        }

        /*
         * For normal date/datetime
         */
        return {
          ...prev,

          filters: existingFilters.map((item) => {
            if (String(item?.parameterName) !== String(chip.rawKey)) {
              return item;
            }

            return {
              ...item,
              value: updatedObj.from || "",
              value2: updatedObj.to || null,
            };
          }),

          page: 1,
        };
      });

      return;
    }

    /* =================================================
       SINGLE OBJECT
       CHECKBOX / SINGLE VALUE
       ================================================= */

    if (current && typeof current === "object") {
      setFilterValues((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[chip.rawKey];

        return updated;
      });

      setFilters?.((prev) => ({
        ...prev,

        filters: (prev?.filters || []).filter(
          (item) => String(item?.parameterName) !== String(chip.rawKey),
        ),

        page: 1,
      }));
    }
  };

  /* =====================================================
     EMPTY STATE
     ===================================================== */

  if (!groupedChips.length) {
    return (
      <div className="flex h-full items-center justify-center py-3 text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-md">
        No filters applied
      </div>
    );
  }

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="flex flex-col gap-3 mb-2">
      {groupedChips.map((group) => (
        <div key={group.key} className="flex flex-col gap-1">
          {/* LABEL */}

          <span className="text-[11px] font-semibold text-gray-600">
            {group.label}
          </span>

          {/* VALUES */}

          <div className="flex flex-wrap items-center gap-2">
            {group.values.map((val, idx) => (
              <div
                key={`${group.key}-${idx}`}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-1"
              >
                <span className="text-[10px]">{val}</span>

                <button
                  type="button"
                  onClick={() =>
                    removeChip({
                      rawKey: group.key,
                      value: val,
                    })
                  }
                  className="ml-1 text-blue-700 hover:text-red-500 text-[10px]"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default FilterChips;
