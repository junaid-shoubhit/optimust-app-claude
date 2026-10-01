import ColumnFilter from "../Filter/ColumnFilter";

const SortableColumnHeader = ({
  column,
  sortState,
  onSort,
  loading = false,
  filters,
  setFilters,
}) => {
  if (loading) {
    return (
      <div className="flex w-full items-start justify-start px-2">
        <span className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  const isSortable = column?.isSort === true;
  const isSorted = sortState === "asc" || sortState === "desc";
  const isFilterable = column?.isFilter === true;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSortable) return;

    onSort?.(column.parameterName);
  };

  const rawTitle = column?.columnName ?? column?.header ?? "";

  const titleContent =
    typeof rawTitle === "function" ? rawTitle(column) : rawTitle;

  const isStringContent = typeof titleContent === "string";

  return (
    <div className="flex w-full min-w-0 flex-col items-start justify-start self-start">
      <div className="w-full px-2 max-w-40!">
        {/* HEADER */}
        <div
          onClick={handleClick}
          className={[
            "p-sortable-column-header",
            "flex w-full min-w-0 items-start justify-start",
            "gap-1",
            "select-none",
            "rounded-md",
            "py-1",
            "min-h-[37px]",
            "transition-colors duration-150",

            isSortable ? "cursor-pointer hover:bg-gray-100" : "cursor-default",

            isSorted ? "bg-gray-100" : "",
          ].join(" ")}
        >
          <span
            className={[
              "p-column-title",
              "block",
              "min-w-0",
              "flex-1",
              "!text-left",

              isStringContent
                ? "break-words whitespace-normal leading-tight"
                : "",
            ].join(" ")}
            title={isStringContent ? titleContent : undefined}
          >
            {titleContent}
          </span>

          {isSortable && (
            <span
              className={[
                "pi shrink-0 text-xs!",
                sortState === "asc"
                  ? "pi-sort-amount-up"
                  : sortState === "desc"
                    ? "pi-sort-amount-down"
                    : "pi-sort-alt",

                isSorted ? "text-blue-600" : "text-gray-400",
              ].join(" ")}
            />
          )}
        </div>

        {/* FILTER */}
        {isFilterable && (
          <div className="mt-1 w-full">
            <ColumnFilter
              column={column}
              filters={filters}
              setFilters={setFilters}
              isLoading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableColumnHeader;
