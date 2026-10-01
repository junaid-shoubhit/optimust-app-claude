import { memo, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import CustomButton from "../Forms/Buttons/CustomButton";

import { getDynamicOptions } from "../../services/apiBinding";

const QuickFilterItem = memo(function QuickFilterItem({
  filter,
  filters,
  setFilters,
}) {
  const payload = useMemo(
    () => ({
      dataTable: filter?.dataTable,
      dataField: filter?.dataField,
      searchTerm: "",
      page: 1,
      pageSize: 500,
    }),
    [filter?.dataTable, filter?.dataField],
  );

  const optionsQuery = useQuery({
    queryKey: [
      "quickFilterOptions",
      filter?.parameterName,
      filter?.dataTable,
      filter?.dataField,
    ],
    queryFn: async () => {
      const response = await getDynamicOptions(payload);

      return response?.options || response?.optionModelDT || [];
    },
    enabled: !!filter?.parameterName && !!filter?.dataTable,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const options = optionsQuery.data || [];

  const selectedFilter = useMemo(
    () =>
      filters?.filters?.find(
        (item) => item?.parameterName === filter?.parameterName,
      ),
    [filters?.filters, filter?.parameterName],
  );

  const isSelected = useMemo(
    () => (value) =>
      String(selectedFilter?.value) === String(value),
    [selectedFilter],
  );

  const handleOptionClick = (option) => {
    setFilters((prev = {}) => {
      const existingFilters = prev?.filters || [];

      const parameterName = filter?.parameterName;

      const alreadySelected =
        selectedFilter &&
        String(selectedFilter?.value) === String(option?.value);

      const remainingFilters = existingFilters.filter(
        (item) => item?.parameterName !== parameterName,
      );

      // Unselect the currently selected option
      if (alreadySelected) {
        return {
          ...prev,
          page: 1,
          pageSize: prev?.pageSize || 50,
          filters: remainingFilters,
        };
      }

      // Select the new option
      return {
        ...prev,
        page: 1,
        pageSize: prev?.pageSize || 50,
        filters: [
          ...remainingFilters,
          {
            parameterName,
            value: option?.value ?? null,
            value2: null,
            label: option?.label || "",
          },
        ],
      };
    });
  };

  if (optionsQuery.isLoading) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-xs text-gray-400">
          Loading...
        </span>
      </div>
    );
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-2 items-center">
        {options?.map((option) => {
          const selected = isSelected(option?.value);

          return (
            <CustomButton
                key={option?.value}
                label={
                    <span className="flex items-center gap-1">
                    <span>{`${option?.label}s`}</span>

                    {selected && (
                        <span
                        className="quickFilterClose"
                        aria-hidden="true"
                        >
                        ×
                        </span>
                    )}
                    </span>
                }
                className={
                    selected
                    ? "quickFilterBtn quickFilterBtnActive"
                    : "quickFilterBtn"
                }
                aria-label={option?.label}
                onClick={() => handleOptionClick(option)}
            />
          );
        })}
      </div>
    </div>
  );
});

const QuickFilter = memo(function QuickFilter({
  filtersData,
  filters,
  setFilters,
}) {
  const quickFilters = useMemo(
    () =>
      filtersData?.filter(
        (filter) => filter?.isQuickFilter === true,
      ) || [],
    [filtersData],
  );

  if (quickFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      {quickFilters.map((filter) => (
        <QuickFilterItem
          key={filter?.parameterName}
          filter={filter}
          filters={filters}
          setFilters={setFilters}
        />
      ))}
    </div>
  );
});

export default QuickFilter;