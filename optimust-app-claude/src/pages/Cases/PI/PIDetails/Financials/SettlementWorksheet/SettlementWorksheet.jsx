import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import Table from "../../../../../../components/Table/Table";
import { apiRequest } from "../../../../../../services/apiBinding";
import StepModal from "../../../../../../components/Modal/StepModal/StepModal";
import SettlementWorksheetForm from "./SettlementWorksheetForm/SettlementWorksheetForm";
import ShowNoteBtn from "./ShowNoteBtn";

const defaultFilters = {
  page: 1,
  pageSize: 10,
};

const SettlementWorksheet = ({ caseId, activeMenu }) => {
  const params = useParams();
  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  console.log("Active Menu in SettlementWorksheet:", activeMenu);

  /* ------------------ API ------------------ */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["settlementworksheets", appliedFilters, caseId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/settlementWorksheet/page",
        method: "post",
        payload: {
          ...appliedFilters,
          caseId,
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

  /* ------------------ ACTIONS ------------------ */
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
      filterName: "settlement",
      actionsConfig: {
        add: activeMenu?.create,
        // filter: true,
      },
      extraBtn: <ShowNoteBtn caseId={caseId} />,
    }),
    [addData],
  );

  const handleEdit = useCallback((rowData) => {
    setDetails(rowData);
    setVisible(true);
  }, []);

  /* ------------------ TABLE CONFIG ------------------ */
  const fieldsConfig = useMemo(
    () => [
      {
        parameterName: "plaintiffName",
        columnName: "Plaintiff Name",
        width: "200px",
      },
      {
        parameterName: "settledByNames",
        columnName: "Settled By",
        width: "180px",
      },
      {
        parameterName: "handledByNames",
        columnName: "Handled By",
        width: "180px",
      },
      {
        parameterName: "settlementTypeName",
        columnName: "Settlement Type",
        width: "180px",
      },
      {
        parameterName: "settlementSettled",
        columnName: "Settlement Settled",
        width: "180px",
      },
      {
        parameterName: "isThereSignedLienInTheFile",
        columnName: "Signed Lien In File",
        width: "180px",
        customTemplate: (val) => (val ? "Yes" : "No"),
      },
      {
        parameterName: "settlementAmount",
        columnName: "Settlement Amount",
        width: "160px",
      },
      {
        parameterName: "lienAmount",
        columnName: "Lien Amount",
        width: "160px",
      },
      {
        parameterName: "settlementDate",
        columnName: "Settlement Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "settlementAccepted",
        columnName: "Settlement Accepted",
        width: "180px",
        customTemplate: (val) => (val ? "Yes" : "No"),
      },
      {
        parameterName: "specialInstructions",
        columnName: "Special Instructions",
        width: "220px",
      },
      {
        parameterName: "comments",
        columnName: "Comments",
        width: "220px",
      },
    ],
    [],
  );

  if (isError) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="flex gap-4">
      <div
        className={classNames(
          params?.formManager ? "w-70" : "w-full",
          "w-full rounded-3xl transition-all duration-300 shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
        )}
      >
        <Table
          data={data?.settlementWorksheets || []}
          totalRecords={totalCount}
          fieldsConfig={fieldsConfig}
          loading={isLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          actions={{
            canEdit: activeMenu?.update,
            onEdit: handleEdit,
            canDelete: activeMenu?.delete,
            deleteApiPath: `/SettlementWorksheet/:id/${activeMenu?.id}`,
            invalidateKeys: [["settlementworksheets", appliedFilters, caseId]],
            dataKey: "settlementWorksheets",
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
          title="Settlement Worksheet"
          widthConfig={{
            1: { width: "60vw" },
            2: { width: "90vw", minHeight: "60vh" },
          }}
          entityCode="settlement"
          entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          details={details}
          designType={activeMenu?.designType}
          StepOneComponent={(props) => (
            <SettlementWorksheetForm
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

export default SettlementWorksheet;
