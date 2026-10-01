import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../../services/apiBinding";

import Input from "../../../../../../../components/Forms/Input/Input";
import SelectField from "../../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../../../../components/Forms/DynamicForm/UserDynamicForm";
import CustomToggle from "../../../../../../../components/Forms/CustomToggle/CustomToggle";
import CustomDate from "../../../../../../../components/Forms/Date/Date";
import { getId } from "../../../../../../../utils/constants/formConstants";

/* ------------------ CREATE STATIC PAYLOAD ------------------ */
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const TimeEntriesForm = ({
  details,
  setVisible,
  setData,
  caseId,
  mode,
  onSuccess,
}) => {
  console.log("TimeEntriesForm details", details);

  const queryClient = useQueryClient();

  /* ------------------ DROPDOWN PAYLOADS ------------------ */
  const tasksPayload = useMemo(() => createPayload("ctTaskCommentList"), []);

  const billingUsersPayload = useMemo(
    () => createPayload("usrUsers", "first_name + ' ' + last_name"),
    [],
  );

  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,

      startTime: data.startTime ? new Date(data.startTime) : "",

      endTime: data.endTime ? new Date(data.endTime) : "",

      taskId: data.taskId
        ? {
            value: data.taskId,
            label: data.taskName || "",
          }
        : null,

      billingUserId: data.userId
        ? {
            value: data.userId,
            label: data.userName || "",
          }
        : null,

      isBillable: data.isBillable ?? false,
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

  /* ------------------ MUTATION ------------------ */
  const saveTimeEntryMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/TimeEntry/manual",
        method,
        payload,
      }),

    onSuccess: (response) => {
      const timeEntry = response.data;

      queryClient.setQueriesData({ queryKey: ["timeEntries"] }, (old) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.some((item) => item.id === timeEntry.id)
            ? old.data.map((item) =>
                item.id === timeEntry.id ? timeEntry : item,
              )
            : [timeEntry, ...old.data],
        };
      });

      queryClient.setQueryData(["time-entry-details", timeEntry.id], timeEntry);

      onSuccess?.();
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
      id: details?.id || null,

      taskId: getId(values.taskId),
      billingUserId: getId(values.billingUserId),

      description: values.description || "",

      startTime: values.startTime,
      endTime: values.endTime,

      isBillable: values.isBillable ?? false,
    };

    try {
      await saveTimeEntryMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      toast.success(
        details?.id
          ? "Time Entry updated successfully"
          : "Time Entry created successfully",
      );

      setVisible(false);

      reset();
    } catch (error) {
      console.error("Error saving time entry:", error);

      toast.error(
        error?.response?.data?.message ||
          (details?.id
            ? "Failed to update time entry"
            : "Failed to create time entry"),
      );
    }
  };

  /* ------------------ FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "taskId",
        label: "Task",
        component: SelectField,
        props: {
          payload: { ...tasksPayload, entityId: caseId },
          isRequired: true,
          isRelation: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "billingUserId",
        label: "Billing User",
        component: SelectField,
        props: {
          payload: billingUsersPayload,
          // isRequired: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "description",
        label: "Description",
        component: Input,
        props: {
          type: "textarea",
          isRequired: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "startTime",
        label: "Start Time",
        component: CustomDate,
        props: {
          type: "datetime-local",
          isRequired: true,
          showTime: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "endTime",
        label: "End Time",
        component: CustomDate,
        props: {
          type: "datetime-local",
          isRequired: true,
          showTime: true,
        },
        rules: {
          required: "Required",
        },
      },

      {
        name: "isBillable",
        label: "Is Billable",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Is Billable
            </label>

            <CustomToggle {...field} checked={field.value} />
          </div>
        ),
      },
    ],
    [tasksPayload, billingUsersPayload],
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
          className="cancelBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveTimeEntryMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveTimeEntryMutation.isPending}
        />
      </div>
    </form>
  );
};

export default TimeEntriesForm;
