import { useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "../../../../../../services/apiBinding";

import Input from "../../../../../../components/Forms/Input/Input";
import SelectField from "../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../../../components/Forms/DynamicForm/UserDynamicForm";
import CustomDate from "../../../../../../components/Forms/Date/Date";
import MultiFields from "../../../../../../components/NoTabsForm/MultiFields/MultiFields";
import { getId } from "../../../../../../utils/constants/formConstants";

/* ------------------ CREATE STATIC PAYLOAD ------------------ */
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const FeeDetailsForm = ({
  details,
  setVisible,
  setData,
  caseId,
  mode,
  moduleId,
}) => {
  console.log("FeeDetailsForm details", details);
  console.log("FeeDetailsForm caseId", caseId);
  const queryClient = useQueryClient();

  /* ------------------ DROPDOWN PAYLOADS ------------------ */

  const enteredByPayload = useMemo(
    () => createPayload("usrUsers_Active", "first_name + ' ' + last_name"),
    [],
  );

  const feeTypePayload = useMemo(() => createPayload("ctFeeTypesWC"), []);

  const statusPayload = useMemo(
    () => createPayload("finFeeDetailsWC_Statuses"),
    [],
  );

  const paymentModePayload = useMemo(
    () => createPayload("ctPaymentModesWC"),
    [],
  );

  /* ------------------ DEFAULT VALUES ------------------ */

  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,

      enteredBy: data.enteredById
        ? {
            value: data.enteredById,
            label: data.enteredByName,
          }
        : null,

      feeTypeId: data.feeTypeId
        ? {
            value: data.feeTypeId,
            label: data.feeTypeName,
          }
        : null,

      statusId: data.statusId
        ? {
            value: data.statusId,
            label: data.statusName,
          }
        : null,

      awardedDate: data.awardedDate ? new Date(data.awardedDate) : "",

      feeAwarded: data.feeAwarded || "",

      comments: data.comments || "",

      multiFields: {
        feeDetailsReceivedDatas:
          data?.feeDetailsReceivedDatas?.length > 0
            ? data.feeDetailsReceivedDatas.map((item, index) => ({
                // rowId: item.rowId || -(index + 1),
                rowId: item.rowId ?? index,

                amountReceived: item.amountReceived || "",

                chequeNo: item.chequeNo || "",

                paymentModeId: item.paymentModeId
                  ? {
                      value: item.paymentModeId,
                      label: item.paymentModeName,
                    }
                  : null,

                paymentReceivedDate: item.paymentReceivedDate
                  ? new Date(item.paymentReceivedDate)
                  : "",

                new: false,
                deleted: false,
                edited: false,
              }))
            : [
                {
                  rowId: 0,
                  amountReceived: "",
                  chequeNo: "",
                  paymentModeId: null,
                  paymentReceivedDate: "",
                  new: true,
                  deleted: false,
                  edited: false,
                },
              ],
      },
    };
  }, [details]);

  /* ------------------ FORM ------------------ */

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  /* ------------------ FIELD ARRAY ------------------ */

  const {
    fields: receivedFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "multiFields.feeDetailsReceivedDatas",
  });

  /* ------------------ MUTATION ------------------ */

  const saveFeeDetailsMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/feeDetails",
        method,
        payload,
      }),

    onSuccess: (response) => {
      console.log("feedetail saved response", response);
      const feedetail = response?.data;

      if (!feedetail) return;

      const feedetailId = feedetail.id;

      queryClient.setQueryData(["feeDetails", feedetailId], response);

      console.log("feedetaileid", feedetailId);

      queryClient.setQueriesData({ queryKey: ["feeDetails"] }, (old) => {
        console.log("Old feeDetails data:", old);
        if (!old) return old;
        console.log("Old feeDetails data:", old);

        const exists = old.feeDetails?.some((item) => item.id === feedetailId);

        if (exists) {
          return {
            ...old,
            feeDetails: old.feeDetails.map((item) =>
              item.id === feedetailId ? feedetail : item,
            ),
          };
        }

        return {
          ...old,
          feeDetails: [feedetail, ...(old.feeDetails || [])],
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
  }, [reset, setVisible, setData]);

  /* ------------------ SUBMIT ------------------ */

  const onSubmit = async (values) => {
    const feeDetailsReceivedDatas =
      values?.multiFields?.feeDetailsReceivedDatas?.map((item, index) => ({
        // rowId: item.rowId || -(index + 1),
        rowId: item.rowId ?? index,

        amountReceived: Number(item.amountReceived || 0),

        chequeNo: item.chequeNo || "",

        paymentModeId: getId(item.paymentModeId),

        paymentReceivedDate: item.paymentReceivedDate || null,

        new: item.new ?? true,
        deleted: false,
        edited: item.edited ?? false,
      })) || [];

    const payload = {
      userId: 0,
      firmId: 0,

      moduleId: moduleId,

      enteredBy: getId(values.enteredBy),

      feeTypeId: getId(values.feeTypeId),

      statusId: getId(values.statusId),

      feeAwarded: Number(values.feeAwarded),

      awardedDate: values.awardedDate,

      comments: values.comments || "",

      caseId: caseId,
      feeDetailsReceivedDatas,
    };

    console.log("Payload", payload);

    try {
      await saveFeeDetailsMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      //  queryClient.invalidateQueries({ queryKey: ["feeDetails"] });

      toast.success(
        details?.id
          ? "Fee Details updated successfully"
          : "Fee Details created successfully",
      );

      setVisible(false);

      reset();
    } catch (error) {
      console.error("Error saving fee details:", error);

      toast.error(
        error?.response?.data?.message ||
          (details?.id
            ? "Failed to update fee details"
            : "Failed to create fee details"),
      );
    }
  };

  /* ------------------ MAIN FORM FIELDS ------------------ */

  const formFields = useMemo(
    () => [
      {
        name: "enteredBy",
        label: "Entered By",
        component: SelectField,
        props: {
          payload: enteredByPayload,
          isRequired: true,
        },
        rules: { required: "Required" },
      },

      {
        name: "feeTypeId",
        label: "Fee Type",
        component: SelectField,
        props: {
          payload: feeTypePayload,
          isRequired: true,
        },
        rules: { required: "Required" },
      },

      {
        name: "feeAwarded",
        label: "Fee Awarded ($)",
        component: Input,
        props: {
          type: "number",
          isRequired: true,
        },
        rules: { required: "Required" },
      },

      {
        name: "awardedDate",
        label: "Awarded Date",
        component: CustomDate,
        props: {
          type: "date",
          isRequired: true,
        },
        rules: { required: "Required" },
      },

      {
        name: "statusId",
        label: "Status",
        component: SelectField,
        props: {
          payload: statusPayload,
          isRequired: true,
        },
        rules: { required: "Required" },
      },

      {
        name: "comments",
        label: "Comments",
        component: Input,
        props: {
          type: "textarea",
        },
      },
    ],
    [enteredByPayload, feeTypePayload, statusPayload],
  );

  /* ------------------ MULTI FIELDS ------------------ */

  const multiFieldsConfig = useMemo(
    () => [
      {
        name: "amountReceived",
        label: "Amount Received ($)",
        type: "number",
        id: "amountReceived", // Add this
      },
      {
        name: "paymentModeId",
        label: "Payment Mode",
        type: "select",
        dropdownTable: "ctPaymentModesWC",
        dropdownTableColumn: "your data",
        id: "paymentModeId", // Important
      },
      {
        name: "chequeNo",
        label: "Check No.",
        type: "text",
        id: "chequeNo",
      },
      {
        name: "paymentReceivedDate",
        label: "Payment Received Date",
        type: "date",
        id: "paymentReceivedDate",
      },
    ],
    [],
  );

  return (
    <form className="px-3 py-2" onSubmit={handleSubmit(onSubmit)}>
      {/* ---------------- AIN FIELDS ------------------ */}

      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-3"
      />

      {/* ------------------ MULTI FIELDS ------------------ */}

      <div className="mt-6">
        <h3 className="text-base font-semibold mb-3">Payment Details</h3>
        <MultiFields
          rows={receivedFields}
          append={append}
          remove={remove}
          fields={multiFieldsConfig}
          control={control}
          workflowKey="feeDetailsReceivedDatas"
          colSize={4} // or whatever you prefer
        />
      </div>

      {/* ------------------ BUTTONS ------------------ */}

      <div className="flex justify-end gap-3 mt-6">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveFeeDetailsMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveFeeDetailsMutation.isPending}
        />
      </div>
    </form>
  );
};

export default FeeDetailsForm;
