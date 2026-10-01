import { memo, useMemo, useCallback, useState, useEffect } from "react";
import classNames from "classnames";
import Notes from "../../pages/WorkFlow/Notes/Notes";
import { Paginator } from "primereact/paginator";
import TableHeader from "../Table/TableHeader";
import { Skeleton } from "primereact/skeleton";
import { CARD_REGISTRY } from "./CardRegistry";
import { FolderOpen } from "lucide-react";
import { quickFilters } from "./CardQuickFilters";
import WFTasks from "./cards/WFTasks.jsx/WFTasks";

const CardList = ({
  data = [],
  fieldsConfig = [],
  headerProps,
  loading,
  isFiltersLoading,
  filters,
  totalRecords = 0,
  pageLinkSize = 5,
  actions,
  isOpen,
  cardType,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [stableTotal, setStableTotal] = useState(0);
  /* ================= CARD COMPONENT ================= */
  const CardComponent = useMemo(() => {
    return CARD_REGISTRY[cardType] || CARD_REGISTRY.default;
  }, [cardType]);

  /* ================= PAGINATION ================= */

  // ✅ SAME LOGIC AS TABLE
  const first = useMemo(() => {
    const page = Number(filters?.page) || 1;
    const size = Number(filters?.pageSize) || 50;

    const calculated = (page - 1) * size;

    // 🔥 FIX: prevent overflow when total shrinks
    if (stableTotal && calculated >= stableTotal) {
      return 0;
    }

    return Math.max(calculated, 0);
  }, [filters?.page, filters?.pageSize, stableTotal]);

  const handlePageChange = useCallback(
    (e) => {
      const newPage = Math.floor(e.first / e.rows) + 1;

      headerProps?.setFilters({
        ...filters,
        page: newPage,
        pageSize: e.rows,
      });
    },
    [filters, headerProps?.setFilters],
  );

  const renderColumns = useMemo(() => {
    return fieldsConfig.reduce(
      (acc, { parameterName, columnName, width, frozen, isSort }) => {
        acc[parameterName] = {
          header: columnName,
          width,
          frozen,
          sortable: isSort,
          key: parameterName,
        };
        return acc;
      },
      {},
    );
  }, [fieldsConfig]);

  /* ================= SYNC TOTAL ================= */

  useEffect(() => {
    if (typeof totalRecords === "number") {
      setStableTotal(totalRecords);
    }
  }, [totalRecords]);

  /* ================= SKELETON ================= */

  // const quickFilters = [
  //   {
  //     label: "Assigned to Me",
  //     icon: "pi-user",
  //     filterName: "open",
  //   },
  //   {
  //     label: "Assigned to my Group",
  //     icon: "pi-users",
  //     filterName: "closed",
  //   },
  //   {
  //     label: "Assigned by Me",
  //     icon: "pi-user",
  //     filterName: "pending",
  //   },
  //   {
  //     label: "All Tasks",
  //     icon: "pi-clipboard",
  //     filterName: "pending",
  //   },
  // ];

  const skeletonCards = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2"
      >
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="1rem" width="80%" />
        <Skeleton height="1rem" width="40%" />
      </div>
    ));
  }, []);

  const handleQuickFilterChange = (filter) => {
    // setFilters({
    //   ...filters,
    //   page: 1,
    //   quickFilter: filter.filterName,
    // });
  };
  return (
    <div className="flex flex-col">
      {/* HEADER */}
      <div className="px-[17px] py-[20px]">
        <TableHeader
          {...headerProps}
          quickFilters={quickFilters?.[cardType] || []}
          onQuickFilterChange={handleQuickFilterChange}
          setSelectedRows={setSelectedRows}
          excelData={{ renderColumns, data }}
          loading={isFiltersLoading}
        />
      </div>
      <div className="flex ">
        <div className="min-w-0 flex flex-col gap-5  h-[calc(100vh-124px)] w-full">
          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto pr-1">
            {cardType === "wftasks" ? (
              <WFTasks data={data} loading={loading || isFiltersLoading} />
            ) : (
              <div
                className={classNames(
                  "grid gap-3 px-3",
                  isOpen
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3",
                )}
              >
                {loading || isFiltersLoading
                  ? skeletonCards
                  : data.map((row) => (
                      <CardComponent
                        key={row.id}
                        row={row}
                        fieldsConfig={fieldsConfig}
                        actions={actions}
                        setSelectedRows={setSelectedRows}
                      />
                    ))}
              </div>
            )}

            {/* EMPTY */}
            {!loading && data.length === 0 && (
              <div className="flex items-center justify-center py-16 px-4 min-w-0 w-full h-full">
                <div className="max-w-md w-full text-center">
                  <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 border">
                    <FolderOpen size={36} className="text-gray-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-800">
                    No Records Found
                  </h3>

                  {filters && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      No matching data available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PAGINATOR */}
          <div className="border-t-[0.5px] border-(--border-inverse) border bg-white">
            <Paginator
              first={first}
              rows={filters?.pageSize}
              totalRecords={Math.max(stableTotal || 0, 0)} // ✅ FIXED
              pageLinkSize={pageLinkSize}
              rowsPerPageOptions={[50, 100, 200]}
              onPageChange={handlePageChange}
              className="rounded-none"
            />
          </div>
        </div>
        {/* <div className="max-w-[350px] w-[350px] h-[calc(100vh-52px)]">
          <Notes />
        </div> */}
      </div>
    </div>
  );
};

export default memo(CardList);
