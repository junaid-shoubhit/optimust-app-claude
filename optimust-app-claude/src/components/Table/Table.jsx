import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import TableHeader from "./TableHeader";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Paginator } from "primereact/paginator";
import ActionsColumn from "./ActionsColumn";
import TableSkeleton from "./TableSkeleton";
import CellWrapper from "./CellWrapper";
import SortableColumnHeader from "./Sorting/SortableColumnHeader";
import { Skeleton } from "primereact/skeleton";
import { DatabaseZap } from "lucide-react";
import { formatColumnHeader } from "../../utils/constant";
import {
  formatDateCell,
  formatYesNo,
  isCaseLinkColumn,
} from "./cellFormat";
import { Link, useNavigate } from "react-router-dom";
import useTableSorting from "./Sorting/useTableSorting";

// --- Auto templates
// Text comes from ./cellFormat, which the Excel export also uses, so an
// exported sheet always matches what the table shows.
const templates = {
  boolean: (value) => (
    <span style={{ color: value ? "green" : "red" }}>{formatYesNo(value)}</span>
  ),
  date: (value, columnConfig) =>
    value ? <CellWrapper>{formatDateCell(value, columnConfig, "date")}</CellWrapper> : "-",
  datetime: (value, columnConfig) =>
    value ? (
      <CellWrapper>{formatDateCell(value, columnConfig, "datetime")}</CellWrapper>
    ) : (
      "-"
    ),
  checkbox: (value) => formatYesNo(Number(value)),
  caselink: (value) => {
    if (!value) return "-";

    const caseId = value.match(/\d+$/)?.[0];

    if (!caseId) return value;

    return (
      <Link
        to={`/cases/tabs-dynamic/pi/overview?id=${caseId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {value}
      </Link>
    );
  },
};

const Table = ({
  data = [],
  fieldsConfig = [],
  onRowValidation,
  headerProps,
  isFiltersLoading,
  isPagination = true,
  isActionsVisible = true,
  isSelectionMode = false,
  actions,
  selectedRows,
  setSelectedRows,
  scrollHeight,
  totalRecords = 0,
  pageLinkSize = 5,
  loading,
  isOpen,
  filters,
  ...props
}) => {
  const hasAnyAction =
    actions?.canView || actions?.canEdit || actions?.canDelete;

  const tableRef = useRef(null);
  const navigate = useNavigate();
  const stableTotal = totalRecords ?? 0;

  // ✅ Memo: column map (O(1) lookup)

  const tableData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  }, [data]);

  /* =====================================================
     ORDERED COLUMNS
     
     fieldsConfig controls ONLY UI column order.
     
     Values are always read using:
     
     rowData[column.parameterName]
======================================================= */

  const orderedColumns = useMemo(() => {
    return fieldsConfig
      .filter(
        (field) =>
          field &&
          field.parameterName !== null &&
          field.parameterName !== undefined,
      )
      .map((field, index) => ({
        ...field,

        index,

        field: String(field.parameterName),

        header: formatColumnHeader(field.columnName),
      }));
  }, [fieldsConfig]);

  /* =====================================================
     COLUMN MAP
======================================================= */

  const columnMap = useMemo(() => {
    return orderedColumns.reduce((map, column) => {
      map[column.field] = column;

      return map;
    }, {});
  }, [orderedColumns]);

  /* =====================================================
     RENDER COLUMNS
     
     Used by:
     - TableHeader
     - Excel export
     - TableSkeleton
======================================================= */

  const renderColumns = useMemo(() => {
    return orderedColumns.reduce((map, column) => {
      map[column.field] = {
        ...column,

        key: column.field,

        header: column.header,

        width: column.width,

        frozen: column.frozen,

        alignFrozen: column.alignFrozen,

        sortable: column.isSort === true,
      };

      return map;
    }, {});
  }, [orderedColumns]);

  /* =====================================================
     RENDER ACTIONS
======================================================= */

  const renderActionsBody = useCallback(
    (rowData) => {
      if (isFiltersLoading) {
        return (
          <div className="flex justify-center">
            <Skeleton width="40px" height="1.5rem" />
          </div>
        );
      }

      return (
        <ActionsColumn
          rowData={rowData}
          actions={actions}
          setSelectedRows={setSelectedRows}
        />
      );
    },
    [isFiltersLoading, actions, setSelectedRows],
  );
  /* =====================================================
     ROW DOUBLE CLICK
======================================================= */

  const handleRowDoubleClick = useCallback(
    (e) => {
      const rowData = e?.data;

      if (!rowData) return;

      if (actions?.canEdit && actions?.onEdit) {
        actions.onEdit(rowData);

        return;
      }

      if (actions?.canView) {
        setSelectedRows?.([rowData]);

        navigate(`overview?id=${rowData?.id}`);
      }
    },
    [actions, navigate, setSelectedRows],
  );

  /* =====================================================
     CELL VALUE
     
     NEVER depend on:
     - Object.keys()
     - Object.values()
     - Object.entries()
     - API property order
     
     Always use parameterName.
======================================================= */

  const getCellValue = useCallback((rowData, columnConfig) => {
    if (!rowData || !columnConfig) {
      return undefined;
    }

    const parameterName = columnConfig.parameterName;

    if (parameterName === null || parameterName === undefined) {
      return undefined;
    }

    return rowData[String(parameterName)];
  }, []);

  /* =====================================================
     CELL BODY
======================================================= */

  const renderCellBody = useCallback(
    (columnConfig) => (rowData, options) => {
      const value = getCellValue(rowData, columnConfig);

      let content;

      /* -----------------------------------------------
         CUSTOM TEMPLATE
      ------------------------------------------------ */

      if (isCaseLinkColumn(columnConfig)) {
        content = templates["caselink"](value);
      } else if (columnConfig?.customTemplate) {
        content = columnConfig.customTemplate(value, rowData);
      } else if (templates[columnConfig?.type]) {
        /* -----------------------------------------------
         AUTO TEMPLATE
      ------------------------------------------------ */
        content = templates[columnConfig.type](value, columnConfig);
      } else {
        /* -----------------------------------------------
         DEFAULT TEXT
      ------------------------------------------------ */
        content = value !== null && value !== undefined ? String(value) : "";
      }

      return (
        <CellWrapper
          field={String(columnConfig.parameterName)}
          rowIndex={options?.rowIndex}
        >
          {content}
        </CellWrapper>
      );
    },
    [getCellValue],
  );

  /* =====================================================
     CUSTOM BACKEND SORTING
     
     PrimeReact sorting is NOT used.
     
     We only use PrimeReact for table rendering.
======================================================= */

  const { handleSort, getSortState } = useTableSorting({
    filters,
    setFilters: headerProps?.setFilters,
  });

  /* =====================================================
     CUSTOM SORTABLE HEADER
======================================================= */

  const renderSortableHeader = useCallback(
    (columnConfig) => {
      if (!columnConfig) {
        return null;
      }

      return (
        <SortableColumnHeader
          column={columnConfig}
          sortState={getSortState(columnConfig.parameterName)}
          onSort={handleSort}
          loading={isFiltersLoading}
          filters={filters}
          setFilters={headerProps?.setFilters}
        />
      );
    },
    [
      getSortState,
      handleSort,
      isFiltersLoading,
      headerProps?.setFilters,
      filters,
    ],
  );

  /* =====================================================
     PAGINATION
======================================================= */

  const first = useMemo(() => {
    const page = Number(filters?.page) || 1;

    const size = Number(filters?.pageSize) || 50;

    const calculated = (page - 1) * size;

    if (stableTotal && calculated >= stableTotal) {
      return 0;
    }

    return Math.max(calculated, 0);
  }, [filters?.page, filters?.pageSize, stableTotal]);

  /* =====================================================
     PAGE CHANGE
======================================================= */

  const handlePageChange = useCallback(
    (e) => {
      const newPage = Math.floor(e.first / e.rows) + 1;

      const updatedFilters = {
        ...filters,

        page: newPage,

        pageSize: e.rows,
      };

      headerProps?.setFilters?.(updatedFilters);
    },
    [filters, headerProps?.setFilters],
  );

  /* =====================================================
     HEADER
     
     Only used for non-data/special headers.
     
     Data column headers use custom sorting.
======================================================= */

  // const renderHeader = useCallback(
  //   (columnConfig) => {
  //     if (isFiltersLoading) {
  //       return <Skeleton width="80px" height="1rem" />;
  //     }

  //     return columnConfig?.header || columnConfig?.key || "";
  //   },
  //   [isFiltersLoading],
  // );

  /* =====================================================
     SKELETON COLUMNS
======================================================= */

  const skeletonColumns = useMemo(() => {
    if (!isFiltersLoading) {
      return orderedColumns;
    }

    return Array.from({ length: 5 }, (_, index) => ({
      field: `skeleton_${index}`,

      parameterName: `skeleton_${index}`,

      index,

      header: "",

      isSkeleton: true,
    }));
  }, [isFiltersLoading, orderedColumns]);

  /* =====================================================
     RESET HORIZONTAL SCROLL
======================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const root = tableRef.current?.getElement?.();

    if (!root) return;

    const scrollBody =
      root.querySelector(".p-datatable-scrollable-body") ||
      root.querySelector(".p-datatable-wrapper");

    if (scrollBody) {
      requestAnimationFrame(() => {
        scrollBody.scrollLeft = 0;
      });
    }
  }, [isOpen, tableData?.length]);

  /* =====================================================
     RENDER
======================================================= */
  return (
    <>
      <DataTable
        key={headerProps?.activeMenuId}
        ref={tableRef}
        className={scrollHeight ? "nested-page-table" : "page-table"}
        scrollable
        scrollHeight={scrollHeight || "calc(100vh - 14rem)"}
        value={tableData}
        dataKey="id"
        stripedRows
        emptyMessage={
          loading ? (
            <div className={scrollHeight || "calc(100vh - 14rem)"}>
              <TableSkeleton columns={renderColumns} rows={22} />
            </div>
          ) : (
            <div
              className={`p-6 ${scrollHeight || "h-[calc(100vh-14rem)]"} ml-8`}
            >
              <div className="inline-flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <DatabaseZap size={18} className="text-gray-500" />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    No Data Found
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    No records are available to display at the moment.
                  </p>
                </div>
              </div>
            </div>
          )
        }
        size="small"
        header={
          <TableHeader
            {...headerProps}
            setSelectedRows={setSelectedRows}
            loading={isFiltersLoading}
            excelData={{
              columns: orderedColumns,
              renderColumns,
              data: tableData,
            }}
            filters={filters}
          />
        }
        selection={selectedRows}
        selectionMode={isSelectionMode ? "checkbox" : null}
        onSelectionChange={(e) => {
          const newSelection = e.value || [];

          const previous = selectedRows || [];

          const selected = newSelection.find(
            (row) => !previous.some((prev) => prev.id === row.id),
          );

          const unselected = previous.find(
            (row) => !newSelection.some((item) => item.id === row.id),
          );

          if (selected) {
            onRowValidation?.({
              type: "select",

              row: selected,

              selectedRows: newSelection,
            });
          }

          if (unselected) {
            onRowValidation?.({
              type: "unselect",

              row: unselected,

              selectedRows: newSelection,
            });
          }

          setSelectedRows?.(newSelection);
        }}
        {...props}
        onRowDoubleClick={handleRowDoubleClick}
      >
        {/* =================================================
            SELECTION COLUMN
        ================================================= */}

        {isSelectionMode && (
          <Column
            selectionMode="multiple"
            headerStyle={{
              width: "3rem",
            }}
          />
        )}

        {/* =================================================
            DATA COLUMNS

            IMPORTANT:
            
            There is NO:
            
            sortable
            sortField
            sortOrder
            onSort
            removableSort
            
            PrimeReact does not control sorting.
        ================================================= */}

        {skeletonColumns.map((columnConfig, index) => {
          const field = String(
            columnConfig?.parameterName ?? columnConfig?.field ?? "",
          );

          const isSkeleton = isFiltersLoading && field.startsWith("skeleton_");

          /*
           * Get the exact configuration
           * using parameterName.
           */
          const actualColumnConfig = isSkeleton
            ? columnConfig
            : columnMap[field];

          return (
            <Column
              key={`${field}-${index}`}
              field={field}
              frozen={actualColumnConfig?.frozen}
              alignFrozen={actualColumnConfig?.alignFrozen || "right"}
              header={
                isSkeleton ? (
                  <Skeleton width="80px" height="1rem" />
                ) : (
                  renderSortableHeader(actualColumnConfig)
                )
              }
              style={{
                maxWidth: isSkeleton
                  ? "180px"
                  : actualColumnConfig?.width || "180px",

                minWidth: isSkeleton
                  ? "140px"
                  : actualColumnConfig?.width || "140px",
              }}
              body={
                isSkeleton
                  ? () => <Skeleton width="100%" height="1rem" />
                  : renderCellBody(actualColumnConfig)
              }
            />
          );
        })}

        {/* =================================================
            ACTIONS
        ================================================= */}

        {isActionsVisible && hasAnyAction && (
          <Column
            header={
              isFiltersLoading ? (
                <Skeleton width="60px" height="1rem" />
              ) : (
                "Actions"
              )
            }
            body={renderActionsBody}
            style={{
              textAlign: "center",
            }}
            frozen
            alignFrozen="right"
          />
        )}
      </DataTable>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {isPagination && (
        <Paginator
          first={first}
          rows={filters?.pageSize}
          totalRecords={Math.max(stableTotal || 0, 0)}
          pageLinkSize={pageLinkSize}
          leftContent
          className="border-t! rounded-none! border-(--border-inverse)!"
          rowsPerPageOptions={[50, 100, 200]}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default memo(Table);
