// import React, { useRef } from "react";

// import { OverlayPanel } from "primereact/overlaypanel";
// import { Divider } from "primereact/divider";

// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// import CustomButton from "../../Forms/Buttons/CustomButton";
// import { useExportDynamicPageQuery } from "../../../pages/DynamicContent/DynamicPage/useDynamicPageQuery";

// const ExcelBtn = ({ excelData, exportConfig }) => {
//   const { activeMenu, appliedFilters, config, headerName } = exportConfig || {};
//   console.log("config", config);
//   const op = useRef(null);

//   /* ================= EXPORT QUERY ================= */
//   const { mutate: exportAllResults, isPending } = useExportDynamicPageQuery({
//     config,
//     activeMenu,
//     appliedFilters,
//   });

//   /* ================= FORMAT DATA ================= */
//   const formatExcelData = (response) => {
//     if (!response?.data?.length) return [];

//     return response.data.map((row) => {
//       const formattedRow = {};

//       Object.entries(response.renderColumns || {}).forEach(([key, column]) => {
//         formattedRow[column.header] = row[key] ?? "";
//       });

//       return formattedRow;
//     });
//   };

//   /* ================= DOWNLOAD EXCEL ================= */
//   const downloadExcel = ({ data, renderColumns, fileName = "export" }) => {
//     const formattedData = formatExcelData({
//       data,
//       renderColumns,
//     });

//     const worksheet = XLSX.utils.json_to_sheet(formattedData);

//     worksheet["!cols"] = Object.values(renderColumns || {}).map((column) => ({
//       wch: Math.max(column.header.length + 5, 20),
//     }));

//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });

//     const blob = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
//     });

//     saveAs(blob, `${fileName}.xlsx`);
//   };

//   /* ================= CURRENT PAGE ================= */
//   const exportCurrentPage = () => {
//     downloadExcel({
//       data: excelData?.data || [],

//       renderColumns: excelData?.renderColumns || {},

//       fileName: headerName || "current-page",
//     });

//     op.current.hide();
//   };

//   /* ================= ALL RESULTS ================= */
//   const handleExportAll = () => {
//     exportAllResults(undefined, {
//       onSuccess: (response) => {
//         downloadExcel({
//           data: config?.transformResponse
//             ? config.transformResponse(response)
//             : response?.data || [],
//           renderColumns:
//             response?.renderColumns || excelData?.renderColumns || {},

//           fileName: headerName || "all-results",
//         });

//         op.current.hide();
//       },

//       onError: (error) => {
//         console.error("Excel export failed", error);
//       },
//     });
//   };

//   /* ================= OPTIONS ================= */
//   const options = [
//     {
//       key: "current",

//       label: "Current Page",

//       description: "Export only visible rows",

//       icon: "pi pi-table",

//       iconBg: "bg-green-100",

//       iconColor: "text-green-700",

//       onClick: exportCurrentPage,
//     },

//     {
//       key: "all",

//       label: "All Results",

//       description: "Export complete dataset",

//       icon: "pi pi-database",

//       iconBg: "bg-blue-100",

//       iconColor: "text-blue-700",

//       onClick: handleExportAll,
//     },
//   ];

//   return (
//     <>
//       {/* ================= BUTTON ================= */}
//       <CustomButton
//         text
//         severity="success"
//         icon="pi pi-file-excel"
//         className="p-0! w-fit!"
//         aria-label="Export to Excel"
//         onClick={(e) => op.current.toggle(e)}
//       />

//       {/* ================= OVERLAY ================= */}
//       <OverlayPanel
//         ref={op}
//         dismissable
//         showCloseIcon={false}
//         className="p-0 border-none border-round-2xl overflow-hidden shadow-5"
//         pt={{
//           content: {
//             className: "p-0",
//           },
//         }}
//       >
//         <div className="w-20rem surface-card">
//           {/* ================= HEADER ================= */}
//           <div className="flex align-items-center justify-content-between px-2 py-2 bg-green-50 border-bottom-1 surface-border">
//             <div className="flex align-items-center gap-2">
//               <div className="w-2rem h-2rem border-circle flex align-items-center justify-content-center">
//                 <i className="pi pi-file-excel text-green-700 text-sm" />
//               </div>

//               <div className="flex flex-column">
//                 <p className="m-0 text-xs font-semibold pr-1 text-900">
//                   Export Excel
//                 </p>

//                 <small className="text-600 text-xs">(Choose Type)</small>
//               </div>
//             </div>
//           </div>

//           {/* ================= OPTIONS ================= */}
//           <div className="p-2">
//             {options.map((item, index) => (
//               <React.Fragment key={item.label}>
//                 <button
//                   type="button"
//                   onClick={item.onClick}
//                   disabled={isPending}
//                   className="w-full flex align-items-center gap-3 p-2 border-none bg-transparent border-round-xl hover:surface-100 transition-duration-150 cursor-pointer disabled:opacity-60"
//                 >
//                   {/* Icon */}
//                   <div
//                     className={`w-3rem h-3rem border-circle flex align-items-center justify-content-center ${item.iconBg}`}
//                   >
//                     <i className={`${item.icon} ${item.iconColor} text-base`} />
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 text-left">
//                     <p className="m-0 text-sm font-semibold text-900">
//                       {item.label}
//                     </p>

//                     <small className="text-600 block text-xs">
//                       {item.description}
//                     </small>
//                   </div>

//                   {/* Loader */}
//                   {isPending && item.key === "all" ? (
//                     <i className="pi pi-spin pi-spinner text-500 text-sm" />
//                   ) : (
//                     <i className="pi pi-angle-right text-500 text-xs" />
//                   )}
//                 </button>

//                 {index !== options.length - 1 && (
//                   <Divider className="mx-0! my-2! p-0!" />
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       </OverlayPanel>
//     </>
//   );
// };

// export default ExcelBtn;

import React, { useRef, useMemo, useCallback } from "react";

import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import CustomButton from "../../Forms/Buttons/CustomButton";

import { useExportDynamicPageQuery } from "../../../pages/DynamicContent/DynamicPage/useDynamicPageQuery";

const ExcelBtn = React.memo(function ExcelBtn({ excelData, exportConfig, label }) {
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

  /* ================= FORMAT DATA ================= */
  const formatExcelData = useCallback((data, renderColumns) => {
    if (!Array.isArray(data) || !data.length) return [];

    return data.map((row) => {
      const formattedRow = {};

      Object.entries(renderColumns || {}).forEach(([key, column]) => {
        formattedRow[column?.header || key] = row?.[key] ?? "";
      });

      return formattedRow;
    });
  }, []);

  /* ================= DOWNLOAD EXCEL ================= */
  const downloadExcel = useCallback(
    ({ data = [], renderColumns = {}, fileName = "export" }) => {
      const formattedData = formatExcelData(data, renderColumns);

      if (!formattedData.length) return;

      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      worksheet["!cols"] = Object.values(renderColumns).map((column) => ({
        wch: Math.max((column?.header || "").length + 5, 20),
      }));

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAs(
        new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }),
        `${fileName}.xlsx`,
      );
    },
    [formatExcelData],
  );

  /* ================= CURRENT PAGE ================= */
  const exportCurrentPage = useCallback(() => {
    downloadExcel({
      data: excelData?.data,
      renderColumns: excelData?.renderColumns,
      fileName: headerName,
    });

    op.current?.hide();
  }, [downloadExcel, excelData, headerName]);

  /* ================= ALL RESULTS ================= */
  const handleExportAll = useCallback(() => {
    exportAllResults(undefined, {
      onSuccess: (response) => {
        const transformedData = config?.transformResponse
          ? config.transformResponse(response)
          : response?.data || [];

        downloadExcel({
          data: transformedData,
          renderColumns:
            response?.renderColumns || excelData?.renderColumns || {},
          fileName: headerName,
        });

        op.current?.hide();
      },

      onError: (error) => {
        console.error("Excel export failed:", error);
      },
    });
  }, [
    exportAllResults,
    config,
    downloadExcel,
    excelData?.renderColumns,
    headerName,
  ]);

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
        className={!label ? "iconBtn": "outlineBtn"}
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
