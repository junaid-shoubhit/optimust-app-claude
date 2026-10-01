import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "../../../../../../services/apiBinding";

import Input from "../../../../../../components/Forms/Input/Input";
import SelectField from "../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../../../components/Forms/DynamicForm/UserDynamicForm";
import CustomDate from "../../../../../../components/Forms/Date/Date";

import { getId } from "../../../../../../utils/constants/formConstants";

/* ------------------ CREATE STATIC PAYLOAD ------------------ */

const createPayload = (dataTable, dataField = "name", moduleId) => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const FileDispositionDepositCheckForm = ({
  details,
  setVisible,
  setData,
  depositIds,
  mode,
  caseId,
  moduleId,
}) => {
  /* ------------------ DROPDOWN PAYLOADS ------------------ */

  // Payee Type
  const payeeTypePayload = useMemo(() => createPayload("ctPaymentTypes"), []);

  // Payment Type
  const paymentTypePayload = useMemo(
    () => createPayload("ctSSBWVGPaymentTypes"),
    [],
  );

  // Paid To (depends on Payee Type)
  const getPaidToPayload = useCallback((payeeTypeId) => {
    return {
      dataTable: "paid_To_Options",
      dataField: "name",
      searchTerm: "",
      entityId: caseId || null,
      selectedValue: payeeTypeId || null,
    };
  }, []);

  /* ------------------ DEFAULT VALUES ------------------ */

  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,

      paymentTypeId: data.paymentTypeId
        ? {
            value: data.paymentTypeId,
            label: data.paymentType,
          }
        : null,

      paidToId: data.paidToId
        ? {
            value: data.paidToId,
            label: data.paidTo,
          }
        : null,

      paymentAdditionalTypeId: data.additionalPaymentTypeId
        ? {
            value: data.additionalPaymentTypeId,
            label: data.additionalPaymentType,
          }
        : null,
    };
  }, [details]);

  /* ------------------ FORM ------------------ */

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  /* ------------------ WATCH PAYEE TYPE ------------------ */
  console.log("moduleId", moduleId);
  console.log("caseId", caseId);
  const selectedPayeeType = watch("paymentTypeId");

  const paidToPayload = useMemo(
    () => getPaidToPayload(getId(selectedPayeeType)),
    [selectedPayeeType, getPaidToPayload],
  );

  /* ------------------ MUTATION ------------------ */

  const saveDepositCheckMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/deposits/depositCheck/create",
        method,
        payload,
      }),

    onSuccess: (response) => {
      if (response?.success === false) {
        toast.info(response?.message);
        return;
      }

      toast.success(
        mode === "edit"
          ? "Deposit Check updated successfully"
          : "Deposit Check created successfully",
      );

      reset();
      setData?.(null);
      setVisible(false);
    },
  });

  /* ------------------ CLOSE ------------------ */

  const handleClose = useCallback(() => {
    reset();
    setData?.(null);
    setVisible(false);
  }, [reset, setVisible, setData]);

  /* ------------------ SUBMIT ------------------ */

  const onSubmit = async (values) => {
    const payload = {
      moduleId: moduleId,

      depositIds: Array.isArray(depositIds)
        ? depositIds.join(",") + ","
        : depositIds,

      // amount: Number(values.amount) || 0,

      checkNumber: values.checkNumber || "",

      checkDate: values.checkDate || "",

      clearDate: values.clearDate || "",

      // paymentTypeId: getId(values.paymentTypeId),

      // additionalPaymentTypeId: 2,

      paidToId: getId(values.paidToId),

      memo: values.memo || "",

      amount: Number(values.amount) || 0,

      paymentTypeId: getId(values.paymentTypeId),

      additionalPaymentTypeId: getId(values.paymentAdditionalTypeId),
    };

    try {
      await saveDepositCheckMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (details?.id
            ? "Failed to update deposit check"
            : "Failed to create deposit check"),
      );
    }
  };

  /* ------------------ FORM FIELDS ------------------ */

  /* ------------------ UPDATED FORM FIELDS ------------------ */

  const formFields = useMemo(
    () => [
      {
        name: "checkNumber",
        label: "Check No / Confirmation No",
        component: Input,
        props: {
          isRequired: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "checkDate",
        label: "Date",
        component: CustomDate,
        props: {
          type: "date",
          isRequired: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "paymentTypeId",
        label: "Payee Type",
        component: SelectField,
        props: {
          payload: payeeTypePayload,
          isRequired: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "paidToId",
        label: "Paid To",
        component: SelectField,
        props: {
          payload: paidToPayload,
          isRequired: true,
          isRelation: true,
          disable: !getId(selectedPayeeType),
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "amount",
        label: "Amount",
        component: Input,
        props: {
          type: "number",
          isRequired: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "paymentAdditionalTypeId",
        label: "Payment Type",
        component: SelectField,
        props: {
          payload: paymentTypePayload,
          isRequired: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "memo",
        label: "Check Memo (if any)",
        component: Input,
        props: {
          type: "text",
        },
      },
    ],
    [payeeTypePayload, paidToPayload, paymentTypePayload],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3">
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-2"
      />

      <div className="flex justify-end gap-3 mt-6 py-2">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveDepositCheckMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveDepositCheckMutation.isPending}
        />
      </div>
    </form>
  );
};

export default FileDispositionDepositCheckForm;
