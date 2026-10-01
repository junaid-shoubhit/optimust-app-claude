import { useMemo, useCallback, useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import SelectField from "../../components/Forms/Select/Select";
import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
// import Toggle from "../../../../components/Forms/Toggle/Toggle"; // ensure toggle component exists
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../services/apiBinding";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { createPayload } from "../../utils/constants/formConstants";

const EmailTemplatesForm = ({
  details,
  setVisible,
  setData,
  mode,
  moduleId,
}) => {
  const queryClient = useQueryClient();
  const [editorRef, setEditorRef] = useState(null);
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
      name: details?.name || "",
      subject: details?.subject || "",
      body: details?.body || "", // ✅ ADD THIS
      templateTags: null, // ✅ ADD THIS
      entitycodeid: getOption(details?.entityCode, details?.entityCodeId),
    }),
    [details],
  );

  /* ------------------ FORM ------------------ */
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const selectedEntityCode = useWatch({
    control,
    name: "entitycodeid",
  });
  const entityId = selectedEntityCode?.value ?? null;

  /* ------------------ DROPDOWNS ------------------ */
  const tfaOptions = [
    { label: "Email", value: 1 },
    { label: "SMS", value: 2 },
  ];

  /* ------------------ MUTATION ------------------ */
  const saveUserMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/emailTemplate",
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
      id: details?.id ? details.id : null,
      name: values.name,
      subject: values.subject,
      body: values.body, // ✅ IMPORTANT
      moduleId: moduleId,
      entityCodeId: getId(values.entitycodeid),
    };
    try {
      const response = await saveUserMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      toast.success(
        details?.id
          ? "Email Templates updated successfully"
          : "Email Templates created successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      setData(response?.data);

      // Update cache after editing
      if (mode === "edit") {
        queryClient.setQueryData(
          ["emailTemplates-details", details.id],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              ...payload,
            };
          },
        );

        reset();
      }
      setVisible(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (mode === "edit"
            ? "Failed to update Email Templates"
            : "Failed to create Email Templates"),
      );
    }
  };

  /* ------------------ DROPDOWN PAYLOAD ------------------ */
  const entityCodePayload = useMemo(
    () => createPayload("emailTempEntityCodes"),
    [],
  );

  const mergeCodeQuery = useQuery({
    queryKey: ["mergeCodeMaster", entityId],
    enabled: Boolean(entityId),
    queryFn: async () =>
      apiRequest({
        apiPath: "/Template/GetMargeCodeMaster",
        method: "get",
        apiClient: "optimust",
        payload: {
          EntityCodeId: entityId,
        },
      }),
  });

  const mergeCodeOptions = useMemo(() => {
    const rawOptions = Array.isArray(mergeCodeQuery?.data?.data)
      ? mergeCodeQuery?.data?.data
      : [];

    return rawOptions.map((item) => ({
      label: item?.name || "",
      value: item?.code || "",
      ...item,
    }));
  }, [mergeCodeQuery.data]);

  useEffect(() => {
    setValue("templateTags", null);
  }, [entityId, setValue]);

  /* ------------------ FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        component: Input,
        rules: { required: "Name is required" },
        props: { isRequired: true },
      },

      {
        name: "subject",
        label: "Subject",
        component: Input,
        rules: { required: "Subject is required" },
        props: { isRequired: true },
      },

      {
        name: "entitycodeid",
        label: "Entity Code",
        component: SelectField,
        props: {
          payload: entityCodePayload,
          isRequired: false,
        },
      },
    ],
    [],
  );

  const insertTag = (tag) => {
    if (!editorRef) return;

    editorRef.editing.view.focus(); // 👈 ensure cursor focus

    editorRef.model.change((writer) => {
      const position = editorRef.model.document.selection.getFirstPosition();

      writer.insertText(`${tag}`, position);
    });
  };
  /* ------------------ JSX ------------------ */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3">
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-2" // TWO columns layout
      />

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="relative z-50">
          <Controller
            name="templateTags"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                placeholder={
                  entityId ? "Insert Tag" : "Select Entity Code first"
                }
                defaultOptions={mergeCodeOptions}
                disabled={
                  !entityId || !mergeCodeOptions?.length > 0 ? true : false
                }
                isCustomLoading={mergeCodeQuery.isLoading}
                onChange={(option) => {
                  if (option?.value) {
                    insertTag(option.code);
                    field.onChange(null);
                  }
                }}
                isClearable={false}
                noErrorMessage
                shouldUseAPI={false}
              />
            )}
          />
        </div>
      </div>
      <div className="mt-2">
        <div className="mt-2 max-h-[300px] overflow-hidden">
          <Controller
            name="body"
            control={control}
            rules={{ required: "Body is required" }}
            render={({ field }) => (
              <div className="mt-2">
                <CKEditor
                  editor={ClassicEditor}
                  data={field.value}
                  onReady={(editor) => {
                    setEditorRef(editor);

                    editor.editing.view.change((writer) => {
                      writer.setStyle(
                        "height",
                        "250px", // 👈 fixed height
                        editor.editing.view.document.getRoot(),
                      );

                      writer.setStyle(
                        "overflow-y",
                        "auto", // 👈 scroll inside editor
                        editor.editing.view.document.getRoot(),
                      );
                    });
                  }}
                  onChange={(event, editor) => {
                    field.onChange(editor.getData());
                  }}
                />

                {errors?.body && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.body.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>
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

export default EmailTemplatesForm;
