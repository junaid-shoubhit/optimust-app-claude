import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "../../components/Forms/Input/Input";
import SelectField from "../../components/Forms/Select/Select";
import CustomDate from "../../components/Forms/Date/Date";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";

import { apiRequest } from "../../services/apiBinding";

const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const BillingRateForm = ({ details, setVisible, setData, queryKeys }) => {
  const queryClient = useQueryClient();

  const getId = (option) => option?.value ?? null;

  /* ------------------ DROPDOWN PAYLOADS ------------------ */

  const billingUserPayload = useMemo(
    () => createPayload("usrUsers", "first_name + ' ' + last_name"),
    [],
  );

  /* ------------------ DEFAULT VALUES ------------------ */

  const defaultValues = useMemo(
    () => ({
      id: details?.id || null,

      billingTimeUserId: details?.userId
        ? {
            label: details?.billingUserName,
            value: details?.userId,
          }
        : null,

      ratePerHour: details?.ratePerHour || "",

      effectiveFrom: details?.effectiveFrom
        ? new Date(details.effectiveFrom)
        : null,

      effectiveTo: details?.effectiveTo ? new Date(details.effectiveTo) : null,
    }),
    [details],
  );

  /* ------------------ FORM ------------------ */

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  /* ------------------ MUTATION ------------------ */

  const saveBillingRateMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/BillingRate",
        method,
        payload,
      }),

    onSuccess: async (response) => {
      const billingRateData = response?.data;

      if (!billingRateData) return;

      /* ---------- Update Billing Rate List Cache ---------- */

      if (queryKeys)
        await Promise.all(
          Object?.values(queryKeys)
            .filter(Boolean)
            .map((queryKey) =>
              queryClient.invalidateQueries({
                queryKey,
              }),
            ),
        );

      toast.success(
        details?.id
          ? "Billing Rate updated successfully"
          : "Billing Rate created successfully",
      );

      handleClose();
    },
  });

  /* ------------------ CLOSE ACTION ------------------ */

  const handleClose = useCallback(() => {
    reset();
    setData(null);
    setVisible(false);
  }, [reset, setVisible, setData]);

  /* ------------------ SUBMIT ------------------ */

  const onSubmit = async (values) => {
    const payload = {
      id: details?.id || 0,
      billingTimeUserId: getId(values?.billingTimeUserId),
      ratePerHour: Number(values?.ratePerHour),
      effectiveFrom: values?.effectiveFrom,
      effectiveTo: values?.effectiveTo,
    };

    try {
      const response = await saveBillingRateMutation.mutateAsync({
        payload,
        method: details?.id ? "put" : "post",
      });

      setData(response);
      reset();
      setVisible(false);
    } catch (error) {
      toast.error(
        error?.response?.message ||
          (details?.id
            ? "Failed to update Billing Rate"
            : "Failed to create Billing Rate"),
      );
    }
  };

  /* ------------------ FORM FIELDS ------------------ */

  const formFields = useMemo(
    () => [
      {
        name: "billingTimeUserId",
        label: "Billing User",
        component: SelectField,
        rules: {
          required: "Billing User is required",
        },
        props: {
          payload: billingUserPayload,
          isRequired: true,
        },
      },
      {
        name: "ratePerHour",
        label: "Rate Per Hour",
        component: Input,
        rules: {
          required: "Rate Per Hour is required",
        },
        props: {
          type: "number",
          isRequired: true,
        },
      },
      {
        name: "effectiveFrom",
        label: "Effective From",
        component: CustomDate,
        rules: {
          required: "Effective From is required",
        },
        props: {
          showTime: true,
          isRequired: true,
        },
      },
      {
        name: "effectiveTo",
        label: "Effective To",
        component: CustomDate,
        rules: {
          required: "Effective To is required",
        },
        props: {
          showTime: true,
          isRequired: true,
        },
      },
    ],
    [],
  );

  /* ------------------ JSX ------------------ */

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3">
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-2"
      />

      <div className="flex justify-end gap-3 my-3">
        <CustomButton
          label="CANCEL"
          type="button"
          className="cancelBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveBillingRateMutation.isPending
              ? "SAVING..."
              : details?.id
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveBillingRateMutation.isPending}
        />
      </div>
    </form>
  );
};

export default BillingRateForm;
