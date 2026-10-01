import { useCallback, useMemo } from "react";

const SORT_ASC = "asc";
const SORT_DESC = "desc";

const useTableSorting = ({ filters, setFilters }) => {
  const sortCriteria = useMemo(() => {
    return Array.isArray(filters?.sortCriteria) ? filters.sortCriteria : [];
  }, [filters?.sortCriteria]);

  /**
   * Current active sort
   *
   * Backend:
   * [
   *   {
   *     parameterName: "name",
   *     value: "asc"
   *   }
   * ]
   */
  const activeSort = useMemo(() => {
    const firstSort = sortCriteria[0];

    if (!firstSort?.parameterName) {
      return {
        field: null,
        order: null,
      };
    }

    return {
      field: String(firstSort.parameterName),
      order:
        firstSort.value === SORT_ASC
          ? SORT_ASC
          : firstSort.value === SORT_DESC
            ? SORT_DESC
            : null,
    };
  }, [sortCriteria]);

  /**
   * Get next sorting state
   *
   * NONE -> ASC
   * ASC  -> DESC
   * DESC -> NONE
   */
  const getNextSort = useCallback(
    (parameterName) => {
      const field = String(parameterName);

      const current = sortCriteria.find(
        (item) => String(item?.parameterName) === field,
      );

      if (!current) {
        return SORT_ASC;
      }

      if (current.value === SORT_ASC) {
        return SORT_DESC;
      }

      return null;
    },
    [sortCriteria],
  );

  /**
   * Custom column click
   */
  const handleSort = useCallback(
    (parameterName) => {
      if (!parameterName) return;

      const field = String(parameterName);

      const nextOrder = getNextSort(field);

      setFilters?.((prev) => {
        let nextSortCriteria = [];

        if (nextOrder) {
          nextSortCriteria = [
            {
              parameterName: field,
              value: nextOrder,
            },
          ];
        }

        return {
          ...prev,
          page: 1,
          sortCriteria: nextSortCriteria,
        };
      });
    },
    [getNextSort, setFilters],
  );

  /**
   * Explicitly clear sorting
   */
  const clearSort = useCallback(() => {
    setFilters?.((prev) => ({
      ...prev,
      page: 1,
      sortCriteria: [],
    }));
  }, [setFilters]);

  /**
   * Get sorting state for a specific column
   */
  const getSortState = useCallback(
    (parameterName) => {
      const field = String(parameterName);

      const sort = sortCriteria.find(
        (item) => String(item?.parameterName) === field,
      );

      if (!sort) {
        return null;
      }

      return sort.value === SORT_ASC
        ? SORT_ASC
        : sort.value === SORT_DESC
          ? SORT_DESC
          : null;
    },
    [sortCriteria],
  );

  return {
    activeSort,
    sortCriteria,
    handleSort,
    clearSort,
    getSortState,
  };
};

export default useTableSorting;
