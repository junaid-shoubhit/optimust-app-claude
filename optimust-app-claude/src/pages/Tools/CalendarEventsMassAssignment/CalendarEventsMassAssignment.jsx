import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import { toast } from "react-toastify";

import Table from "../../../components/Table/Table";
import SelectField from "../../../components/Forms/Select/Select";
import AttorneySelectCell from "./customTemplate/AttorneySelectCell";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";

import { apiRequest } from "../../../services/apiBinding";
import { createPayload } from "../../../utils/constants/formConstants";
import { useAppNavigation } from "../../../navigation/NavigationContext";

const defaultFilters = {
  page: 1,
  pageSize: 50,
  // moduleId: 16,
};

const CalendarEventsMassAssignment = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { activeMenu } = useAppNavigation();

  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);

  // only store user modifications
  const [userChanges, setUserChanges] = useState({});

  // stable ref to avoid rerendering table
  const selectedAssignmentsRef = useRef({});

  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const attorneysPayload = useMemo(() => {
    const base = createPayload("ct_HandlingAttorneys") || {};

    return {
      ...base,
      userId: 11103,
      firmId: 0,
      page: 1,
      pageSize: 10,
      dataTable: "ct_HandlingAttorneys",
      dataField: "name",
      searchTerm: "",
      fetchSize: 0,
      showAll: true,
      entityId: null,
      fieldDefinitionId: 0,
      relationId: 0,
      entityCode: "",
      selectedValue: "",
    };
  }, []);

  const dateRangePayload = {
    // dateFrom: "1/4/2026",
    // dateTo: new Date().toLocaleDateString("en-US"),
    page: 1,
    pageSize: 50,
    searchTerm: "",
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["calendarEvents", appliedFilters],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/calendarEvent/between-dates",
        payload: appliedFilters,
        method: "post",
        signal,
      }),
  });

  // initial assignments from API
  const initialAssignments = useMemo(() => {
    if (!data?.length) return {};

    const initial = {};

    data.forEach((row) => {
      if (row.userAssignments?.length) {
        initial[row.id] = row.userAssignments.map((u) => ({
          label: u.name,
          value: u.id,
        }));
      }
    });

    return initial;
  }, [data]);

  // merge server + user edits
  const selectedAssignments = useMemo(() => {
    return {
      ...initialAssignments,
      ...userChanges,
    };
  }, [initialAssignments, userChanges]);

  // keep ref updated
  useEffect(() => {
    selectedAssignmentsRef.current = selectedAssignments;
  }, [selectedAssignments]);

  // clear changes on filter change
  useEffect(() => {
    setUserChanges({});
  }, [appliedFilters]);

  useEffect(() => {
    if (data?.dataSize !== undefined) {
      setTotalCount(data.dataSize);
    }
  }, [data?.dataSize]);

  const addData = useCallback(() => {
    setVisible(true);
  }, []);

  // optimized assignment change handler
  const handleAssignmentChange = useCallback((rowId, value) => {
    setUserChanges((prev) => {
      const prevValue = prev[rowId];

      // avoid unnecessary updates
      if (prevValue === value) return prev;

      return {
        ...prev,
        [rowId]: value,
      };
    });
  }, []);

  const handleSubmitAssignments = useCallback(async () => {
    const currentAssignments = selectedAssignmentsRef.current;

    const changedRows = Object.entries(currentAssignments)
      .filter(([_, users]) => users?.length > 0)
      .map(([eventId, users]) => ({
        EventId: Number(eventId),
        UserIds: users.map((u) => u.value).join(","),
      }));

    if (!changedRows.length) {
      toast.error("No changes to submit");
      return;
    }

    try {
      await apiRequest({
        apiPath: "/calendarEvent/assign-users",
        method: "post",
        payload: {
          moduleId: activeMenu?.id,
          userCalendarEventAssignments: changedRows,
        },
      });

      toast.success("Assignments updated");

      // clear only local overrides
      setUserChanges({});
    } catch {
      toast.error("Failed to assign users");
    }
  }, []);

  const headerProps = useMemo(
    () => ({
      addData,

      headerName: activeMenu?.label,

      setFilters: setAppliedFilters,

      defaultFilters,

      filterName: "user",

      extraBtn: (
        <CustomButton
          iconPos="left"
          label="Save"
          icon="pi pi-check"
          className="saveBtn"
          aria-label="Add"
          onClick={handleSubmitAssignments}
        />
      ),

      actionsConfig: {
        export: true,
        back: !!params?.formManager,
        add: activeMenu?.create,
      },
    }),
    [addData, setAppliedFilters, handleSubmitAssignments],
  );

  // IMPORTANT:
  // removed selectedAssignments dependency
  const fieldsConfig = useMemo(
    () => [
      {
        parameterName: "id",
        columnName: "Event Id",
        width: "120px",
      },

      {
        parameterName: "caseNo",
        columnName: "Case No",
        width: "150px",
      },

      {
        parameterName: "docketWCBNumber",
        columnName: "Docket # / WCB #",
        width: "180px",
      },

      {
        parameterName: "caseName",
        columnName: "Case Name",
        width: "250px",
      },

      {
        parameterName: "calendarEventType",
        columnName: "Calendar Event Type",
        width: "220px",
      },

      {
        parameterName: "dateFrom",
        columnName: "Date",
        width: "160px",

        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },

      {
        parameterName: "court",
        columnName: "Court",
        width: "180px",
      },

      {
        parameterName: "calendarEventStatus",
        columnName: "Status",
        width: "150px",
      },

      {
        parameterName: "comments",
        columnName: "Comments",
        width: "300px",
      },

      {
        parameterName: "calendarEventAssignUser",

        columnName: "Already Assigned Attorney",

        width: "220px",
      },

      {
        parameterName: "assignAttorney",

        columnName: "Assign Attorney",

        width: "280px",

        customTemplate: (_, row) => (
          <AttorneySelectCell
            rowId={row.id}
            initialValue={
              row.userAssignments?.length
                ? row.userAssignments.map((u) => ({
                    label: u.name,
                    value: u.id,
                  }))
                : []
            }
            onChange={handleAssignmentChange}
            attorneysPayload={attorneysPayload}
          />
        ),
      },
    ],
    [attorneysPayload, handleAssignmentChange],
  );

  if (isError) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="flex gap-4 pt-4">
      <div
        className={classNames(
          params?.formManager ? "w-70" : "w-full",

          "rounded-3xl transition-all duration-300 shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
        )}
      >
        <Table
          data={data || []}
          totalRecords={totalCount}
          fieldsConfig={fieldsConfig}
          dateTimeFields={["dateOpened"]}
          loading={isLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          isSelectionMode="checkbox"
          actions={{
            canEdit: activeMenu?.update,
            canDelete: activeMenu?.delete,
          }}
          headerProps={headerProps}
          pageLinkSize={params?.formManager ? 3 : 5}
          isOpen={params?.formManager ? true : false}

          // HUGE performance boost
          // virtualScrollerOptions={{
          //   itemSize: 54,
          // }}
        />
      </div>
    </div>
  );
};

export default CalendarEventsMassAssignment;
