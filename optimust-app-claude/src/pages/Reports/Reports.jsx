import { Suspense, useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useParams } from "react-router-dom";
import classNames from "classnames";

import Table from "../../components/Table/Table";
import { apiRequest } from "../../services/apiBinding";
// import PartyFormModal from "./PartyForm/PartyFormModal";

const defaultFilters = {
  page: 1,
  pageSize: 50,
};

const Reports = () => {
  const params = useParams();
  const { reportType } = useParams();
  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

  console.log("report id", reportType);
  console.log("appliedFilters id", appliedFilters);

  useEffect(() => {
    console.log("reportType", reportType);

    setAppliedFilters(null); // or null → depends on your requirement
  }, [reportType]);

  const {
    data: info,
    isLoading: infoLoading,
    isError: infoError,
    error: infoErr,
  } = useQuery({
    queryKey: ["report-info", reportType],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: `/reports/info/${reportType}`,
        // payload: appliedFilters,
        method: "get",
        signal,
      }),
    enabled: !!reportType, // <-- important
    keepPreviousData: true,
  });

  console.log("info", info);

  const formattedPayload = useMemo(() => {
    if (!info) return null;

    // Build parameter object using info.reportParameters + appliedFilters
    const parametersObj = {};

    info.reportParameters?.forEach((param) => {
      const uiValue = appliedFilters?.[param.parameterName];

      if (uiValue !== undefined && uiValue !== null && uiValue !== "") {
        parametersObj[`@${param.parameterName}`] = uiValue;
      }
    });

    return {
      page: appliedFilters?.page || 1,
      pageSize: appliedFilters?.pageSize || 50,
      reportId: info.id,
      storedProcedure: info.storedProcedure,
      sortColumn: null,
      sortOrder: null,
      parameters: JSON.stringify(parametersObj), // <-- REQUIRED
      requestColumns: true,
    };
  }, [appliedFilters]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports", formattedPayload],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/reports/generic/page",
        payload: formattedPayload,
        method: "post",
        signal,
      }),
    enabled: !!appliedFilters,
    keepPreviousData: true,
  });
  console.log("data", data);

  const addData = useCallback(() => {
    setVisible(true);
  }, []);

  const headerProps = useMemo(
    () => ({
      addData,
      headerName: info?.name || "",
      setFilters: setAppliedFilters,
      defaultFilters,
      filterName: info?.name || "",
      actionsConfig: {
        add: false,
        filter: true,
        export: true,
        back: false,
      },
    }),

    [addData, setAppliedFilters, info, reportType],
  );

  const sanitizeKey = (key) => key.replace(/[^a-zA-Z0-9 _-]/g, "_");
  const fieldsConfig = useMemo(() => {
    return Object.entries(data?.columns || {}).map(([key, type]) => ({
      key: sanitizeKey(key), // sanitized key for DOM usage
      header: key, // visible label remains original
      type,
    }));
  }, [data]);

  console.log("fieldsConfig", fieldsConfig);

  useMemo(() => {
    if (data?.dataSize !== undefined) {
      setTotalCount(data.dataSize);
    }
  }, [data?.dataSize]);

  if (isError) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="flex gap-4 pt-4">
      <div
        className={classNames(
          params?.formManager ? "w-70" : "w-full",
          "rounded-3xl transition-all duration-300 shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
        )}
      >
        <Table
          data={data?.reportData || []}
          totalRecords={totalCount}
          fieldsConfig={fieldsConfig} // unified config
          dateTimeFields={["created", "modified", "dateOfBirth"]}
          loading={isLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          isSelectionMode="checkbox"
          actions={{ canView: true }}
          headerProps={headerProps}
          pageLinkSize={params?.formManager ? 3 : 5}
          isOpen={params?.formManager ? true : false}
        />
      </div>
      {/* <Suspense fallback={<div>Loading...</div>}>
        <div className="w-[calc(100%-290px)]">
          <Outlet />
        </div>
      </Suspense> */}

      {/* <PartyFormModal setVisible={setVisible} visible={visible} /> */}
    </div>
  );
};

export default Reports;
