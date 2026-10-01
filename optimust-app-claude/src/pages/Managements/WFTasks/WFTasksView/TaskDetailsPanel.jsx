import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Table from "../../../../components/Table/Table";
import { apiRequest } from "../../../../services/apiBinding";
import { buildPayload } from "../../../DynamicContent/DynamicPage/useDynamicPageQuery";
import StepModal from "../../../../components/Modal/StepModal/StepModal";

const defaultFilters = {
  page: 1,
  pageSize: 50,
};

const TaskDetailsPanel = ({ payload, moduleId, invalidateKeys }) => {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const handleRowAction = useCallback((row) => {
    setDetails(row);
    setVisible(true);
  }, []);
  /* ================= CONFIG ================= */

  const config = useMemo(
    () => ({
      headerName: "Task Details",
      apiPath: "/Task/TaskSubTypeDetails",

      payload: ({ appliedFilters, pageSize }) => ({
        ...payload,
        ...appliedFilters,

        moduleId,

        ...(pageSize && {
          page: 1,
          pageSize,
        }),
      }),
      transformResponse: (data) => data?.tasks || [],
      actions: {
        canEdit: true,
        onEdit: handleRowAction,
      },
    }),
    [payload, moduleId, handleRowAction],
  );

  /* ================= QUERY ================= */

  const requestPayload = useMemo(
    () =>
      buildPayload({
        appliedFilters: filters,
        config,
      }),
    [filters, config],
  );

  const {
    data: taskDetails,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "task-sub-type-details",
      payload,
      moduleId,
      filters.page,
      filters.pageSize,
    ],

    queryFn: ({ signal }) =>
      apiRequest({
        method: "post",
        apiPath: config.apiPath,
        payload: requestPayload,
        signal,
      }),

    enabled: Boolean(payload && moduleId),

    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  /* ================= TABLE DATA ================= */

  const tableData = useMemo(
    () => taskDetails?.tasks ?? [],
    [taskDetails?.tasks],
  );

const tableColumns = useMemo(() => {
  if (!taskDetails?.columns) return [];

  return Object.entries(taskDetails.columns).map(
    ([parameterName, columnName]) => ({
      parameterName,
      columnName,
      width: "180px",
      isSort: false,
      type: "text",
      ...(parameterName === "caseNo" && {
        customTemplate: (value, rowData) => (
          <button
            type="button"
            className="text-blue-600 underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();

              window.open(
                `/app/cases/tabs-dynamic/pi/overview?id=${rowData?.caseId}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            {value || "-"}
          </button>
        ),
      }),
    }),
  );
}, [taskDetails?.columns]);

  /* ================= HEADER ================= */

  const headerProps = useMemo(
    () => ({
      headerName: config.headerName,

      activeMenuId: moduleId,

      setFilters,

      defaultFilters,

      filtersData: [],

      actionsConfig: {
        add: false,
        filter: false,
        export: true,
        back: false,
      },

      exportConfig: {
        activeMenu: {
          id: moduleId,
          entityCodeId: null,
        },
        appliedFilters: filters,

        config,
      },
    }),
    [config, filters, moduleId],
  );

  /* ================= ERROR ================= */

  if (isError) {
    return (
      <div className="text-red-500">
        {error?.message || "Failed to load task details"}
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="w-full">
      <Table
        data={tableData}
        totalRecords={taskDetails?.dataSize ?? 0}
        fieldsConfig={tableColumns}
        loading={isLoading}
        isFiltersLoading={isLoading}
        filters={filters}
        setFilters={setFilters}
        headerProps={headerProps}
        actions={config.actions}
        isSelectionMode={false}
      />
      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={details?.taskId || 0}
          title={"Task Workflow"}
          widthConfig={config?.stepModal?.widthConfig}
          entityCode={"workflows"}
          entityCodeId={210}
          moduleId={moduleId}
          designType={"no-tabs"}
          colSize={config?.stepModal?.colSize || ""}
          // StepOneComponent={StepOneComponent}
          details={details}
          // queryKey={["invalidateKeys"]}
          queryKeys={{
            wftasksQuery: invalidateKeys,
            pageQueryKey: [
              "task-sub-type-details",
              payload,
              moduleId,
              filters.page,
              filters.pageSize,
            ],
          }}
        />
      )}
    </div>
  );
};

export default TaskDetailsPanel;
