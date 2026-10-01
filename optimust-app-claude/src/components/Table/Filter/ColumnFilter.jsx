import { memo, useEffect, useState } from "react";
import Input from "../../Forms/Input/Input";
import SelectField from "../../Forms/Select/Select";
import CustomDate from "../../Forms/Date/Date";

const ColumnFilter = memo(function ColumnFilter({
  column,
  filters,
  setFilters,
  isLoading = false,
}) {
  const filterable = column?.isFilter === true;

  const parameterName = String(column?.parameterName);

  const currentFilter = filters?.filters?.find(
    (item) => String(item?.parameterName) === parameterName,
  );

  const currentValue = currentFilter?.value ?? "";

  /* =====================================================
     LOCAL TEXT VALUE
     ===================================================== */

  const [inputValue, setInputValue] = useState(currentValue);

  /* =====================================================
     LOCAL SELECTED VALUE
     ===================================================== */

  const [selectedValue, setSelectedValue] = useState(null);

  /* =====================================================
     UPDATE ACTUAL TABLE FILTER
     ===================================================== */

  const updateFilter = (newValue, newValue2 = null, label = "") => {
    setFilters?.((prev) => {
      const currentFilters = Array.isArray(prev?.filters) ? prev.filters : [];

      /*
       * Remove existing filter for this parameter.
       */
      const filtered = currentFilters.filter(
        (item) => String(item?.parameterName) !== parameterName,
      );

      /*
       * Empty = remove filter.
       */
      if (
        newValue === null ||
        newValue === undefined ||
        newValue === "" ||
        (Array.isArray(newValue) && newValue.length === 0)
      ) {
        return {
          ...prev,
          filters: filtered,
          page: 1,
        };
      }

      return {
        ...prev,
        filters: [
          ...filtered,
          {
            parameterName: column.parameterName,
            value: newValue,
            value2: newValue2,
            label,
          },
        ],
        page: 1,
      };
    });
  };

  /* =====================================================
     SYNC FROM PARENT FILTERS
     ===================================================== */

  useEffect(() => {
    setInputValue(currentValue);

    /*
     * No filter exists.
     */
    if (!currentFilter) {
      if (column.type === "select" || column.type === "multiselect") {
        setSelectedValue([]);
      } else {
        setSelectedValue(null);
      }

      return;
    }

    /* ---------------------------------------------
       SELECT / MULTISELECT
       --------------------------------------------- */

    if (column.type === "select" || column.type === "multiselect") {
      const values = String(currentFilter.value ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const labels = String(currentFilter.label ?? "")
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean);

      const options = values.map((value, index) => ({
        value,
        label: labels[index] ?? value,
      }));

      setSelectedValue(options);

      return;
    }

    /* ---------------------------------------------
       CHECKBOX
       --------------------------------------------- */

    if (column.type === "checkbox") {
      setSelectedValue({
        value: currentFilter.value,
        value2: currentFilter.value2,
        label: currentFilter.label ?? currentFilter.value,
      });

      return;
    }

    /* ---------------------------------------------
       DATE / DATETIME
       --------------------------------------------- */

    if (column.type === "date" || column.type === "datetime") {
      setSelectedValue(currentFilter.value || null);

      return;
    }

    /* ---------------------------------------------
       OTHER
       --------------------------------------------- */

    setSelectedValue(currentFilter.value ?? null);
  }, [currentValue, currentFilter, column.type]);

  /* =====================================================
     NON FILTERABLE / LOADING
     ===================================================== */

  if (!filterable || isLoading) {
    return null;
  }

  /* =====================================================
     APPLY SELECT / MULTISELECT FILTER
     ===================================================== */

  const applySelectFilter = () => {
    if (!Array.isArray(selectedValue) || selectedValue.length === 0) {
      updateFilter("");

      return;
    }

    /*
     * Convert selected values:
     *
     * 1,2,3
     */
    const values = selectedValue
      .map((item) => item?.value ?? item?.id ?? item)
      .filter((item) => item !== undefined && item !== null && item !== "")
      .join(",");

    /*
     * Convert selected labels:
     *
     * Open,Closed,Pending
     */
    const labels = selectedValue
      .map((item) => item?.label ?? item?.value ?? item?.id ?? item)
      .filter(Boolean)
      .join(",");

    if (!values) {
      updateFilter("");

      return;
    }

    /*
     * ACTUAL TABLE FILTER IS UPDATED
     * ONLY HERE.
     */
    updateFilter(values, null, labels);
  };

  /* =====================================================
     ENTER
     ===================================================== */

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") {
      return;
    }

    /* ---------------------------------------------
       SELECT / MULTISELECT
       --------------------------------------------- */

    if (column.type === "select" || column.type === "multiselect") {
      /*
       * IMPORTANT:
       *
       * We need to prevent the event from
       * bubbling to the table/header.
       *
       * But react-select should still be able
       * to handle normal keyboard behavior.
       */
      e.preventDefault();
      e.stopPropagation();

      applySelectFilter();

      return;
    }

    /* ---------------------------------------------
       DATE / DATETIME
       --------------------------------------------- */

    if (column.type === "date" || column.type === "datetime") {
      e.preventDefault();
      e.stopPropagation();

      /*
       * Date is already applied on change.
       */
      return;
    }

    /* ---------------------------------------------
       CHECKBOX
       --------------------------------------------- */

    if (column.type === "checkbox") {
      e.preventDefault();
      e.stopPropagation();

      if (!selectedValue) {
        updateFilter("");

        return;
      }

      updateFilter(
        selectedValue.value,
        selectedValue.value2 ?? null,
        selectedValue.label ?? "",
      );

      return;
    }

    /* ---------------------------------------------
       TEXT / NUMBER / TEXTAREA
       --------------------------------------------- */

    if (
      column.type === "text" ||
      column.type === "Text" ||
      column.type === "number" ||
      column.type === "TextArea"
    ) {
      e.preventDefault();
      e.stopPropagation();

      if (!inputValue?.trim()) {
        updateFilter("");

        return;
      }

      updateFilter(inputValue);

      return;
    }
  };

  /* =====================================================
     CLEAR
     ===================================================== */

  const handleClear = () => {
    /*
     * Clear local text.
     */
    setInputValue("");

    /*
     * Clear local selected value.
     */
    if (column.type === "select" || column.type === "multiselect") {
      setSelectedValue([]);
    } else {
      setSelectedValue(null);
    }

    /*
     * Clear actual filter immediately.
     *
     * If you want STRICT ENTER-ONLY
     * clearing as well, remove this call.
     */
    updateFilter("");
  };

  /* =====================================================
     SELECT CHANGE
     ===================================================== */

  const handleSelectChange = (selected) => {
    /* ---------------------------------------------
       SELECT / MULTISELECT
       --------------------------------------------- */

    if (column.type === "select" || column.type === "multiselect") {
      const nextValue = Array.isArray(selected)
        ? selected
        : selected
          ? [selected]
          : [];

      /*
       * ONLY update local state.
       *
       * DO NOT call updateFilter().
       *
       * Actual filter is applied
       * when ENTER is pressed.
       */
      setSelectedValue(nextValue);
      if (nextValue.length === 0) {
        updateFilter("");
      }

      return;
    }

    /* ---------------------------------------------
       CHECKBOX
       --------------------------------------------- */

    setSelectedValue(selected);

    /*
     * Do NOT update actual filter here.
     *
     * ENTER will apply it.
     */
  };

  /* =====================================================
     DATE FORMAT
     ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* =====================================================
     PARSE LOCAL DATE
     ===================================================== */

  const parseLocalDate = (dateString) => {
    if (!dateString) {
      return null;
    }

    if (dateString instanceof Date) {
      return dateString;
    }

    const [year, month, day] = String(dateString).split("-").map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  };

  /* =====================================================
     DATE CHANGE
     ===================================================== */

  const handleDateChange = (e) => {
    const date = e?.value;

    /*
     * Date cleared.
     */
    if (!date) {
      setSelectedValue(null);

      updateFilter("");

      return;
    }

    /*
     * YYYY-MM-DD
     */
    const formattedDate = formatDate(date);

    setSelectedValue(formattedDate);

    /*
     * Date remains immediately
     * applied as before.
     */
    updateFilter(formattedDate);
  };

  /* =====================================================
     TEXT / NUMBER FILTER
     ===================================================== */

  const renderTextFilter = () => {
    return (
      <div className="relative">
        <Input
          type={column.type === "number" ? "number" : "text"}
          value={inputValue}
          placeholder="Search..."
          className="w-full pr-7"
          featureName="filter-input"
          onChange={(e) => {
            const value = e.target.value;

            setInputValue(value);

            /*
             * Empty text clears
             * immediately.
             */
            if (value.trim() === "") {
              updateFilter("");
            }
          }}
          onKeyDown={handleKeyDown}
          noErrorMessage
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  /* =====================================================
     SELECT
     ===================================================== */

  const renderSelectFilter = () => {
    return (
      <div className="w-full">
        <SelectField
          placeholder="All Values"
          payload={{
            dataTable: column.dataTable,
            dataField: column.dataField,
          }}
          isMulti
          value={selectedValue || []}
          onChange={handleSelectChange}
          onKeyDown={handleKeyDown}
          noErrorMessage
          selecthHeight="10px"
          dropdownWidth="300px"
          selecthMaxHeight="80px"
          optionFontSize={"11px"}
          // autoFocus
        />
      </div>
    );
  };

  /* =====================================================
     MULTISELECT
     ===================================================== */

  const renderMultiSelectFilter = () => {
    return (
      <div className="w-full">
        <SelectField
          placeholder="All Values"
          payload={{
            dataTable: column.dataTable,
            dataField: column.dataField,
          }}
          isMulti
          value={selectedValue || []}
          onChange={handleSelectChange}
          onKeyDown={handleKeyDown}
          noErrorMessage
          selecthHeight="10px"
          dropdownWidth="300px"
          selecthMaxHeight="80px"
          optionFontSize={"11px"}
          // autoFocus
        />
      </div>
    );
  };

  /* =====================================================
     CHECKBOX
     ===================================================== */

  const renderCheckboxFilter = () => {
    return (
      <div className="w-full max-w-30!">
        <SelectField
          placeholder="All Values"
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
          value={selectedValue}
          onChange={handleSelectChange}
          onKeyDown={handleKeyDown}
          noErrorMessage
          dropdownWidth="300px"
          selectWidth="10px"
          // autoFocus
          selecthMaxHeight="80px"
          optionFontSize={"11px"}
        />
      </div>
    );
  };

  /* =====================================================
     DATE / DATETIME
     ===================================================== */

  const renderDateFilter = () => {
    return (
      <div className="relative w-full">
        <CustomDate
          className="w-full"
          featureName="filter-input"
          value={parseLocalDate(selectedValue)}
          onChange={handleDateChange}
          onKeyDown={handleKeyDown}
          noErrorMessage
        />

        {selectedValue && (
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-400 px-1 absolute right-1.5 top-1/2 z-10 -translate-y-1/2 text-xs text-white hover:text-red-500"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  /* =====================================================
     TEXTAREA
     ===================================================== */

  const renderTextAreaFilter = () => {
    return (
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          placeholder="Search..."
          className="w-full pr-7"
          featureName="filter-input"
          onChange={(e) => {
            const value = e.target.value;

            setInputValue(value);

            if (value.trim() === "") {
              updateFilter("");
            }
          }}
          onKeyDown={handleKeyDown}
          noErrorMessage
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  /* =====================================================
     RENDER FILTER
     ===================================================== */

  const renderFilter = () => {
    switch (column.type) {
      case "text":
      case "Text":
      case "number":
        return renderTextFilter();

      case "TextArea":
        return renderTextAreaFilter();

      case "select":
        return renderSelectFilter();

      case "multiselect":
        return renderMultiSelectFilter();

      case "checkbox":
        return renderCheckboxFilter();

      case "date":
      case "datetime":
        return renderDateFilter();

      default:
        return null;
    }
  };

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div
      className="mt-1 w-full"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        /*
         * Prevent table/header from
         * stealing focus.
         */
        e.stopPropagation();
      }}
    >
      {renderFilter()}
    </div>
  );
});

export default ColumnFilter;
