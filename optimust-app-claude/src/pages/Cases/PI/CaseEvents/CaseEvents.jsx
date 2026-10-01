import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import { apiRequest } from "../../../../services/apiBinding";
import Table from "../../../../components/Table/Table";

const defaultFilters = {
  page: 1,
  pageSize: 50,
};

const fieldsConfig = [
  {
    key: "eventCategory",
    header: "Event Category",
    // width: "180px",
  },
  { key: "calendarEventType", header: "Calendar Event Type" },
  { key: "dateFrom", header: "Date and Time" },
  { key: "calendarEventAdditionalInfo", header: "Additional Info" },
  { key: "calendarEventStatus", header: "Event Status" },
  { key: "userAssignmentNames", header: "Assigned Users" },
  { key: "userGroupAssignmentNames", header: "Assigned User Groups" },
  { key: "comments", header: "Comments" },
  { key: "venue", header: "Venue" },
  { key: "created", header: "Created" },
  { key: "modified", header: "Modified" },
];

const CaseEvents = ({ caseId }) => {
  const params = useParams();
  const [visible, setVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    ...defaultFilters,
    caseId,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["piEvents", appliedFilters],
    queryFn: () =>
      apiRequest({
        apiPath: "calendarEvent/page",
        payload: appliedFilters,
        method: "post",
      }),
    keepPreviousData: true,
  });

  const addData = useCallback(() => {
    setVisible(true);
  }, []);
  const headerProps = useMemo(
    () => ({
      addData,
      headerName: "Events",
      setAppliedFilters,
      actionsConfig: {
        add: true,
        filter: true,
        export: false,
        back: false,
      },
    }),
    [addData, setAppliedFilters],
  );

  if (isError) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="flex gap-4 -m-2! h-full">
      <div
        className={classNames(
          "h-[calc(100vh - 11.2rem)]! max-w-full! rounded-3xl transition-all duration-300 shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
        )}
      >
        <Table
          data={data?.calendarEvents || []}
          totalRecords={data?.dataSize || 0}
          fieldsConfig={fieldsConfig} // unified config
          dateTimeFields={["dateFrom", "created", "modified"]}
          loading={isLoading}
          scrollHeight={`calc(100vh - 11.3rem)`}
          filters={appliedFilters}
          //   isSelectionMode="checkbox"
          isActionsVisible
          actions={{ canView: true }}
          headerProps={headerProps}
          page={(appliedFilters.page - 1) * appliedFilters.pageSize}
          rows={appliedFilters.pageSize}
          pageLinkSize={params?.formManager ? 3 : 5}
          isOpen={params?.formManager ? true : false}
        />
      </div>
    </div>
  );
};

export default CaseEvents;
