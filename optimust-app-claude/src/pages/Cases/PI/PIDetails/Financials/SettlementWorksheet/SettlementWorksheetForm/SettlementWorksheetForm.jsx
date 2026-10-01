import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../../services/apiBinding";

import Input from "../../../../../../../components/Forms/Input/Input";
import SelectField from "../../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../../../../components/Forms/DynamicForm/UserDynamicForm";
import CustomDate from "../../../../../../../components/Forms/Date/Date";

import { getId } from "../../../../../../../utils/constants/formConstants";

/* ------------------ PAYLOAD HELPER ------------------ */
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

/* ------------------ STATIC YES/NO ------------------ */
const yesNoOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

const SettlementWorksheetForm = ({
  details,
  setVisible,
  setData,
  caseId,
  mode,
  moduleId,
}) => {
  /* ------------------ DROPDOWN PAYLOADS ------------------ */
  const plaintiffPayload = useMemo(
    () => createPayload("CasePlaintiffParties"),
    [],
  );
  const settledByPayload = useMemo(() => createPayload("SettledByParties"), []);
  const handledByPayload = useMemo(() => createPayload("HandledByParties"), []);
  const settlementTypePayload = useMemo(
    () => createPayload("ctSSBWVGSettlementTypes"),
    [],
  );
  const settlementSettledPayload = useMemo(
    () => createPayload("ctSSBWVGSettlements"),
    [],
  );
  const releasePayload = useMemo(() => createPayload("ctSSBWVGReleases"), []);
  const booleanOptionsPayload = useMemo(
    () => createPayload("ctBoolOptions"),
    [],
  );
  const queryClient = useQueryClient();
  console.log("caseid in form", caseId);
  console.log("moduleid in form", moduleId);
  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(() => {
    const d = details || {};
    console.log("details", details);
    return {
      ...d,
      settlementDate: d.settlementDate ? new Date(d.settlementDate) : null,
      plaintiff: d.plaintiff
        ? { value: d.plaintiff, label: d.plaintiffName }
        : null,

      settlementType: d.settlementType
        ? { value: d.settlementType, label: d.settlementTypeName }
        : null,

      settlementSettledId: d.settlementSettledId
        ? { value: d.settlementSettledId, label: d.settlementSettled }
        : null,

      releaseId: d.releaseId ? { value: d.releaseId, label: d.release } : null,

      settledBy: d.settledById
        ? { value: d.settledById, label: d.settledByNames }
        : null,

      handledBy: d.handledById
        ? { value: d.handledById, label: d.handledByNames }
        : null,

      /* booleans → dropdown */
      isThereSignedLienInTheFile: yesNoOptions.find(
        (o) => o.value === d.isThereSignedLienInTheFile,
      ),

      settlementAccepted: yesNoOptions.find(
        (o) => o.value === d.settlementAccepted,
      ),

      hasClientEverReceivedMedicaid: yesNoOptions.find(
        (o) => o.value === d.hasClientEverReceivedMedicaid,
      ),

      hasClientEverReceivedOrEligibleForMedicare: yesNoOptions.find(
        (o) => o.value === d.hasClientEverReceivedOrEligibleForMedicare,
      ),

      isThereASumUmClaim: yesNoOptions.find(
        (o) => o.value === d.isThereASumUmClaim,
      ),

      isWC: yesNoOptions.find((o) => o.value === d.isWC),
    };
  }, [details]);

  /* ------------------ FORM ------------------ */
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  /* ------------------ MUTATION ------------------ */
  const saveMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/settlementWorksheet",
        method,
        payload,
      }),

    onSuccess: (response) => {
      console.log("Settlement Worksheet saved response", response);
      const settlementworksheets = response?.data;

      if (!settlementworksheets) return;

      const settlementworksheetId = settlementworksheets.id;

      queryClient.setQueryData(
        ["settlementworksheet-details", settlementworksheetId],
        response,
      );

      queryClient.setQueriesData(
        { queryKey: ["settlementworksheets"] },
        (old) => {
          if (!old) return old;

          const exists = old.settlementWorksheets?.some(
            (item) => item.id === settlementworksheetId,
          );

          if (exists) {
            return {
              ...old,
              settlementWorksheets: old.settlementWorksheets.map((item) =>
                item.id === settlementworksheetId ? settlementworksheets : item,
              ),
            };
          }

          return {
            ...old,
            settlementWorksheets: [
              settlementworksheets,
              ...(old.settlementWorksheets || []),
            ],
            dataSize: (old.dataSize || 0) + 1,
          };
        },
      );
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
      id: details?.id || -1,

      plaintiff: getId(values.plaintiff),
      settledByIds: getId(values.settledBy) || "",
      handledByIds: getId(values.handledBy) || "",

      settlementType: getId(values.settlementType),
      settlementSettledId: getId(values.settlementSettledId),
      releaseId: getId(values.releaseId),

      settlementAmount: Number(values.settlementAmount),
      lienAmount: values.lienAmount ? Number(values.lienAmount) : null,

      settlementDate: values.settlementDate,

      comments: values.comments,
      specialInstructions: values.specialInstructions,

      isThereSignedLienInTheFile: values.isThereSignedLienInTheFile?.value,

      settlementAccepted: values.settlementAccepted?.value,

      hasClientEverReceivedMedicaid:
        values.hasClientEverReceivedMedicaid?.value,

      hasClientEverReceivedOrEligibleForMedicare:
        values.hasClientEverReceivedOrEligibleForMedicare?.value,

      isThereASumUmClaim: values.isThereASumUmClaim?.value,
      isWC: values.isWC?.value,

      caseId,
      moduleId: moduleId,
    };

    try {
      await saveMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      toast.success(details?.id ? "Settlement updated" : "Settlement created");

      handleClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  /* ------------------ FIELDS ------------------ */
  console.log("caseid", caseId);
  const formFields = useMemo(
    () => [
      {
        name: "settlementDate",
        label: "Settlement Date",
        component: CustomDate,
        props: { isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "settlementSettledId",
        label: "Fully / Partially",
        component: SelectField,
        props: { payload: settlementSettledPayload, isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "releaseId",
        label: "Release",
        component: SelectField,
        props: { payload: releasePayload },
      },
      {
        name: "plaintiff",
        label: "Plaintiff",
        component: SelectField,
        props: {
          payload: { ...plaintiffPayload, entityId: caseId ? caseId : null },
          isRelation: true,
          isRequired: true,
        },
        rules: { required: "Required" },
      },
      {
        name: "settledBy",
        label: "Settled By",
        component: SelectField,
        props: {
          payload: { ...settledByPayload, entityId: caseId ? caseId : null },
          isRelation: true,
        },
      },
      {
        name: "handledBy",
        label: "Handled By",
        component: SelectField,
        props: {
          payload: { ...handledByPayload, entityId: caseId ? caseId : null },
          isRelation: true,
        },
      },
      {
        name: "settlementType",
        label: "Settlement Type",
        component: SelectField,
        props: { payload: settlementTypePayload, isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "settlementAmount",
        label: "Settlement Amount",
        component: Input,
        props: { type: "number", isRequired: true },
        rules: { required: "Required" },
      },
      {
        name: "lienAmount",
        label: "Lien Amount",
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
        name: "specialInstructions",
        label: "Special Instructions",
        component: Input,
        props: { type: "textarea" },
      },

      /* -------- YES / NO DROPDOWNS -------- */

      {
        name: "isThereSignedLienInTheFile",
        label: "Signed Lien In File",
        component: SelectField,
        props: { payload: booleanOptionsPayload },
      },
      {
        name: "isThereASumUmClaim",
        label: "Sum / Um",
        component: SelectField,
        props: { payload: booleanOptionsPayload },
      },
      {
        name: "isWC",
        label: "WC",
        component: SelectField,
        props: { payload: booleanOptionsPayload },
      },
      {
        name: "hasClientEverReceivedMedicaid",
        label: "Medicaid",
        component: SelectField,
        props: { payload: booleanOptionsPayload },
      },
      {
        name: "hasClientEverReceivedOrEligibleForMedicare",
        label: "Medicare",
        component: SelectField,
        props: { payload: booleanOptionsPayload },
      },
      {
        name: "settlementAccepted",
        label: "Settlement Accepted",
        component: SelectField,
        props: { payload: booleanOptionsPayload },
      },
    ],
    [
      plaintiffPayload,
      settledByPayload,
      handledByPayload,
      settlementTypePayload,
      settlementSettledPayload,
      releasePayload,
    ],
  );

  return (
    <form className="px-3" onSubmit={handleSubmit(onSubmit)}>
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
            saveMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveMutation.isPending}
        />
      </div>
    </form>
  );
};

export default SettlementWorksheetForm;
