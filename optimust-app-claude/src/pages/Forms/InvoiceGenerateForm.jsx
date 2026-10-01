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

const InvoiceGenerateForm = ({ details, setVisible, setData, queryKeys }) => {
  const queryClient = useQueryClient();

  const getId = (option) => option?.value ?? null;

  /* ------------------ DROPDOWN PAYLOADS ------------------ */

  const clientPayload = useMemo(
    () => createPayload("usrUsers", "first_name + ' ' + last_name"),
    [],
  );

  /* ------------------ DEFAULT VALUES ------------------ */

  const defaultValues = useMemo(
    () => ({
      clientId: details?.clientId
        ? {
            label: details?.client,
            value: details?.clientId,
          }
        : null,

      fromDate: details?.issuedDate ? new Date(details.issuedDate) : null,

      toDate: details?.dueDate ? new Date(details.dueDate) : null,

      taxPercent: details?.taxAmount || "",

      notes: details?.notes || "",
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

  const generateInvoiceMutation = useMutation({
    mutationFn: ({ payload }) =>
      apiRequest({
        apiPath: "/TimeBillingInvoice/generate",
        method: "post",
        payload,
      }),
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
      clientId: getId(values?.clientId),
      fromDate: values?.fromDate,
      toDate: values?.toDate,
      taxPercent: Number(values?.taxPercent),
      notes: values?.notes,
    };

    try {
      const response = await generateInvoiceMutation.mutateAsync({
        payload,
      });

      toast.success("Invoice generated successfully");

      setData(response?.data);

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

      reset();
      setVisible(false);
    } catch (error) {
      toast.error(error || "Failed to generate invoice");
    }
  };

  /* ------------------ FORM FIELDS ------------------ */

  const formFields = useMemo(
    () => [
      {
        name: "clientId",
        label: "Client",
        component: SelectField,
        rules: {
          required: "Client is required",
        },
        props: {
          payload: clientPayload,
          isRequired: true,
        },
      },
      {
        name: "fromDate",
        label: "From Date",
        component: CustomDate,
        rules: {
          required: "From Date is required",
        },
        props: {
          showTime: true,
          isRequired: true,
        },
      },
      {
        name: "toDate",
        label: "To Date",
        component: CustomDate,
        rules: {
          required: "To Date is required",
        },
        props: {
          showTime: true,
          isRequired: true,
        },
      },
      {
        name: "taxPercent",
        label: "Tax Percent",
        component: Input,
        rules: {
          required: "Tax Percent is required",
          min: {
            value: 0,
            message: "Tax Percent cannot be less than 0",
          },
          max: {
            value: 100,
            message: "Tax Percent cannot be greater than 100",
          },
          validate: (value) => {
            if (value === "" || value === null || value === undefined) {
              return "Tax Percent is required";
            }

            const num = Number(value);

            if (Number.isNaN(num)) {
              return "Tax Percent must be a valid number";
            }

            if (num < 0 || num > 100) {
              return "Tax Percent must be between 0 and 100";
            }

            return true;
          },
        },
        props: {
          type: "number",
          isRequired: true,
        },
      },
      {
        name: "notes",
        label: "Notes",
        component: Input,
        props: {
          type: "textarea",
        },
      },
    ],
    [clientPayload],
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
            generateInvoiceMutation.isPending ? "GENERATING..." : "GENERATE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || generateInvoiceMutation.isPending}
        />
      </div>
    </form>
  );
};

export default InvoiceGenerateForm;
