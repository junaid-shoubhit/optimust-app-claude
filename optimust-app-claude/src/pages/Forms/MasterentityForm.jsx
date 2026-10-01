import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import CustomToggle from "../../components/Forms/CustomToggle/CustomToggle";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";

import { apiRequest } from "../../services/apiBinding";

const MasterEntityForm = ({ setVisible, details, moduleId }) => {
  console.log("moduleId", moduleId);

  const queryClient = useQueryClient();
  const isEdit = !!details?.id;

  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(
    () => ({
      ...details,
      isPermission: details?.isPermission ?? true,
      userId: 0,
      firmId: 0,
      id: 0,
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
  const saveMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/Master",
        method,
        payload,
        apiClient: "optimust",
      }),

    onSuccess: (response) => {
      // 🔥 Handle API success false case
      if (response?.success === false) {
        toast.info(response?.message || "Operation failed");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["masterentity"],
      });

      toast.success(
        isEdit
          ? "Master Entity updated successfully"
          : "Master Entity created successfully",
      );

      reset();
      setVisible(false);
    },

    onError: (error) => {
      toast.error(error?.response?.message || "Failed to save Master Entity");
    },
  });

  /* ------------------ FORM FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "label",
        label: "Label",
        component: Input,
        rules: {
          required: "Label is required",
        },
        props: {
          isRequired: true,
        },
      },
      {
        name: "isPermission",
        label: "IsPermission",
        customRender: ({ field }) => (
          <div className="flex items-center gap-2 mt-1">
            <CustomToggle {...field} name="isPermission" />

            <span className="text-sm font-medium text-gray-700">
              IsPermission
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  /* ------------------ ACTIONS ------------------ */
  const handleClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset, setVisible]);

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (values) => {
    console.log("form values", values);

    const payload = isEdit
      ? {
          id: details?.id,
          label: values?.label,
          isPermission: values?.isPermission,
          // moduleId: moduleId,
        }
      : {
          ...values,
          // moduleId: moduleId,
          // tableName: "MasterEntity",
        };

    await saveMutation.mutateAsync({
      payload,
      method: isEdit ? "patch" : "post",
    });
  };

  /* ------------------ JSX ------------------ */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3">
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-1"
      />

      <div className="flex justify-end gap-3 my-5 mt-4">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveMutation.isPending ? "SAVING..." : isEdit ? "UPDATE" : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveMutation.isPending}
        />
      </div>
    </form>
  );
};

export default MasterEntityForm;
