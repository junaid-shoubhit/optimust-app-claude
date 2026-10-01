import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import SelectField from "../../components/Forms/Select/Select";
import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import CustomToggle from "../../components/Forms/CustomToggle/CustomToggle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../services/apiBinding";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";
import { getId } from "../../utils/constants/formConstants";
/* ------------------ CREATE STATIC PAYLOAD ------------------ */
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const ModuleForm = ({
  details,
  setVisible,
  setData,
  mode,
  moduleId,
  queryKey,
}) => {
  const queryClient = useQueryClient();
  /* ------------------ SAVE MODULE ------------------ */
  const saveModuleMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/Module",
        method,
        payload,
        apiClient: "optimust",
      }),

    onSuccess: async (response) => {
      const moduleData = response?.data;
      console.log("moduleData", moduleData);
      await queryClient.refetchQueries({
        queryKey,
      });
      if (!moduleData) return;
      toast.success(
        details?.data?.id
          ? "Module updated successfully"
          : "Module created successfully",
      );

      handleClose();
    },
  });

  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,
      isDataMenu: data.isDataMenu ?? false,

      // 🔥 FIX FOR SELECT
      parentId: data.parentId
        ? {
            value: data.parentId,
            label: data.parentName || "",
          }
        : null,
    };
  }, [details]);
  /* ------------------ FORM CONTROL ------------------ */
  const {
    handleSubmit,
    control,
    reset,
    // watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  /* ------------------ DROPDOWN PAYLOAD ------------------ */
  const parentPayload = useMemo(() => createPayload("mdlModules"), []);

  /* ------------------ FORM FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        component: Input,
        props: { isRequired: true },
        rules: { required: "Name is required" },
      },
      {
        name: "relativePath",
        label: "Relative Path",
        component: Input,
        props: { isRequired: true },
        rules: { required: "Relative Path is required" },
      },

      {
        name: "orderByExpression",
        label: "Order By Expression",
        component: Input,
        props: { type: "number", isRequired: true },
        rules: { required: "Order field is required" },
      },

      {
        name: "parentId",
        label: "Parent",
        component: SelectField,
        props: {
          payload: parentPayload,
          isRequired: false,
        },
      },
      {
        name: "menuIcon",
        label: "Menu Icon",
        component: Input,
      },
      {
        name: "isDataMenu",
        label: "Is Data Menu",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Is Data Menu
            </label>
            <CustomToggle {...field} checked={field.value} />
          </div>
        ),
      },

      {
        name: "instructions",
        label: "Instructions",
        component: Input,
        props: { type: "textarea" },
      },
    ],
    [parentPayload],
  );

  /* ------------------ CLOSE ------------------ */
  const handleClose = () => {
    reset();
    setData(null);
    setVisible(false);
    console.log("handleclose");
  };

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (values) => {
    const payload = {
      ...values,
      userId: 0,
      moduleId: moduleId,
      parentId: getId(values.parentId) || null,
      orderByExpression: Number(values.orderByExpression),
    };

    try {
      await saveModuleMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (mode === "edit"
            ? "Failed to update module"
            : "Failed to create module"),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-3">
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
            saveModuleMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveModuleMutation.isPending}
        />
      </div>
    </form>
  );
};

export default ModuleForm;
