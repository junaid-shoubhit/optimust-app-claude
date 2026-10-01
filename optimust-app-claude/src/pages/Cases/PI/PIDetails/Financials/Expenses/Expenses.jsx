import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import Table from "../../../../../../components/Table/Table";
import { apiRequest } from "../../../../../../services/apiBinding";
import StepModal from "../../../../../../components/Modal/StepModal/StepModal";
import ExpenseForm from "./ExpenseForm/ExpenseForm";
import ExpenseSummaryButton from "../../../../../DynamicContent/DynamicView/components/Buttons/ExpenseSummaryButton";
const defaultFilters = {
  page: 1,
  pageSize: 10,
};

const Expenses = ({ caseId, activeMenu }) => {
  const params = useParams();
  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expenses", appliedFilters, caseId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/expenses/page",
        method: "post",
        payload: {
          ...appliedFilters,
          caseId,
        },
        signal,
      }),
    enabled: !!caseId,
  });

  console.log("Active Menu:", activeMenu);
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
      filterName: "expense",
      actionsConfig: {
        export: true,
        add: activeMenu?.create,
        // filter: true,
      },
      exportConfig: {
        apiPath: "expenses/page",
        activeMenu,
        appliedFilters,
        config: {
          apiPath: "expenses/page",
          transformResponse: (data) => data?.expenses || [],
          payload: {
            caseId: caseId,
          },
        },
      },

      extraBtn: <ExpenseSummaryButton caseId={caseId} />,
    }),
    [addData],
  );

  const fieldsConfig = useMemo(
    () => [
      { parameterName: "id", columnName: "Expense ID", width: "120px" },
      {
        parameterName: "expenseTypeName",
        columnName: "Expense Type",
        width: "180px",
        filter: { type: "input" },
      },
      {
        parameterName: "paymentTypeName",
        columnName: "Payment Type",
        width: "160px",
      },
      {
        parameterName: "expenseStatusName",
        columnName: "Expense Status",
        width: "180px",
      },
      {
        parameterName: "requestedByName",
        columnName: "Requested By",
        width: "180px",
      },
      {
        parameterName: "taskUserName",
        columnName: "Task User Name",
        width: "180px",
      },
      { parameterName: "comments", columnName: "Comments", width: "220px" },
      { parameterName: "payeeName", columnName: "Payee", width: "200px" },
      {
        parameterName: "plaintiffNames",
        columnName: "Plaintiff",
        width: "200px",
      },
      {
        parameterName: "paidStatus",
        columnName: "Paid Status",
        width: "140px",
      },
      {
        parameterName: "isRushCheck",
        columnName: "Is Rush Check",
        width: "140px",
        customTemplate: (val) => (val ? "Yes" : "No"),
      },
      {
        parameterName: "amount",
        columnName: "Amount",
        width: "120px",
      },
      {
        parameterName: "dueDate",
        columnName: "Due Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "invoiceNo",
        columnName: "Invoice No",
        width: "150px",
      },
      {
        parameterName: "expenseDate",
        columnName: "Expense Date",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
      {
        parameterName: "modified",
        columnName: "Modified",
        width: "160px",
        customTemplate: (val) =>
          val ? new Date(val).toLocaleDateString() : "",
      },
    ],
    [],
  );

  const handleEdit = useCallback((rowData) => {
    console.log("Edit row data:", rowData);
    setDetails(rowData);
    setVisible(true);
  }, []);

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
          data={data?.expenses || []}
          totalRecords={totalCount}
          fieldsConfig={fieldsConfig}
          loading={isLoading}
          filters={appliedFilters}
          setFilters={setAppliedFilters}
          actions={{
            canEdit: activeMenu?.update,
            canDelete: activeMenu?.delete,
            onEdit: handleEdit,
            deleteApiPath: `/expenses/:id/${activeMenu?.id}`,
            invalidateKeys: [["expenses", appliedFilters, caseId]],
            dataKey: "expenses",
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
          title="Expenses"
          widthConfig={{
            1: { width: "60vw" },
            2: { width: "90vw", minHeight: "60vh" },
          }}
          entityCode="expense"
          entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          details={details}
          designType={activeMenu?.designType}
          //   StepOneComponent={null} // update if you have form
          StepOneComponent={(props) => (
            <ExpenseForm {...props} caseId={caseId} moduleId={activeMenu?.id} />
          )}
        />
      )}
    </div>
  );
};

export default Expenses;
