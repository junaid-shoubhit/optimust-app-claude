import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../../services/apiBinding";

import Input from "../../../../../../../components/Forms/Input/Input";
import SelectField from "../../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../../../../components/Forms/DynamicForm/UserDynamicForm";
import CustomToggle from "../../../../../../../components/Forms/CustomToggle/CustomToggle";
import CustomDate from "../../../../../../../components/Forms/Date/Date";
import { getId } from "../../../../../../../utils/constants/formConstants";

/* ------------------ CREATE STATIC PAYLOAD ------------------ */
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const ExpenseForm = ({
  details,
  setVisible,
  setData,
  caseId,
  mode,
  onSuccess,
  moduleId,
}) => {
  console.log("ExpenseForm details", details);
  const queryClient = useQueryClient();
  /* ------------------ DROPDOWN PAYLOADS ------------------ */
  const expenseTypePayload = useMemo(() => createPayload("ExpenseTypes"), []);
  const expenseStatusPayload = useMemo(
    () => createPayload("ExpenseStatuses"),
    [],
  );
  const paymentTypePayload = useMemo(() => createPayload("PaymentTypes"), []);
  const payeePayload = useMemo(
    () => createPayload("prtParties_SSBWVGPayees_Expense"),
    [],
  );
  const plaintiffPayload = useMemo(
    () => createPayload("CasePlaintiffParties"),
    [],
  );
  const requestedByPayload = useMemo(() => createPayload("Expenses_Users"), []);

  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,

      dueDate: data.dueDate ? new Date(data.dueDate) : "",

      expenseDate: data.expenseDate ? new Date(data.expenseDate) : "",

      expenseTypeId: data.expenseTypeId
        ? { value: data.expenseTypeId, label: data.expenseTypeName }
        : null,

      expenseStatusId: data.expenseStatusId
        ? { value: data.expenseStatusId, label: data.expenseStatusName }
        : null,

      paymentTypeId: data.paymentTypeId
        ? { value: data.paymentTypeId, label: data.paymentTypeName }
        : null,

      payeeId: data.payeeId
        ? { value: data.payeeId, label: data.payeeName }
        : null,

      requestedBy: data.requestedById
        ? { value: data.requestedById, label: data.requestedByName }
        : null,

      taskUserId: data.taskUserId
        ? { value: data.taskUserId, label: data.taskUserName }
        : null,

      plaintiffIds: data.plaintiffIds
        ? data.plaintiffIds.split(",").map((id, i) => ({
            value: id,
            label: data.plaintiffNames?.split(";")[i] || "",
          }))
        : [],

      isRushCheck: data.isRushCheck ?? false,
    };
  }, [details]);

  /* ------------------ FORM ------------------ */
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  /* ------------------ MUTATION ------------------ */
  const saveExpenseMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/expenses",
        method,
        payload,
      }),

    onSuccess: (response) => {
      console.log("Expense saved response", response);
      const expense = response;

      if (!expense) return;

      const expenseId = expense.id;

      queryClient.setQueryData(["expense-details", expenseId], response);

      queryClient.setQueriesData({ queryKey: ["expenses"] }, (old) => {
        console.log("Old expenses data:", old);
        if (!old) return old;
        console.log("Old expenses data:", old);

        const exists = old.expenses?.some((item) => item.id === expenseId);

        if (exists) {
          return {
            ...old,
            expenses: old.expenses.map((item) =>
              item.id === expenseId ? expense : item,
            ),
          };
        }

        return {
          ...old,
          expenses: [expense, ...(old.expenses || [])],
          dataSize: (old.dataSize || 0) + 1,
        };
      });
    },
  });
  /* ------------------ CLOSE ------------------ */
  const handleClose = useCallback(() => {
    reset();
    setData(null);
    setVisible(false);
  }, [reset, setVisible]);

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (values) => {
    const payload = {
      id: details?.id || null,

      expenseTypeId: getId(values.expenseTypeId),
      paymentTypeId: getId(values.paymentTypeId),
      payeeId: getId(values.payeeId),
      plaintiffIds: values.plaintiffIds?.map((p) => p.value).join(","),

      amount: Number(values.amount),
      dueDate: values.dueDate,
      invoiceNo: values.invoiceNo || "",
      expenseDate: values.expenseDate,

      isRushCheck: values.isRushCheck ?? null,
      comments: values.comments,

      caseId,
      expenseStatusId: getId(values.expenseStatusId),
      taskUserId: getId(values.taskUserId),
      moduleId: moduleId,
      requestedBy: getId(values.requestedBy),
      contactId: getId(values.requestedBy), // ⚠️ confirm if different
    };

    try {
      await saveExpenseMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      toast.success(
        details?.id
          ? "Expense updated successfully"
          : "Expense created successfully",
      );

      setVisible(false);

      reset();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error(
        error?.response?.data?.message ||
          (details?.id
            ? "Failed to update expense"
            : "Failed to create expense"),
      );
    }
  };

  /* ------------------ FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "expenseTypeId",
        label: "Expense Type",
        component: SelectField,
        props: { payload: expenseTypePayload, isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "expenseStatusId",
        label: "Expense Status",
        component: SelectField,
        props: { payload: expenseStatusPayload, isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "paymentTypeId",
        label: "Payment Type",
        component: SelectField,
        props: { payload: paymentTypePayload, isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "payeeId",
        label: "Payee",
        component: SelectField,
        props: { payload: payeePayload, isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "plaintiffIds",
        label: "Plaintiffs",
        component: SelectField,
        props: {
          payload: {
            ...plaintiffPayload,
            entityId: caseId ? caseId : null,
          },
          isMulti: true,
          isRequired: true,
          isRelation: true,
        },
        rules: { required: "Required" },
      },
      {
        name: "requestedBy",
        label: "Requested By",
        component: SelectField,
        props: {
          payload: { ...requestedByPayload, entityId: caseId ? caseId : null },
          isRequired: true,
          isRelation: true,
        },
        rules: { required: "Required" },
      },
      {
        name: "taskUserId",
        label: "Task User",
        component: SelectField,
        props: {
          payload: { ...requestedByPayload, entityId: caseId ? caseId : null },
          // isRequired: true,
          isRelation: true,
        },
        // rules: { required: "Required" },
      },
      {
        name: "dueDate",
        label: "Due Date",
        component: CustomDate,
        props: { type: "date", isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "expenseDate",
        label: "Expense Date",
        component: CustomDate,
        props: { type: "date", isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "invoiceNo",
        label: "Invoice No",
        component: Input,
      },
      {
        name: "amount",
        label: "Amount",
        component: Input,
        props: { type: "number", isRequired: true },
        rules: { required: "Required" },
      },

      {
        name: "comments",
        label: "Comments",
        component: Input,
        props: { type: "textarea" },
      },
      {
        name: "isRushCheck",
        label: "Is Rush Check",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Is Rush Check
            </label>
            <CustomToggle {...field} checked={field.value} />
          </div>
        ),
      },
    ],
    [
      expenseTypePayload,
      expenseStatusPayload,
      paymentTypePayload,
      payeePayload,
      plaintiffPayload,
      requestedByPayload,
    ],
  );

  return (
    <form className="px-3" onSubmit={handleSubmit(onSubmit)}>
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-3 "
      />

      <div className="flex justify-end gap-3 my-3">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveExpenseMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveExpenseMutation.isPending}
        />
      </div>
    </form>
  );
};

export default ExpenseForm;
