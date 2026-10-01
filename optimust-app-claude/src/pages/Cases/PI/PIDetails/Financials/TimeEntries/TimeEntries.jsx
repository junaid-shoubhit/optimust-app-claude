import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import Table from "../../../../../../components/Table/Table";
import { apiRequest } from "../../../../../../services/apiBinding";
import StepModal from "../../../../../../components/Modal/StepModal/StepModal";
import TimeEntriesForm from "./TimeEntriesForm/TimeEntriesForm";

const defaultFilters = {
  page: 1,
  pageSize: 10,
};

const TimeEntries = ({ caseId, activeMenu }) => {
  const params = useParams();

  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["timeEntries", appliedFilters, caseId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/TimeEntry/GetTimeEntries",
        method: "post",

        payload: {
          // ...appliedFilters,
          entityId: caseId,
          //    page: 1,
          // pageSize: 50,
          // searchParam: "",
          // billingUserId: 0,
        },
        signal,
      }),
    select: (data) => data?.data,
    enabled: !!caseId,
  });

  useEffect(() => {
    if (data?.dataSize !== undefined) {
      setTotalCount(data.dataSize);
    }
  }, [data?.dataSize]);

  const addData = useCallback(() => {
    setDetails(null);
    setVisible(true);
  }, []);

  const headerProps = useMemo(
    () => ({
      addData,
      headerName: activeMenu?.label,
      setFilters: setAppliedFilters,
      defaultFilters,
      filterName: "timeEntries",
      actionsConfig: {
        export: true,
        back: false,
        add: activeMenu?.create,
        // filter: true,
      },
      exportConfig: {
        apiPath: "TimeEntry/GetTimeEntries",
        activeMenu,
        appliedFilters,
        config: {
          apiPath: "TimeEntry/GetTimeEntries",
          transformResponse: (data) => data?.data || [],
          payload: {
            caseId: caseId,
          },
        },
      },
    }),
    [addData],
  );

  const fieldsConfig = useMemo(
    () => [
      {
        parameterName: "taskId",
        columnName: "Task ID",
        width: "140px",
      },
      {
        parameterName: "userName",
        columnName: "Billing User",
        width: "180px",
      },
      {
        parameterName: "description",
        columnName: "Description",
        width: "300px",
      },
      {
        parameterName: "startTime",
        columnName: "Start Time",
        width: "180px",
        customTemplate: (val) => (val ? new Date(val).toLocaleString() : ""),
      },
      {
        parameterName: "endTime",
        columnName: "End Time",
        width: "180px",
        customTemplate: (val) => (val ? new Date(val).toLocaleString() : ""),
      },
      {
        parameterName: "isBillable",
        columnName: "Billable",
        width: "120px",
        customTemplate: (val) => (val ? "Yes" : "No"),
      },
    ],
    [],
  );

  const handleEdit = useCallback((rowData) => {
    console.log("Edit row data:", rowData);
    setDetails(rowData);
    setVisible(true);
  }, []);

  if (isError) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="flex gap-4">
      <div
        className={classNames(
          // params?.formManager ? "w-70" : "w-full",
          "w-full rounded-3xl transition-all duration-300 shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
        )}
      >
        <Table
          data={data || []}
          totalRecords={totalCount}
          fieldsConfig={fieldsConfig}
          loading={isLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          actions={{
            canEdit: activeMenu?.update,
            canDelete: activeMenu?.delete,
            onEdit: handleEdit,
            deleteApiPath: `/TimeEntry/:id`,
            invalidateKeys: [["timeEntries"]],
          }}
          headerProps={headerProps}
          pageLinkSize={params?.formManager ? 3 : 5}
          // isOpen={!!params?.formManager}
        />
      </div>

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={0}
          title="Time Entries"
          widthConfig={{
            1: { width: "60vw" },
            2: { width: "90vw", minHeight: "60vh" },
          }}
          entityCode="timeEntries"
          entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          details={details}
          designType={activeMenu?.designType}
          StepOneComponent={(props) => (
            <TimeEntriesForm {...props} caseId={caseId} />
          )}
        />
      )}
    </div>
  );
};

export default TimeEntries;
