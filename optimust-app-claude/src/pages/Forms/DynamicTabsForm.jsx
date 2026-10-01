import { useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import SelectField from "../../components/Forms/Select/Select";
import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import CustomToggle from "../../components/Forms/CustomToggle/CustomToggle";
import { apiRequest } from "../../services/apiBinding";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";
import { getId } from "../../utils/constants/formConstants";
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const DynamicTabsForm = ({ setVisible, details, moduleId, queryKey }) => {
  const queryClient = useQueryClient();
  const isEdit = !!details?.id;

  /* ------------------ DEFAULT VALUES ------------------ */

  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,
      isActive: data?.isActive ?? true,
      moduleId: moduleId,
      tableName: "DynamicTabs",

      // 🔥 FIX SELECT VALUES
      EntityCodeId:
        data.entityCodeId || data.entityCode
          ? {
              value: data.entityCodeId,
              label: data.entityCode || "",
            }
          : null,

      TabTypeId:
        data.tabTypeId || data.tabType
          ? {
              value: data.tabTypeId,
              label: data.tabType || "",
            }
          : null,

      WorkflowTypeId:
        data.workflowTypeId || data.workflowType
          ? {
              value: data.workflowTypeId,
              label: data.workflowType || "",
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  /* ------------------ DROPDOWN PAYLOAD ------------------ */
  const selectedEntityCodeId = watch("EntityCodeId");

  const entityCodePayload = useMemo(() => createPayload("ctEntityCodes"), []);
  const TabtypePayload = useMemo(() => createPayload("dynTabType"), []);
  const workflowTypeIdPayload = useMemo(
    () => ({
      dataTable: "dynWorkflowType",
      dataField: "name",
      searchTerm: "",
      selectedValue: getId(selectedEntityCodeId),
    }),

    [selectedEntityCodeId],
  );

  console.log("details", details);

  useEffect(() => {
    if (!isEdit) {
      setValue("WorkflowTypeId", null);
    }
  }, [selectedEntityCodeId, setValue, isEdit]);

  /* ------------------ MUTATION ------------------ */
  const saveMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/codeTable",
        method,
        payload,
        apiClient: "optimust",
      }),

    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey,
      });

      toast.success(
        isEdit
          ? "Dynamic Tab updated successfully"
          : "Dynamic Tab created successfully",
      );

      reset();
      setVisible(false);
    },

    onError: (error) => {
      toast.error(error?.response?.message || "Failed to save Dynamic Tab");
    },
  });

  /* ------------------ FORM FIELDS ------------------ */
  const formFields = useMemo(() => {
    const fields = [
      {
        name: "name",
        label: "Name",
        component: Input,
        rules: { required: "Name is required" },
        props: { isRequired: true },
      },
    ];

    fields.push(
      {
        name: "EntityCodeId",
        label: "Entity Code",
        component: SelectField,
        rules: { required: "Entity Code is required" },
        props: {
          payload: entityCodePayload,
          isRequired: true,
          disabled: isEdit,
        },
      },
      {
        name: "TabTypeId",
        label: "Tab type",
        component: SelectField,
        rules: { required: "Tab type is required" },
        props: {
          payload: TabtypePayload,
          isRequired: true,
          isRelation: true,
          disabled: isEdit,
        },
      },
      {
        name: "WorkflowTypeId",
        label: "Workflow Type",
        component: SelectField,
        rules: { required: "Type Id is required" },
        props: {
          payload: workflowTypeIdPayload,
          isRequired: true,
          isRelation: true,
          disabled: isEdit || !selectedEntityCodeId,
        },
      },
    );

    fields.push({
      name: "isActive",
      label: "Active",
      customRender: ({ field }) => (
        <div className="flex items-center gap-2 mt-1">
          <CustomToggle {...field} name="isActive" />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </div>
      ),
    });

    return fields;
  }, [
    isEdit,
    entityCodePayload,
    TabtypePayload,
    workflowTypeIdPayload,
    selectedEntityCodeId,
  ]);
  /* ------------------ ACTIONS ------------------ */
  const handleClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset, setVisible]);

  const onSubmit = async (values) => {
    console.log("form values", values);

    const payload = {
      ...values,
      id: details?.id,
      tableName: "DynamicTabs",
      moduleId: moduleId,

      EntityCodeId: getId(values?.EntityCodeId),
      TabTypeId: getId(values?.TabTypeId),
      WorkflowTypeId: getId(values?.WorkflowTypeId),
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

export default DynamicTabsForm;
