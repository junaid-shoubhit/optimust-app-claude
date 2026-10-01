import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import Table from "../../../../../../components/Table/Table";
import { apiRequest } from "../../../../../../services/apiBinding";
import StepModal from "../../../../../../components/Modal/StepModal/StepModal";
import FeeDetailsForm from "./FeeDetailsForm";

const defaultFilters = {
  page: 1,
  pageSize: 10,
};

const FeeDetails = ({ caseId, activeMenu }) => {
  const params = useParams();
  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  console.log("Active Menu:", activeMenu);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["feeDetails", appliedFilters, caseId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/FeeDetails/page",
        method: "post",
        payload: {
          ...appliedFilters,
          caseId,
          moduleId: activeMenu?.id,
        },
        signal,
      }),
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
      filterName: "feeDetails",
      actionsConfig: {
        export: true,
        add: activeMenu?.create,
        // filter: true,
      },
      exportConfig: {
        apiPath: "FeeDetails/page",
        activeMenu,
        appliedFilters,
        config: {
          apiPath: "FeeDetails/page",
          transformResponse: (data) => data?.feeDetails || [],
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
        parameterName: "enteredByName",
        columnName: "Entered By",
        width: "220px",
      },
      {
        parameterName: "feeTypeName",
        columnName: "Fee Type",
        width: "180px",
      },
      {
        parameterName: "awardedDate",
        columnName: "Awarded Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "feeAwarded",
        columnName: "Fee Awarded",
        width: "160px",
      },
      {
        parameterName: "amountReceived",
        columnName: "Amount Received",
        width: "180px",
      },
      {
        parameterName: "statusName",
        columnName: "Status",
        width: "160px",
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
          params?.formManager ? "w-70" : "w-full",
          "w-full rounded-3xl transition-all duration-300 shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
        )}
      >
        <Table
          data={data?.feeDetails || []}
          totalRecords={totalCount}
          fieldsConfig={fieldsConfig}
          loading={isLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          actions={{
            canEdit: activeMenu?.update,
            canDelete: activeMenu?.delete,
            // onEdit: handleEdit,
            // deleteApiPath: `/feeDetails/:id`,
            // invalidateKeys: [["feeDetails"]],
          }}
          headerProps={headerProps}
          pageLinkSize={params?.formManager ? 3 : 5}
          isOpen={!!params?.formManager}
        />
      </div>

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={0}
          title="Fee Details"
          widthConfig={{
            1: { width: "60vw" },
            2: { width: "90vw", minHeight: "60vh" },
          }}
          entityCode="feeDetails"
          entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          details={details}
          designType={activeMenu?.designType}
          StepOneComponent={(props) => (
            <FeeDetailsForm
              {...props}
              caseId={caseId}
              moduleId={activeMenu?.id}
            />
          )}
        />
      )}
    </div>
  );
};

export default FeeDetails;
