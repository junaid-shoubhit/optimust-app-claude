import { memo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import CustomButton from "../Forms/Buttons/CustomButton";
import FilterBtn from "./Filter/FilterBtn";
import ExcelBtn from "./Excel/ExcelBtn";
import Select from "../Forms/Select/Select";
import DropdownFilter from "./DropdownFilter";
import QuickFilter from "./QuickFilter";

const TableHeader = memo(function TableHeader({
  headerName = "Table Name",
  addData,
  extraBtn,
  setSelectedRows,
  setFilters,
  defaultFilters,
  actionsConfig,
  filtersData,
  filters,
  isLoading,
  // filterName,
  activeMenuId,
  loading,
  excelData,
  exportConfig,
  designType,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const filterValuesRef = useRef();
  // const { formManager } = useParams();

  const goParent = useCallback(() => {
    const segments = location.pathname.split("/");
    segments.pop();
    navigate(segments.join("/"));
    setSelectedRows?.([]);
  }, [location.pathname, navigate, setSelectedRows]);

  const handleAdd = useCallback(() => {
    addData ? addData() : navigate("add");
  }, [addData, navigate]);

  const handleFilterValuesRef = () => {
    filterValuesRef.current?.clear();
  };

  return (
    <div className="flex flex-wrap justify-between items-center">
      {/* ✅ Header */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          {loading ? (
            <Skeleton width="100px" height="20px" />
          ) : (
            <p className="text-sm font-bold uppercase text-(--color-fontFour)">
              {headerName}
            </p>
          )}
        </div>

        {activeMenuId === 5268 && (
          <div className="flex gap-2 items-center min-h-5 max-h-5 mt-2">
            <DropdownFilter
              filters={filters}
              setFilters={setFilters}
              handleFilterValuesRef={handleFilterValuesRef}
            />
          </div>
        )}

        <QuickFilter
          filtersData={filtersData}
          filters={filters}
          setFilters={setFilters}
        />
      </div>

      {/* ✅ Actions */}
      <div className="flex gap-2 items-center">
        {loading ? (
          <div className="flex gap-2 h-8.25">
            <Skeleton shape="circle" size="1.25rem" />
            <Skeleton shape="circle" size="1.25rem" />
            <Skeleton shape="circle" size="1.25rem" />
          </div>
        ) : (
          <>
            {extraBtn}

            {actionsConfig?.filter && (
              <FilterBtn
                label={actionsConfig?.back ? "" : "Filter"}
                filtersData={filtersData}
                setFilters={setFilters}
                filters={filters}
                defaultFilters={defaultFilters}
                // filterName={filterName}
                isLoading={isLoading}
                activeMenuId={activeMenuId}
                filterValuesRef={filterValuesRef}
              />
            )}

            {actionsConfig?.export && (
              <ExcelBtn
                label={actionsConfig?.back ? "" : "Export ⏷"}
                excelData={excelData}
                excelName={headerName}
                exportConfig={{ ...exportConfig, headerName }}
              />
            )}

            {actionsConfig?.massUpdate ? (
              <CustomButton
                iconPos="left"
                icon="pi pi-pencil"
                label={actionsConfig?.back ? "" : `Mass Update`}
                className={
                  actionsConfig?.massUpdate ? "saveBtn" : "iconSaveBtn"
                }
                onClick={handleAdd}
              />
            ) : (
              actionsConfig?.add && (
                <CustomButton
                  iconPos="left"
                  label={actionsConfig?.back ? "" : "New"}
                  icon="pi pi-plus"
                  className={!actionsConfig?.back ? "saveBtn" : "iconSaveBtn"}
                  aria-label="Add"
                  onClick={handleAdd}
                />
              )
            )}

            {actionsConfig?.back && (
              <CustomButton
                text
                icon="pi pi-arrow-right"
                className="p-0! w-fit! text-(--background-secondary)!"
                aria-label="Back"
                onClick={goParent}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default TableHeader;
