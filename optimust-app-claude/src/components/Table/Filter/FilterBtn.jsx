import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import CustomButton from "../../Forms/Buttons/CustomButton";
import Input from "../../Forms/Input/Input";
import CustomDate from "../../Forms/Date/Date";
import SelectField from "../../Forms/Select/Select";
import FilterChips from "./FilterChips";

const FilterBtn = ({
  filtersData,
  setFilters,
  defaultFilters,
  label,
  activeMenuId,
  isLoading,
  filterValuesRef,
  filters: tableFilters,
}) => {
  const opRef = useRef(null);

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [filterValues, setFilterValues] = useState({});

  /* =====================================================
     FILTERS
     ===================================================== */

  const filters = useMemo(
    () => (filtersData || []).filter((filter) => filter.isFilter),
    [filtersData],
  );

  /* =====================================================
     DATE HELPERS
     ===================================================== */

  const parseLocalDate = useCallback((dateString) => {
    if (!dateString) return null;

    const [year, month, day] = String(dateString).split("-").map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }, []);

  const formatLocalDate = useCallback((date) => {
    if (!date) return "";

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* =====================================================
     BUILD UI VALUES FROM TABLE FILTERS
     ===================================================== */

  const buildFilterValuesFromTableFilters = useCallback(
    (activeFilters = []) => {
      const result = {};

      filters.forEach((filter) => {
        /*
         * DATE BETWEEN
         *
         * Example:
         * parameterName: "dateFrom,dateTo"
         */
        if (filter.type === "datebetween") {
          const [fromParameter, toParameter] = String(filter.parameterName)
            .split(",")
            .map((item) => item.trim());

          const fromFilter = activeFilters.find(
            (item) => String(item?.parameterName) === String(fromParameter),
          );

          const toFilter = activeFilters.find(
            (item) => String(item?.parameterName) === String(toParameter),
          );

          if (fromFilter || toFilter) {
            result[filter.parameterName] = {
              from: fromFilter?.value || "",
              to: toFilter?.value || "",
            };
          }

          return;
        }

        const activeFilter = activeFilters.find(
          (item) =>
            String(item?.parameterName) === String(filter?.parameterName),
        );

        if (!activeFilter) {
          return;
        }

        /*
         * SELECT / MULTISELECT
         *
         * Both are treated as multi-select.
         *
         * API:
         *
         * value:
         * "1,2,3"
         *
         * label:
         * "Open,Pending,Closed"
         *
         * UI:
         *
         * [
         *   { value: "1", label: "Open" },
         *   { value: "2", label: "Pending" },
         *   { value: "3", label: "Closed" }
         * ]
         */
        if (filter.type === "select" || filter.type === "multiselect") {
          const values = String(activeFilter.value || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

          const labels = String(activeFilter.label || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

          result[filter.parameterName] = values.map((value, index) => ({
            value,
            label: labels[index] ?? value,
          }));

          return;
        }

        /*
         * CHECKBOX
         *
         * Checkbox remains single-select.
         */
        if (filter.type === "checkbox") {
          result[filter.parameterName] = {
            value: activeFilter.value,
            label: activeFilter.label ?? activeFilter.value,
          };

          return;
        }

        /*
         * DATE / DATETIME
         */
        if (filter.type === "date" || filter.type === "datetime") {
          result[filter.parameterName] = {
            from: activeFilter.value || "",
            to: activeFilter.value2 || "",
          };

          return;
        }

        /*
         * TEXT / NUMBER / OTHER
         */
        result[filter.parameterName] = activeFilter.value;
      });

      return result;
    },
    [filters],
  );

  /* =====================================================
     SYNC TABLE FILTERS -> FILTER BUTTON
     ===================================================== */

  useEffect(() => {
    const nextValues = buildFilterValuesFromTableFilters(
      tableFilters?.filters || [],
    );

    setFilterValues(nextValues);
  }, [tableFilters?.filters, buildFilterValuesFromTableFilters]);

  /* =====================================================
     UPDATE LOCAL VALUE
     ===================================================== */

  const updateValue = useCallback((parameterName, value) => {
    setFilterValues((prev) => {
      const updated = {
        ...prev,
      };

      const isEmptyArray = Array.isArray(value) && value.length === 0;

      const isEmptyString = typeof value === "string" && value.trim() === "";

      const isNullish = value === null || value === undefined;

      if (isEmptyArray || isEmptyString || isNullish) {
        delete updated[parameterName];
      } else {
        updated[parameterName] = value;
      }

      return updated;
    });
  }, []);

  /* =====================================================
     RENDER FILTER INPUT
     ===================================================== */

  const renderInput = (filter) => {
    const value = filterValues[filter.parameterName];

    switch (filter.type) {
      /* -------------------------------------------------
         TEXT
         ------------------------------------------------- */

      case "text":
      case "number":
        return (
          <Input
            label={filter.columnName}
            type={filter.type}
            className="w-full"
            value={value ?? ""}
            onChange={(e) =>
              updateValue(
                filter.parameterName,
                e.target.value.replace(/\s*,\s*/g, ", "),
              )
            }
            rows={2}
            placeholder={`Enter ${filter.columnName}`}
          />
        );

      /* -------------------------------------------------
         TEXT AREA
         ------------------------------------------------- */

      case "TextArea":
        return (
          <Input
            label={filter.columnName}
            type="textarea"
            className="w-full"
            value={value ?? ""}
            onChange={(e) => updateValue(filter.parameterName, e.target.value)}
            rows={2}
            placeholder={`Enter ${filter.columnName}`}
          />
        );

      /* -------------------------------------------------
         DATE / DATETIME / DATE BETWEEN
         ------------------------------------------------- */

      case "date":
      case "datetime":
      case "datebetween":
        return (
          <CustomDate
            label={filter.columnName}
            className="w-full text-sm"
            selectionMode="range"
            value={
              value
                ? [
                    value.from ? parseLocalDate(value.from) : null,

                    value.to ? parseLocalDate(value.to) : null,
                  ]
                : null
            }
            onChange={(e) => {
              const selected = e.value;

              if (!selected || selected.length === 0) {
                updateValue(filter.parameterName, "");

                return;
              }

              const [start, end] = selected;

              updateValue(filter.parameterName, {
                from: formatLocalDate(start),
                to: formatLocalDate(end),
              });
            }}
          />
        );

      /* -------------------------------------------------
         SELECT / MULTISELECT
         
         BOTH ARE MULTI SELECT
         ------------------------------------------------- */

      case "select":
      case "multiselect":
        return (
          <SelectField
            label={filter.columnName}
            placeholder={filter.columnName}
            payload={{
              dataTable: filter.dataTable,
              dataField: filter.dataField,
            }}
            isMulti
            selecthMaxHeight="80px"
            value={value || []}
            onChange={(selected) =>
              updateValue(filter.parameterName, selected || [])
            }
          />
        );

      /* -------------------------------------------------
         CHECKBOX
         
         SINGLE SELECT
         ------------------------------------------------- */

      case "checkbox":
        return (
          <SelectField
            label={filter.columnName}
            placeholder={`Select ${filter.columnName}`}
            defaultOptions={[
              {
                label: "Yes",
                value: 1,
              },
              {
                label: "No",
                value: 0,
              },
            ]}
            value={value || null}
            onChange={(selected) => updateValue(filter.parameterName, selected)}
          />
        );

      default:
        return null;
    }
  };

  /* =====================================================
     BUILD API FILTER PAYLOAD
     ===================================================== */

  const buildFilterPayload = useCallback(() => {
    const payload = [];

    filters.forEach((filter) => {
      const rawValue = filterValues[filter.parameterName];

      if (
        rawValue === undefined ||
        rawValue === null ||
        rawValue === "" ||
        (Array.isArray(rawValue) && rawValue.length === 0)
      ) {
        return;
      }

      let value = "";
      let value2 = null;
      let filterLabel = "";

      switch (filter.type) {
        /* -----------------------------------------
               SELECT / MULTISELECT
               ----------------------------------------- */

        case "select":
        case "multiselect": {
          if (Array.isArray(rawValue)) {
            value = rawValue
              .map((item) => item?.value ?? item?.id ?? item)
              .filter(
                (item) => item !== undefined && item !== null && item !== "",
              )
              .join(",");

            filterLabel = rawValue
              .map((item) => item?.label ?? item?.value ?? item?.id ?? item)
              .filter(Boolean)
              .join(",");
          }

          break;
        }

        /* -----------------------------------------
               CHECKBOX
               ----------------------------------------- */

        case "checkbox": {
          if (typeof rawValue === "object" && !Array.isArray(rawValue)) {
            value = rawValue?.value ?? rawValue?.id ?? "";

            filterLabel = rawValue?.label ?? rawValue?.id ?? "";
          }

          break;
        }

        /* -----------------------------------------
               DATE / DATETIME
               ----------------------------------------- */

        case "date":
        case "datetime": {
          if (typeof rawValue === "object") {
            value = rawValue.from || "";

            value2 = rawValue.to || null;
          }

          break;
        }

        /* -----------------------------------------
               DATE BETWEEN
               ----------------------------------------- */

        case "datebetween": {
          if (typeof rawValue === "object") {
            const [fromParameter, toParameter] = String(filter.parameterName)
              .split(",")
              .map((item) => item.trim());

            if (rawValue.from && fromParameter) {
              payload.push({
                parameterName: fromParameter,
                value: rawValue.from,
                value2: null,
                label: "",
              });
            }

            if (rawValue.to && toParameter) {
              payload.push({
                parameterName: toParameter,
                value: rawValue.to,
                value2: null,
                label: "",
              });
            }
          }

          return;
        }

        /* -----------------------------------------
               TEXT
               ----------------------------------------- */

        case "Text":
        case "text": {
          if (typeof rawValue === "string") {
            value = rawValue
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .join(",");
          }

          break;
        }

        /* -----------------------------------------
               DEFAULT
               ----------------------------------------- */

        default:
          value = rawValue;
      }

      if (value !== undefined && value !== null && value !== "") {
        payload.push({
          parameterName: filter.parameterName || filter.id,
          value,
          value2,
          label: filterLabel,
        });
      }
    });

    return payload;
  }, [filters, filterValues]);

  /* =====================================================
     APPLY FILTERS
     ===================================================== */

  const applyFilters = useCallback(() => {
    const formattedFilters = buildFilterPayload();

    setFilters((prev) => {
      const existingFilters = Array.isArray(prev?.filters) ? prev.filters : [];

      const managedParameters = new Set(
        filters.map((filter) => String(filter.parameterName)),
      );

      /*
       * Default filters are permanent filters such as:
       * workflowTypeId = 1
       */
      const defaultFilterMap = new Map(
        (defaultFilters?.filters || []).map((filter) => [
          String(filter.parameterName),
          filter,
        ]),
      );

      /*
       * Keep existing filters that are not managed
       * by this filter button.
       */
      const otherFilters = existingFilters.filter(
        (filter) =>
          !managedParameters.has(String(filter.parameterName)) &&
          !defaultFilterMap.has(String(filter.parameterName)),
      );

      /*
       * Build final filters:
       *
       * 1. Default filters
       * 2. User-selected filters
       *
       * Each parameterName can exist only once.
       */
      const finalFilterMap = new Map();

      // Add default filters first
      (defaultFilters?.filters || []).forEach((filter) => {
        finalFilterMap.set(String(filter.parameterName), filter);
      });

      // Add/replace with user-selected filters
      formattedFilters.forEach((filter) => {
        finalFilterMap.set(String(filter.parameterName), filter);
      });

      return {
        ...prev,
        filters: [...otherFilters, ...Array.from(finalFilterMap.values())],
        page: 1,
      };
    });

    opRef.current?.hide();
  }, [buildFilterPayload, setFilters, filters, defaultFilters]);
  /* =====================================================
     GET FILTER COUNT
     ===================================================== */

  const getFilterCount = useCallback(
    (filter) => {
      const value = filterValues[filter.parameterName];

      if (value === null || value === undefined || value === "") {
        return 0;
      }

      /*
       * Multi select
       */
      if (Array.isArray(value)) {
        return value.length;
      }

      /*
       * Text
       */
      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean).length;
      }

      /*
       * Date range
       */
      if (typeof value === "object") {
        if ("from" in value || "to" in value) {
          return (value.from ? 1 : 0) + (value.to ? 1 : 0);
        }

        /*
         * Checkbox / single select
         */
        return 1;
      }

      return 0;
    },
    [filterValues],
  );

  /* =====================================================
     CLEAR SELECTED FILTER
     ===================================================== */

  const clearSelectedFilter = useCallback(() => {
    if (!selectedFilter) {
      return;
    }

    const parameterName = selectedFilter.parameterName;

    setFilterValues((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[parameterName];

      return updated;
    });

    setFilters((prev) => ({
      ...prev,

      filters: (prev?.filters || []).filter(
        (item) => String(item?.parameterName) !== String(parameterName),
      ),

      page: 1,
    }));
  }, [selectedFilter, setFilters]);

  /* =====================================================
     CLEAR ALL
     ===================================================== */

  const clearAll = useCallback(() => {
    setFilterValues({});
    setSelectedFilter(null);

    setFilters((prev) => {
      const managedParameters = new Set(
        filters.map((filter) => String(filter.parameterName)),
      );

      return {
        ...prev,

        filters: (prev?.filters || []).filter(
          (item) => !managedParameters.has(String(item?.parameterName)),
        ),

        page: 1,
      };
    });
  }, [filters, setFilters]);

  /* =====================================================
     ACTIVE FILTER COUNT
     ===================================================== */

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filterValues).reduce((acc, [, value]) => {
      if (value === null || value === undefined || value === "") {
        return acc;
      }

      /*
       * Multi-select
       */
      if (Array.isArray(value)) {
        return acc + value.length;
      }

      /*
       * Text
       */
      if (typeof value === "string") {
        return (
          acc +
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean).length
        );
      }

      /*
       * Date range / object
       */
      if (typeof value === "object") {
        if ("from" in value || "to" in value) {
          return acc + (value.from ? 1 : 0) + (value.to ? 1 : 0);
        }

        /*
         * Checkbox / single object
         */
        return acc + 1;
      }

      return acc;
    }, 0);
  }, [filterValues]);

  /* =====================================================
     MENU CHANGE
     ===================================================== */

  useEffect(() => {
    setSelectedFilter(null);
  }, [activeMenuId]);

  /* =====================================================
     EXTERNAL CLEAR REF
     ===================================================== */

  useEffect(() => {
    if (!filterValuesRef) {
      return;
    }

    filterValuesRef.current = {
      clear: clearAll,
    };
  }, [filterValuesRef, clearAll]);

  /* =====================================================
     UI
     ===================================================== */

  return (
    <>
      <div className="relative flex flex-row-reverse items-center gap-0.5">
        <CustomButton
          label={label}
          iconPos="left"
          icon="pi pi-sliders-h"
          className={label ? "outlineBtn" : "iconBtn"}
          severity={activeFiltersCount > 0 ? "primary" : ""}
          aria-label="Filter"
          onClick={(e) => opRef.current?.toggle(e)}
        />

        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full pointer-events-none">
            {activeFiltersCount > 99 ? "99+" : activeFiltersCount}
          </span>
        )}
      </div>

      <OverlayPanel
        ref={opRef}
        className="shadow-lg! shadow-gray-300"
        style={{
          width: "35vw",
        }}
      >
        <div className="grid grid-cols-4 gap-4 p-2">
          {/* =================================================
              FILTER CHIPS
              ================================================= */}

          <div className="col-span-2 border-r h-[55vh] flex flex-col">
            <div className="flex-1 overflow-auto pr-1">
              <FilterChips
                filterValues={filterValues}
                filtersMeta={filters}
                setFilterValues={setFilterValues}
              />
            </div>

            <div className="shrink-0 flex justify-end items-end gap-2 pt-2 pr-2 border-t">
              <button
                type="button"
                className="px-3 py-1 text-xs border rounded"
                onClick={clearAll}
              >
                Clear All
              </button>

              <button
                type="button"
                disabled={
                  !selectedFilter ||
                  filterValues[selectedFilter?.parameterName] === undefined
                }
                className="px-3 py-1 text-xs border rounded disabled:opacity-40"
                onClick={clearSelectedFilter}
              >
                Clear
              </button>

              <button
                type="button"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:bg-gray-400"
                onClick={applyFilters}
                disabled={Object.keys(filterValues).length === 0}
              >
                Apply
              </button>
            </div>
          </div>

          {/* =================================================
              FILTER INPUT + FILTER LIST
              ================================================= */}

          <div className="col-span-2 h-[55vh] flex flex-col">
            <div className="shrink-0 max-h-80 overflow-auto bg-white! border-b">
              {selectedFilter ? (
                renderInput(selectedFilter)
              ) : (
                <p className="text-sm text-gray-500">
                  Select a filter to configure
                </p>
              )}
            </div>

            <div className="flex-1 overflow-auto pt-1">
              {isLoading ? (
                <p className="text-sm">Loading filters...</p>
              ) : (
                filters.map((filter) => {
                  const count = getFilterCount(filter);

                  const isSelected =
                    selectedFilter?.parameterName === filter.parameterName;

                  return (
                    <div
                      key={filter.parameterName}
                      onClick={() => setSelectedFilter(filter)}
                      className={`flex items-center justify-between p-1 mb-1 rounded cursor-pointer text-xs
                          ${
                            isSelected
                              ? "bg-blue-100 font-semibold"
                              : "hover:bg-gray-100"
                          }
                          ${
                            !isSelected && count > 0
                              ? "bg-blue-50 font-bold!"
                              : ""
                          }
                        `}
                    >
                      <span>{filter.columnName}</span>

                      {count > 0 && (
                        <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </OverlayPanel>
    </>
  );
};

export default FilterBtn;
