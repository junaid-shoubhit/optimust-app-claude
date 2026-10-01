import { useMemo, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../services/apiBinding";

import Input from "../../../../../../components/Forms/Input/Input";
import SelectField from "../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../../../components/Forms/DynamicForm/UserDynamicForm";
import CustomDate from "../../../../../../components/Forms/Date/Date";

import { getId } from "../../../../../../utils/constants/formConstants";

/* ------------------ CREATE STATIC PAYLOAD ------------------ */
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const DepositDetailsForm = ({
  details,
  setVisible,
  setData,
  caseId,
  moduleId,
  mode,
}) => {
  /* ------------------ DROPDOWN PAYLOADS ------------------ */
  const queryClient = useQueryClient();
  // Deposit Type
  const depositTypePayload = useMemo(
    () => createPayload("ctSSBWVGDepositTypes"),
    [],
  );

  // Settlement Award
  const settlementAwardPayload = useMemo(
    () => ({
      dataTable: "SettlementAwards",
      dataField: "settlementAward",
      searchTerm: "",
      entityId: caseId || null,
    }),
    [caseId],
  );

  // IOLA Account
  const iolaAccountPayload = useMemo(
    () => ({
      ...createPayload("IolaAccounts_SAGView_CaseRelated"),
      entityId: caseId || null,
    }),
    [caseId],
  );

  const bankAccountPayload = useMemo(
    () => ({
      ...createPayload("BankAccounts_SAGView_CaseRelated"),
      entityId: caseId || null,
    }),
    [caseId],
  );

  // Plaintiff
  const plaintiffPayload = useMemo(
    () => ({
      ...createPayload("CasePlaintiffParties"),
      entityId: caseId || null,
    }),
    [caseId],
  );

  // Check Type
  const checkTypePayload = useMemo(
    () => createPayload("ctSSBWVGCheckTypes"),
    [],
  );

  /* ------------------ DEFAULT VALUES ------------------ */

  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,

      depositTypeId: data.depositTypeId
        ? {
            value: data.depositTypeId,
            label: data.depositType,
          }
        : null,

      depositDate: data.depositDate ? new Date(data.depositDate) : null,
      dateOfCheck: data.dateOfCheck ? new Date(data.dateOfCheck) : null,
      bankAccountId: data?.bankAccountId
        ? {
            value: data.bankAccountId,
            label: data.bankAccount,
          }
        : null,
      settlementAwardId: data.settlementAwardId
        ? {
            value: data.settlementAwardId,
            label: data.settlementAward,
          }
        : null,

      iolaAccountId: data.iolaAccountId
        ? {
            value: data.iolaAccountId,
            label: data.iolaAccount,
          }
        : null,

      plaintiffId: data.plaintiffId
        ? {
            value: data.plaintiffId,
            label: data.plaintiff,
          }
        : null,

      checkTypeId: data.checkTypeId
        ? {
            value: data.checkTypeId,
            label: data.checkType,
          }
        : null,
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

  /* ------------------ WATCH DEPOSIT TYPE ------------------ */

  const selectedDepositType = useWatch({
    control,
    name: "depositTypeId",
  });

  const depositTypeLabel = selectedDepositType?.label;

  /* ------------------ MUTATION ------------------ */

  const saveDepositMutation = useMutation({
    mutationFn: ({ payload, method, apiPath }) =>
      apiRequest({
        apiPath,
        method,
        payload,
      }),

    onSuccess: (response) => {
      console.log("deposit saved response", response);

      /* ---------- HANDLE API FAILURE RESPONSE ---------- */
      if (response?.success === false) {
        toast.info(response?.message);
        return;
      }

      const deposit = response?.data;

      if (!deposit) {
        toast.info(response?.message);
        return;
      }
      const depositId = deposit.id;

      queryClient.setQueryData(["deposits", depositId], response);

      console.log("Depositeid", depositId);

      queryClient.setQueriesData({ queryKey: ["deposits"] }, (old) => {
        console.log("Old deposits data:", old);

        if (!old) return old;

        const exists = old?.deposits?.some((item) => item.id === depositId);

        if (exists) {
          // EDIT
          return {
            ...old,
            deposits: old.deposits.map((item) =>
              item.id === depositId ? deposit : item,
            ),
          };
        }

        // CREATE
        return {
          ...old,
          deposits: [deposit, ...(old?.deposits || [])],
          dataSize: (old?.dataSize || 0) + 1,
        };
      });

      toast.success("Deposit saved successfully");
      setVisible(false);
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
    const payload = {
      userId: 0,
      firmId: 0,

      moduleId: moduleId,

      caseId,

      settlementAwardId: getId(values.settlementAwardId),

      depositDate: values.depositDate || "",

      depositAmount: Number(values.depositAmount) || 0,

      iolaAccountId: getId(values.iolaAccountId) || null,

      bankAccountId: getId(values.bankAccountId) || null,

      checkWireNo: values.checkWireNo || "",

      plaintiffId: getId(values.plaintiffId),

      dateOfCheck: values.dateOfCheck || "",

      checkTypeId: getId(values.checkTypeId),

      feeReceivedFromId: null,

      depositTypeId: getId(values.depositTypeId),

      clearDate: values.clearDate || "",
      depositId: details?.id || 0,
    };

    try {
      await saveDepositMutation.mutateAsync({
        payload,
        method: "post",
        apiPath: details?.id ? "/deposits/update" : "/deposits/create",
      });

      // setVisible(false);
      // reset();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (details?.id
            ? "Failed to update deposit"
            : "Failed to create deposit"),
      );
    }
  };

  /* ------------------ COMMON FIELD ------------------ */

  const depositTypeField = {
    name: "depositTypeId",
    label: "Deposit Type",
    component: SelectField,
    props: {
      payload: depositTypePayload,
      isRequired: true,
    },
    rules: { required: "Required" },
  };

  /* ------------------ CONDITIONAL FIELDS ------------------ */

  const conditionalFields = useMemo(() => {
    if (!depositTypeLabel) return [];

    // TYPE 1
    if (depositTypeLabel === "IOLA Deposit") {
      return [
        {
          name: "settlementAwardId",
          label: "Settlement Award",
          component: SelectField,
          props: {
            payload: settlementAwardPayload,
            isRequired: true,
            isRelation: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "depositAmount",
          label: "Deposit Amount",
          component: Input,
          props: {
            type: "number",
            isRequired: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "depositDate",
          label: "Deposit Date",
          component: CustomDate,
          props: {
            type: "date",
            isRequired: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "iolaAccountId",
          label: "IOLA Account",
          component: SelectField,
          props: {
            payload: iolaAccountPayload,
            isRequired: true,
          },
          rules: { required: "Required" },
        },

        {
          name: "bankAccountId",
          label: "Bank Account",
          component: SelectField,
          props: {
            payload: bankAccountPayload,
            isRequired: true,
          },
          rules: { required: "Required" },
        },

        {
          name: "checkWireNo",
          label: "Check / Wire No",
          component: Input,
        },
      ];
    }

    // TYPE 2
    if (depositTypeLabel === "Operating Deposit") {
      return [
        {
          name: "depositAmount",
          label: "Deposit Amount",
          component: Input,
          props: {
            type: "number",
            isRequired: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "plaintiffId",
          label: "Plaintiff",
          component: SelectField,
          props: {
            payload: plaintiffPayload,
            isRequired: true,
            isRelation: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "depositDate",
          label: "Deposit Date",
          component: CustomDate,
          props: {
            type: "date",
            isRequired: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "dateOfCheck",
          label: "Date Of Check",
          component: CustomDate,
          props: {
            type: "date",
          },
        },
        {
          name: "checkWireNo",
          label: "Check / Wire No",
          component: Input,
        },
        {
          name: "checkTypeId",
          label: "Check Type",
          component: SelectField,
          props: {
            payload: checkTypePayload,
            isRequired: true,
          },
          rules: { required: "Required" },
        },
      ];
    }

    // TYPE 3
    if (depositTypeLabel === "Lien Deposit") {
      return [
        {
          name: "settlementAwardId",
          label: "Settlement Award",
          component: SelectField,
          props: {
            payload: settlementAwardPayload,
            isRequired: true,
            isRelation: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "depositAmount",
          label: "Deposit Amount",
          component: Input,
          props: {
            type: "number",
            isRequired: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "depositDate",
          label: "Deposit Date",
          component: CustomDate,
          props: {
            type: "date",
            isRequired: true,
          },
          rules: { required: "Required" },
        },
        {
          name: "checkWireNo",
          label: "Check / Wire No",
          component: Input,
        },
      ];
    }

    return [];
  }, [
    depositTypeLabel,
    settlementAwardPayload,
    iolaAccountPayload,
    plaintiffPayload,
    checkTypePayload,
  ]);

  /* ------------------ FINAL FORM FIELDS ------------------ */

  const formFields = useMemo(
    () => [depositTypeField, ...conditionalFields],
    [conditionalFields],
  );

  return (
    <form className="px-3 py-2" onSubmit={handleSubmit(onSubmit)}>
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-3"
      />

      <div className="flex justify-end gap-3 mt-6">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveDepositMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveDepositMutation.isPending}
        />
      </div>
    </form>
  );
};

export default DepositDetailsForm;
