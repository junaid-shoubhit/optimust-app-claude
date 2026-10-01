import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
// import Toggle from "../../../../components/Forms/Toggle/Toggle"; // ensure toggle component exists
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../services/apiBinding";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";
const EsignControlPanelForm = ({
  details,
  setVisible,
  setData,
  mode,
  moduleId,
}) => {
  const queryClient = useQueryClient();
  /* ------------------ HELPERS ------------------ */
  const transformValue = (value) => {
    if (value instanceof Date) return value.toISOString();

    if (Array.isArray(value)) return value.map((v) => transformValue(v));

    if (value && typeof value === "object") {
      if (value?.value !== undefined) return value.value;

      if (value?.id !== undefined && Object.keys(value).length === 1)
        return value.id;

      const obj = {};
      Object.keys(value).forEach((k) => {
        obj[k] = transformValue(value[k]);
      });
      return obj;
    }

    return value;
  };

  const getOption = (label, value) => (value ? { label, value } : null);
  const getId = (option) => option?.value ?? null;

  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(
    () => ({
      id: details?.id || null,
      sentToName: details?.sentToName || "",
      sentToEmail: details?.sentToEmail || "",
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

  /* ------------------ DROPDOWNS ------------------ */
  const tfaOptions = [
    { label: "Email", value: 1 },
    { label: "SMS", value: 2 },
  ];

  /* ------------------ MUTATION ------------------ */
  const saveUserMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/documentSigning",
        method,
        payload,
        apiClient: "dm",
      }),
  });

  /* ------------------ CLOSE ACTION ------------------ */
  const handleClose = useCallback(() => {
    reset();
    setData(null);
    setVisible(false);
  }, [reset, setVisible]);

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (values) => {
    // Build payload (simple because only name + isActive)
    const payload = {
      requestId: details?.id || null,
      moduleId: moduleId, // Assuming moduleId is passed as a prop
      email: values.sentToEmail,
      recipientName: values.sentToName,
      userId: null, // Assuming this is handled server-side or not needed
    };

    try {
      const response = await saveUserMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "patch",
      });

      toast.success(
        details?.id
          ? "Esign  Control Panel updated successfully"
          : "Esign  Control Panel created successfully",
      );

      setData(response?.data);

      // Update cache after editing
      if (mode === "edit") {
        queryClient.setQueryData(["usergroup-details", details.id], (old) => {
          if (!old) return old;
          return {
            ...old,
            ...payload,
          };
        });

        reset();
      }
      setVisible(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (mode === "edit"
            ? "Failed to update user group"
            : "Failed to create user group"),
      );
    }
  };
  /* ------------------ FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "sentToName",
        label: "Recipient Full Name",
        component: Input,
        rules: { required: "Recipient Full Name is required" },
        props: { isRequired: true, disabled: true },
      },
      {
        name: "sentToEmail",
        label: "Recipient Email",
        component: Input,
        rules: { required: "Recipient Email is required" },
        props: { isRequired: true, disabled: true },
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
        gridCols="grid-cols-2" // TWO columns layout
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
            saveUserMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "Resend"
                : "Resend"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveUserMutation.isPending}
        />
      </div>
    </form>
  );
};

export default EsignControlPanelForm;
