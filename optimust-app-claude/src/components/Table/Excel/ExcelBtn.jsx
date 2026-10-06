import React, { useRef, useMemo, useCallback } from "react";

import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";

import CustomButton from "../../Forms/Buttons/CustomButton";

import { useExportDynamicPageQuery } from "../../../pages/DynamicContent/DynamicPage/useDynamicPageQuery";
import { downloadExcel, resolveExportColumns } from "./exportExcel";

const ExcelBtn = React.memo(function ExcelBtn({
  excelData,
  exportConfig,
  label,
}) {
  const op = useRef(null);

  const {
    activeMenu,
    appliedFilters,
    config,
    headerName = "export",
  } = exportConfig || {};

  /* ================= EXPORT QUERY ================= */
  const { mutate: exportAllResults, isPending } = useExportDynamicPageQuery({
    config,
    activeMenu,
    appliedFilters,
  });

  /* ================= CURRENT PAGE ================= */
  const exportCurrentPage = useCallback(() => {
    downloadExcel({
      columns: resolveExportColumns(excelData),
      rows: excelData?.data,
      fileName: headerName,
    });

    op.current?.hide();
  }, [excelData, headerName]);

  /* ================= ALL RESULTS ================= */
  const handleExportAll = useCallback(() => {
    exportAllResults(undefined, {
      onSuccess: (response) => {
        const rows = config?.transformResponse
          ? config.transformResponse(response)
          : response?.data || [];

        // Same columns as the table on screen, so both exports match it.
        downloadExcel({
          columns: resolveExportColumns(excelData, response?.renderColumns),
          rows,
          fileName: headerName,
        });

        op.current?.hide();
      },

      onError: (error) => {
        console.error("Excel export failed:", error);
      },
    });
  }, [exportAllResults, config, excelData, headerName]);

  /* ================= OPTIONS ================= */
  const options = useMemo(
    () => [
      {
        key: "current",
        label: "Current Page",
        description: "Export visible rows only",
        icon: "pi pi-table",
        iconBg: "bg-green-100",
        iconColor: "text-green-700",
        onClick: exportCurrentPage,
      },
      {
        key: "all",
        label: "All Results",
        description: "Export complete dataset",
        icon: "pi pi-database",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-700",
        onClick: handleExportAll,
      },
    ],
    [exportCurrentPage, handleExportAll],
  );

  return (
    <>
      {/* ================= BUTTON ================= */}
      <CustomButton
        label={label}
        iconPos="left"
        icon="pi pi-download"
        className={!label ? "iconBtn" : "outlineBtn"}
        aria-label="Export Excel"
        onClick={(e) => op.current?.toggle(e)}
      />

      {/* ================= OVERLAY ================= */}
      <OverlayPanel
        ref={op}
        dismissable
        showCloseIcon={false}
        className="p-0 border-none shadow-5 border-round-2xl overflow-hidden"
        pt={{
          content: {
            className: "p-0",
          },
        }}
      >
        <div className="w-20rem surface-card">
          {/* ================= HEADER ================= */}
          <div className="flex align-items-center gap-2 px-3 py-3 bg-green-50 border-bottom-1 surface-border">
            <div className="w-2rem h-2rem border-circle flex align-items-center justify-content-center">
              <i className="pi pi-file-excel text-green-700 text-sm" />
            </div>

            <div>
              <p className="m-0 text-sm font-semibold text-900">Export Excel</p>

              <small className="text-600 text-xs">Choose export type</small>
            </div>
          </div>

          {/* ================= OPTIONS ================= */}
          <div className="p-2">
            {options.map((item, index) => (
              <React.Fragment key={item.key}>
                <button
                  type="button"
                  onClick={item.onClick}
                  disabled={isPending}
                  className="w-full flex align-items-center gap-3 p-2 border-none bg-transparent border-round-xl hover:surface-100 transition-duration-150 cursor-pointer disabled:opacity-60"
                >
                  {/* Icon */}
                  <div
                    className={`w-3rem h-3rem border-circle flex align-items-center justify-content-center ${item.iconBg}`}
                  >
                    <i className={`${item.icon} ${item.iconColor} text-base`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <p className="m-0 text-sm font-semibold text-900">
                      {item.label}
                    </p>

                    <small className="text-600 text-xs block">
                      {item.description}
                    </small>
                  </div>

                  {/* Right Icon */}
                  {isPending && item.key === "all" ? (
                    <i className="pi pi-spin pi-spinner text-500 text-sm" />
                  ) : (
                    <i className="pi pi-angle-right text-500 text-xs" />
                  )}
                </button>

                {index !== options.length - 1 && (
                  <Divider className="mx-0! my-2! p-0!" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </OverlayPanel>
    </>
  );
});

export default ExcelBtn;
