import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
// import Toggle from "../../../../components/Forms/Toggle/Toggle"; // ensure toggle component exists
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../services/apiBinding";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";
const UsersForm = ({
  details,
  setVisible,
  setData,
  mode,
  moduleId,
  queryKey,
}) => {
  console.log("queryKey", queryKey);
  const queryClient = useQueryClient();
  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(
    () => ({
      id: details?.id || null,
      name: details?.name || "",
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
        apiPath: "/userGroup",
        method,
        payload,
        apiClient: "optimust",
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
      id: details?.id || null,
      name: values.name,
      moduleId: moduleId,
    };

    try {
      const response = await saveUserMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      toast.success(
        details?.id
          ? "User Group updated successfully"
          : "User Group created successfully",
      );

      setData(response?.data);

      // Update cache after editing
      if (mode === "edit") {
        reset();
      }

      await queryClient.refetchQueries({
        queryKey,
      });
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
        name: "name",
        label: "Group Name",
        component: Input,
        rules: { required: "Group name is required" },
        props: { isRequired: true },
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
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveUserMutation.isPending}
        />
      </div>
    </form>
  );
};

export default UsersForm;
