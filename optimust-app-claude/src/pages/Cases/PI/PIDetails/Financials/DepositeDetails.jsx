import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import Table from "../../../../../components/Table/Table";
import { apiRequest } from "../../../../../services/apiBinding";
import StepModal from "../../../../../components/Modal/StepModal/StepModal";
import DepositDetailsForm from "./DepositeDetailsForm/DepositeDetailsForm";
import FileDispositionForm from "./FileDispositionForm/FileDispositionForm";
import { toast } from "react-toastify";
const defaultFilters = {
  page: 1,
  pageSize: 10,
};

const DepositDetails = ({ caseId, activeMenu }) => {
  const params = useParams();
  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [visibleModalDisposition, setVisibleModalDisposition] = useState(false);

  const [details, setDetails] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [selectedBalance, setSelectedBalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedChecksAmount, setSelectedChecksAmount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["deposits", appliedFilters, caseId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/deposits/page",
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
  console.log("Active Menu in DepositDetails:", activeMenu);
  const {
    depositChecksData,
    isDepositChecksLoading,
    isdepositchecksError,
    epositcheckserror,
  } = useQuery({
    queryKey: ["depositchecks", appliedFilters, caseId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/deposits/depositChecks/page",
        method: "post",
        payload: {
          ...appliedFilters,
          depositIds: data?.deposits?.map((d) => d.id).join(",") || "",
          moduleId: activeMenu?.id,
        },
        signal,
      }),
    enabled: !!data?.deposits?.length, // Only run this query if we have deposits from the first query
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

  const addDispositionData = useCallback(() => {
    setVisibleModalDisposition(true);
  }, []);

  const headerProps = useMemo(
    () => ({
      addData,
      headerName: activeMenu?.label,
      setFilters: setAppliedFilters,
      defaultFilters,
      filterName: "deposit-details",
      actionsConfig: {
        export: true,
        add: activeMenu?.create,
        // filter: true,
      },
    }),
    [addData],
  );

  const headerPropsdepositChecks = useMemo(
    () => ({
      addData: addDispositionData,
      headerName: "File Disposition",
      setFilters: setAppliedFilters,
      defaultFilters,
      filterName: "depositChecks",
      actionsConfig: {
        add: selectedRows.length > 0,
        back: false,
      },
    }),
    [addDispositionData, selectedRows.length],
  );

  const onRowValidation = ({ type, row, selectedRows }) => {
    console.log("Validating row:", row);
    console.log("Selected rows for validation:", selectedRows);

    // keep latest selected rows
    // setSelectedRows(selectedRows);

    // current selected type/client from existing selected rows
    const selectedTypeAndClient =
      selectedRows.length > 0
        ? {
            depositClient: selectedRows[0]?.clientName,
            depositType: selectedRows[0]?.depositType,
          }
        : {
            depositClient: null,
            depositType: null,
          };

    if (row?.depositStatusName !== "CLEARED") {
      toast.info("Kindly Clear Deposit First to Add New Check ", {
        position: "top-right",
      });

      return false;
    }

    const isSameClientAndType =
      selectedRows.length === 0 ||
      (row.clientName === selectedTypeAndClient.depositClient &&
        row.depositType === selectedTypeAndClient.depositType);

    if (!isSameClientAndType) {
      toast.error("Only same client and deposit type rows allowed");

      return false;
    }

    // SELECT
    if (type === "select") {
      setSelectedBalance((old) => old + (row.balance || 0));

      setSelectedAmount((old) => old + (row.depositAmount || 0));

      setSelectedChecksAmount((old) => old + (row.depositChecksAmountSum || 0));
    }

    // UNSELECT
    if (type === "unselect") {
      setSelectedBalance((old) => old - (row.balance || 0));

      setSelectedAmount((old) => old - (row.depositAmount || 0));

      setSelectedChecksAmount((old) => old - (row.depositChecksAmountSum || 0));
    }

    return true;
  };

  const handleEdit = useCallback((rowData) => {
    setDetails(rowData);
    setVisible(true);
  }, []);

  const fieldsConfig = useMemo(
    () => [
      {
        parameterName: "depositType",
        columnName: "Deposit Type",
        width: "180px",
      },
      {
        parameterName: "settlementAward",
        columnName: "Settlement Award",
        width: "250px",
      },
      {
        parameterName: "clientName",
        columnName: "Client Name",
        width: "200px",
      },
      {
        parameterName: "depositDate",
        columnName: "Deposit Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "depositAmount",
        columnName: "Deposit Amount",
        width: "160px",
        customTemplate: (val) => `$${Number(val || 0).toFixed(2)}`,
      },
      {
        parameterName: "depositChecksAmountSum",
        columnName: "Disbursed",
        width: "140px",
        customTemplate: (val) => `$${Number(val || 0).toFixed(2)}`,
      },
      {
        parameterName: "checkWireNo",
        columnName: "Check No",
        width: "140px",
      },
      {
        parameterName: "iolaAccount",
        columnName: "IOLA Account",
        width: "220px",
      },
      {
        parameterName: "bankAccount",
        columnName: "Bank Account",
        width: "220px",
      },
      {
        parameterName: "clearDate",
        columnName: "Clear Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "depositStatusName",
        columnName: "Deposit Status",
        width: "180px",
      },
      {
        parameterName: "isVoid",
        columnName: "Is Void",
        width: "120px",
        customTemplate: (val) => (val ? "Yes" : "No"),
      },
      {
        parameterName: "balance",
        columnName: "Balance",
        width: "140px",
        customTemplate: (val) => `$${Number(val || 0).toFixed(2)}`,
      },
    ],
    [],
  );

  const fileispositionFieldsConfig = useMemo(
    () => [
      {
        parameterName: "checkNumber",
        columnName: "Check No / Confirmation No",
        width: "220px",
      },
      {
        parameterName: "checkDate",
        columnName: "Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "paidTo",
        columnName: "Paid To",
        width: "220px",
      },
      {
        parameterName: "amount",
        columnName: "Amount ($)",
        width: "160px",
        customTemplate: (val) => `$${Number(val || 0).toFixed(2)}`,
      },
      {
        parameterName: "payeeType",
        columnName: "Payee Type",
        width: "220px",
      },
      {
        parameterName: "additionalPaymentType",
        columnName: "Payment Type",
        width: "180px",
      },
      {
        parameterName: "clearDate",
        columnName: "Clear Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "checkStatusName",
        columnName: "Check Status",
        width: "160px",
      },
      {
        parameterName: "isVoid",
        columnName: "Is Void",
        width: "120px",
        customTemplate: (val) => (val ? "Yes" : "No"),
      },
      {
        parameterName: "memo",
        columnName: "Memo",
        width: "220px",
      },
      {
        parameterName: "created",
        columnName: "Created",
        width: "180px",
        customTemplate: (val) => (val ? new Date(val).toLocaleString() : ""),
      },
      {
        parameterName: "modified",
        columnName: "Modified",
        width: "180px",
        customTemplate: (val) => (val ? new Date(val).toLocaleString() : ""),
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
          data={data?.deposits || []}
          totalRecords={totalCount}
          fieldsConfig={fieldsConfig}
          loading={isLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          actions={{
            canEdit: activeMenu?.update,
            canDelete: activeMenu?.delete,
            onEdit: handleEdit,
            deleteApiPath: `/Deposits/:id/${activeMenu?.id}`,
            invalidateKeys: ["deposits", appliedFilters, caseId],
          }}
          headerProps={headerProps}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onRowValidation={onRowValidation}
          isSelectionMode={true}
          pageLinkSize={params?.formManager ? 3 : 5}
          isOpen={!!params?.formManager}
        />

        {/* Footer Totals */}
        <div className="flex flex-wrap gap-8 px-6 py-4 border-t font-semibold text-sm">
          <div>
            TOTAL DEPOSIT:{" "}
            <span>${Number(data?.depositAmountTotal || 0).toFixed(2)}</span>
          </div>

          <div>
            TOTAL DISBURSED:{" "}
            <span>
              ${Number(data?.depositChecksAmountSumTotal || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <Table
          data={depositChecksData?.depositChecks || []}
          totalRecords={totalCount}
          fieldsConfig={fileispositionFieldsConfig}
          loading={isDepositChecksLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          headerProps={headerPropsdepositChecks}
          pageLinkSize={params?.formManager ? 3 : 5}
          isOpen={!!params?.formManager}
        />
      </div>

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={0}
          title="Deposit Details"
          widthConfig={{
            1: { width: "60vw" },
            2: { width: "90vw", minHeight: "60vh" },
          }}
          entityCode="deposit-details"
          entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          details={details}
          designType={activeMenu?.designType}
          StepOneComponent={(props) => (
            <DepositDetailsForm {...props} caseId={caseId} />
          )}
          moduleId={activeMenu?.id}
        />
      )}

      {visibleModalDisposition && (
        <StepModal
          visible={visibleModalDisposition}
          setVisible={setVisibleModalDisposition}
          id={0}
          title="File Disposition"
          widthConfig={{
            1: { width: "60vw" },
            2: { width: "90vw", minHeight: "60vh" },
          }}
          entityCode="file-disposition"
          entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          details={details}
          designType={activeMenu?.designType}
          StepOneComponent={(props) => (
            <FileDispositionForm
              {...props}
              caseId={caseId}
              moduleId={activeMenu?.id}
            />
          )}
          moduleId={activeMenu?.id}
        />
      )}
    </div>
  );
};

export default DepositDetails;
