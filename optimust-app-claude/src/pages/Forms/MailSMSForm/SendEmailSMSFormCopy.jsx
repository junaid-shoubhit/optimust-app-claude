import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useForm, useWatch, Controller } from "react-hook-form";

import { useMutation } from "@tanstack/react-query";

import { FiMail, FiMessageSquare } from "react-icons/fi";
import classNames from "classnames";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import DynamicFormFields from "../../../components/Forms/DynamicForm/UserDynamicForm";
import Input from "../../../components/Forms/Input/Input";
import SelectField from "../../../components/Forms/Select/Select";
import CustomToggle from "../../../components/Forms/CustomToggle/CustomToggle";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";

import { apiRequest } from "../../../services/apiBinding";
import { createPayload } from "../../../utils/constants/formConstants";
import SearchDropdown from "../../../components/SearchDropdown/SearchDropdown";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext";
import { toast } from "react-toastify";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const ESIGN_URL_MERGE_TAG = "{url}";

const DEFAULT_VALUES = {
  type: "mail",

  template: null,

  subject: "",
  body: "",

  to: [],
  cc: [],
  bcc: [],

  file: null,

  esign: false,

  caseId: null,
  saveToCase: false,
  caseFolderId: null,
  documentId: null,
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const getId = (option) => option?.value || null;

const getEntityId = (option) => option?.entityId || null;

const getEmails = (items = []) =>
  Array.isArray(items)
    ? items
        .map((item) => item?.label)
        .filter(Boolean)
        .join(",")
    : "";

const getRecipientNames = (items = []) =>
  Array.isArray(items)
    ? items
        .map((item) => item?.address)
        .filter(Boolean)
        .join(",")
    : "";

const getTagTypeNumber = (type) => {
  switch (type) {
    case "signature":
      return 1;

    case "date":
      return 2;

    case "initials":
      return 3;

    default:
      return 1;
  }
};

/* -------------------------------------------------------------------------- */
/*                              EDITOR LOADER                                 */
/* -------------------------------------------------------------------------- */

const EditorLoader = React.memo(() => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />

      <p className="text-sm text-gray-600">Replacing tags...</p>
    </div>
  </div>
));

/* -------------------------------------------------------------------------- */
/*                            SEARCH DROPDOWN                                 */
/* -------------------------------------------------------------------------- */

const EmailSearchDropdown = React.memo(
  ({ name, control, label, queryKey, required = false, onChange, error }) => {
    return (
      <Controller
        name={name}
        control={control}
        rules={
          required
            ? {
                required: "Recipient email is required",

                validate: (value) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) {
                    return "Recipient email is required";
                  }

                  return true;
                },
              }
            : undefined
        }
        render={({ field, fieldState }) => (
          <div>
            <SearchDropdown
              isMulti
              iconName="pi pi-envelope"
              queryKey={queryKey}
              apiPath="/utility/relation/option"
              responseKey="optionModelDT"
              idKey="value"
              labelKey="label"
              secondLabelKey="address"
              placeholder="Search email"
              label={label}
              payloadBuilder={(search) => ({
                page: 1,
                pageSize: 50,
                dataTable: "Users_Emails",
                dataField: "name",
                searchTerm: search,
              })}
              value={field.value || []}
              onSelect={(items) => {
                field.onChange(items);
                onChange?.(items);
              }}
            />

            {(fieldState.error || error) && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {fieldState.error?.message || error}
              </p>
            )}
          </div>
        )}
      />
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                         SEND EMAIL SMS FORM                                */
/* -------------------------------------------------------------------------- */

const SendEmailSMSForm = forwardRef(function SendEmailSMSForm(
  {
    id: entityId,
    hideSubmit = false,
    onValuesChange,
    details,
    esignFiles = [],
    coordinates = [],
    esignNodeId = null,
    setVisible,
    resetPdfEsign,
  },
  ref,
) {
  /* ------------------------------------------------------------------------ */
  /*                                STATE                                     */
  /* ------------------------------------------------------------------------ */

  const [activeType, setActiveType] = useState("mail");

  const editorRef = useRef(null);

  const { activeMenu } = useCustomNavigation();

  const email = useMemo(() => localStorage.getItem("email"), []);

  /* ------------------------------------------------------------------------ */
  /*                              FORM                                        */
  /* ------------------------------------------------------------------------ */

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...DEFAULT_VALUES,
      ...details,
    },
  });

  /* ------------------------------------------------------------------------ */
  /*                              WATCHERS                                     */
  /* ------------------------------------------------------------------------ */

  const selectedTemplate = useWatch({
    control,
    name: "template",
  });

  const watchedValues = useWatch({
    control,
    name: [
      "body",
      "subject",
      "to",
      "cc",
      "bcc",
      "file",
      "esign",
      "caseId",
      "saveToCase",
      "caseFolderId",
      "documentId",
    ],
  });

  const [
    watchedBody,
    watchedSubject,
    watchedTo,
    watchedCc,
    watchedBcc,
    watchedFile,
    watchedEsign,
    watchedCaseId,
    watchedSaveToCase,
    watchedCaseFolderId,
    watchedDocumentId,
  ] = watchedValues;

  /* ------------------------------------------------------------------------ */
  /*                         DERIVED VALUES                                    */
  /* ------------------------------------------------------------------------ */

  const templateId = selectedTemplate?.value || null;

  const isMail = activeType === "mail";

  const isSms = activeType === "sms";

  const isBulkMessaging = activeMenu?.path === "/bulk-messaging";

  const isEsignDisabled = Boolean(details?.esign);

  const shouldShowSaveToCase =
    isMail &&
    !isBulkMessaging &&
    details?.caseId?.length === undefined &&
    details?.saveToCase;

  /* ------------------------------------------------------------------------ */
  /*                           FORM CHANGE                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    onValuesChange?.({
      ...getValues(),
      type: activeType,
    });
  }, [
    activeType,
    watchedBody,
    watchedSubject,
    watchedTo,
    watchedCc,
    watchedBcc,
    watchedFile,
    watchedEsign,
    watchedCaseId,
    watchedSaveToCase,
    watchedCaseFolderId,
    watchedDocumentId,
    getValues,
    onValuesChange,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                         EDITOR INSERT                                     */
  /* ------------------------------------------------------------------------ */

  const insertTextIntoEditor = useCallback(
    (text) => {
      if (!editorRef.current || !text) {
        return;
      }

      const editor = editorRef.current;

      try {
        editor.execute("insertText", {
          text,
        });
      } catch (error) {
        const currentValue = editor.getData() || "";
        console.log("error", error);
        editor.setData(`${currentValue}${text}`);
      }

      const nextValue = editor.getData() || "";

      setValue("body", nextValue, {
        shouldDirty: true,
      });
    },
    [setValue],
  );

  useImperativeHandle(
    ref,
    () => ({
      insertText: insertTextIntoEditor,
    }),
    [insertTextIntoEditor],
  );

  /* ------------------------------------------------------------------------ */
  /*                              PAYLOADS                                     */
  /* ------------------------------------------------------------------------ */

  const casePayload = useMemo(() => createPayload("ctCaseNo"), []);

  const caseFolderPayload = useMemo(
    () => createPayload("dmDefaultCaseFolders"),
    [],
  );

  const documentPayload = useMemo(() => createPayload("dmDocuments"), []);

  const templatePayload = useMemo(
    () => ({
      dataTable: "ctEmailTemplates",
      dataField: "name",
    }),
    [],
  );

  const mobilePayload = useMemo(
    () => ({
      dataTable: "PlaintiffMobiles",
      dataField: "name",
    }),
    [],
  );

  /* ------------------------------------------------------------------------ */
  /*                         REPLACE TAGS API                                  */
  /* ------------------------------------------------------------------------ */

  const replaceTagsMutation = useMutation({
    mutationFn: async ({
      templateId: selectedTemplateId,
      entityId: selectedEntityId,
      body,
    }) => {
      return apiRequest({
        apiPath: "emailTemplate/replaceTags",
        method: "post",
        payload: {
          templateId: selectedTemplateId,
          entityId: selectedEntityId,
          entityCodeId: details?.entityCodeId,
          body,
        },
      });
    },

    onSuccess: (response) => {
      const data = response?.data || response;

      if (!data) {
        return;
      }

      setValue("body", data?.body || "", {
        shouldDirty: true,
      });
    },

    onError: (error) => {
      console.error("Replace Tags API Error =>", error);
    },
  });

  /* ------------------------------------------------------------------------ */
  /*                         TEMPLATE EFFECT                                  */
  /* ------------------------------------------------------------------------ */

  const templateSubject = selectedTemplate?.address || "";

  const templateBody = selectedTemplate?.info || "";

  useEffect(() => {
    if (!templateId) {
      return;
    }

    setValue("subject", templateSubject);

    setValue("body", "");

    if (!templateBody) {
      return;
    }

    replaceTagsMutation.mutate({
      templateId,
      body: templateBody,
      entityId,
    });
  }, [templateId, templateSubject, templateBody, entityId, setValue]);

  /* ------------------------------------------------------------------------ */
  /*                         CC DEFAULT                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!email) {
      return;
    }

    setValue("cc", [
      {
        value: email,
        label: email,
        address: email,
      },
    ]);
  }, [email, setValue]);

  /* ------------------------------------------------------------------------ */
  /*                    SAVE SIGNING DOCUMENT                                 */
  /* ------------------------------------------------------------------------ */

  const buildSigningCoordinates = useCallback((filesList, coordinatesList) => {
    return (coordinatesList || []).map((coord) => {
      const matchedFile = filesList?.[coord.currentFileIndex];

      return {
        id: coord.id,

        currentFileIndex: coord.currentFileIndex,

        pageNumber: coord.pageNumber,

        x: coord.x,
        y: coord.y,

        width: coord.width,
        height: coord.height,

        tagType: getTagTypeNumber(coord.tagType?.value || coord.tagType),

        xCoord: coord.xCoord ?? coord.x,

        yCoord: coord.yCoord ?? coord.y,

        fileName: matchedFile?.name || coord?.fileName || "",
      };
    });
  }, []);

  const saveSigningDocumentMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/DocumentSigning/SaveSigningDocument",
        method: "post",
        payload,
        apiClient: "dm",
      }),
  });

  const buildSaveSigningDocumentPayload = useCallback(
    (values) => {
      const selectedDocumentId = getId(values?.documentId);

      const formData = new FormData();

      formData.append("ModuleId", activeMenu?.id ?? esignNodeId ?? "");

      formData.append("ESignType", 1);

      formData.append("RequestId", 0);

      formData.append("ExpirationDate", null);

      formData.append("email", getEmails(values?.to));

      formData.append("recipientName", getRecipientNames(values?.to));

      /* -------------------------- Existing document --------------------- */

      if (selectedDocumentId) {
        formData.append("DocumentIds", String(selectedDocumentId));

        return formData;
      }

      /* -------------------------- Uploaded PDF --------------------------- */

      if (!esignFiles?.length) {
        throw new Error("No PDF files available for signing");
      }

      if (!coordinates?.length) {
        throw new Error("No coordinates available for signing");
      }

      formData.append(
        "CaseId",
        getId(values?.caseId) || getEntityId(details?.caseId?.[0]) || -1,
      );

      formData.append(
        "EntityCodeId",
        watchedSaveToCase ? 1 : (details?.entityCodeId ?? 1),
      );

      formData.append("NodeId", getId(values?.caseFolderId) ?? -1);

      formData.append(
        "Coordinates",
        JSON.stringify(buildSigningCoordinates(esignFiles, coordinates)),
      );

      esignFiles.forEach((file) => {
        formData.append("file", file);
      });

      return formData;
    },
    [
      activeMenu?.id,
      esignNodeId,
      esignFiles,
      coordinates,
      details?.caseId,
      details?.entityCodeId,
      watchedSaveToCase,
      buildSigningCoordinates,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /*                              SEND API                                    */
  /* ------------------------------------------------------------------------ */

  const sendMutation = useMutation({
    mutationFn: async (values) => {
      /* -------------------------------------------------------------------- */
      /*                                MAIL                                  */
      /* -------------------------------------------------------------------- */

      if (activeType === "mail") {
        const file = values?.file || null;

        const body = values?.body || "";

        const formData = new FormData();

        formData.append("type", "mail");

        formData.append("templateId", getId(values?.template));

        formData.append("subject", values?.subject || "");

        formData.append("body", body);

        formData.append("to", getEmails(values?.to));

        formData.append("bcc", getEmails(values?.bcc));

        formData.append("cc", getEmails(values?.cc));

        if (file) {
          formData.append("file", file);
        }

        return apiRequest({
          apiPath: "/email/service-email",
          method: "post",
          payload: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      /* -------------------------------------------------------------------- */
      /*                                 SMS                                  */
      /* -------------------------------------------------------------------- */

      return apiRequest({
        apiPath: "/utility/sms/out",
        method: "post",
        payload: {
          type: "sms",
          entityId,
          templateId: getId(values?.template),
          body: values?.body || "",
          to: getEmails(values?.to),
        },
      });
    },

    onSuccess: () => {
      reset({
        ...DEFAULT_VALUES,
        type: activeType,
      });
    },

    onError: (error) => {
      console.error("SEND ERROR =>", error);
    },
  });

  /* ------------------------------------------------------------------------ */
  /*                           FORM FIELDS                                    */
  /* ------------------------------------------------------------------------ */

  const templateField = useMemo(
    () => [
      {
        name: "template",

        label: "Template",

        component: SelectField,

        props: {
          payload: {
            ...templatePayload,

            relationId: details?.entityCodeId,

            entityId,
          },

          isRelation: true,

          placeholder: "Select template",

          noErrorMessage: true,

          disabled: replaceTagsMutation.isPending,
        },
      },
    ],
    [
      templatePayload,
      details?.entityCodeId,
      entityId,
      replaceTagsMutation.isPending,
    ],
  );

  const caseFields = useMemo(() => {
    const isDocumentNeeded = !details?.esign;

    const shouldShowCaseFields =
      watchedEsign &&
      (details?.caseId?.length !== undefined || watchedSaveToCase);

    const shouldShowDocumentField = watchedEsign && isDocumentNeeded;

    const fields = [];

    /* ------------------------------ Case --------------------------------- */

    if (shouldShowCaseFields) {
      fields.push({
        name: "caseId",

        label: "Case",

        component: SelectField,

        rules: {
          required: "Case is required",
        },

        props: {
          payload: casePayload,

          isRequired: true,

          placeholder: "Select case",

          disabled: details?.caseId?.length,
        },
      });
    }

    /* ---------------------------- Document ------------------------------- */

    if (shouldShowDocumentField) {
      fields.push({
        name: "documentId",

        label: "Select Document",

        component: SelectField,

        rules: {
          required: "Document is required",
        },

        props: {
          payload: {
            ...documentPayload,

            relationId: details?.entityCodeId,

            entityId,
          },

          isRequired: true,

          isRelation: true,

          placeholder: "Select document",
        },
      });
    } else if (shouldShowCaseFields) {
      /* --------------------------- Case Folder ----------------------------- */
      fields.push({
        name: "caseFolderId",

        label: "Case Folder",

        component: SelectField,

        rules: {
          required: "Case Folder is required",
        },

        props: {
          payload: {
            ...caseFolderPayload,

            relationId: details?.entityCodeId,
          },

          isRequired: true,

          isRelation: true,

          placeholder: "Select case folder",

          disabled: false,
        },
      });
    }

    return fields;
  }, [
    watchedEsign,
    watchedSaveToCase,
    casePayload,
    caseFolderPayload,
    documentPayload,
    entityId,
    details?.entityCodeId,
    details?.esign,
    details?.caseId,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                          HANDLE TYPE CHANGE                              */
  /* ------------------------------------------------------------------------ */

  const handleTypeChange = useCallback(
    (type) => {
      if (type === activeType) {
        return;
      }

      const currentValues = getValues();

      setActiveType(type);

      reset({
        ...DEFAULT_VALUES,

        ...currentValues,

        type,

        to: [],

        ...(type === "sms"
          ? {
              bcc: [],
              cc: [],
              file: null,
              subject: "",
            }
          : {}),
      });
    },
    [activeType, getValues, reset],
  );

  /* ------------------------------------------------------------------------ */
  /*                              SUBMIT                                      */
  /* ------------------------------------------------------------------------ */

  const onSubmit = useCallback(
    async (values) => {
      try {
        let body = values?.body || "";

        /* ---------------------------------------------------------------- */
        /*                              ESIGN                               */
        /* ---------------------------------------------------------------- */

        if (activeType === "mail" && values?.esign) {
          const signingPayload = buildSaveSigningDocumentPayload(values);

          const signingResponse =
            await saveSigningDocumentMutation.mutateAsync(signingPayload);

          const signingGuid = signingResponse?.guid;

          const signingUrl = signingGuid
            ? `${import.meta.env.VITE_API_OPTIMUST_APP}/sign-document?${signingGuid}`
            : "";

          if (signingUrl) {
            const signLink = `<a href="${signingUrl}">Click here to sign</a>`;

            if (body.includes(ESIGN_URL_MERGE_TAG)) {
              body = body.replaceAll(ESIGN_URL_MERGE_TAG, signLink);
            } else {
              body = body + `\n${signLink}`;
            }
          }
        }

        /* ---------------------------------------------------------------- */
        /*                              SEND                                */
        /* ---------------------------------------------------------------- */

        await sendMutation.mutateAsync({
          ...values,
          body,
        });

        toast.success("Email Sent Successfully");

        setVisible?.(false);

        resetPdfEsign?.();
      } catch (error) {
        console.error("SEND ERROR =>", error);
      }
    },
    [
      activeType,
      buildSaveSigningDocumentPayload,
      saveSigningDocumentMutation,
      sendMutation,
      setVisible,
      resetPdfEsign,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /*                              RESET                                       */
  /* ------------------------------------------------------------------------ */

  const handleReset = useCallback(() => {
    reset({
      ...DEFAULT_VALUES,
      type: activeType,
    });
  }, [reset, activeType]);

  /* ------------------------------------------------------------------------ */
  /*                          LOADING STATE                                   */
  /* ------------------------------------------------------------------------ */

  const isSending =
    sendMutation.isPending || saveSigningDocumentMutation.isPending;

  const isReplacingTags = replaceTagsMutation.isPending;

  const isBusy = isSending || isReplacingTags;

  /* ------------------------------------------------------------------------ */
  /*                               RENDER                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm h-full overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex flex-col overflow-hidden px-3"
        >
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
              {/* ========================================================== */}
              {/* LEFT SIDE                                                   */}
              {/* ========================================================== */}

              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50 overflow-y-auto">
                <div className="p-2 sm:p-3">
                  <div className="overflow-visible">
                    {/* ---------------------------------------------------- */}
                    {/* MAIL / SMS SWITCH                                    */}
                    {/* ---------------------------------------------------- */}

                    <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
                      <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTypeChange("mail")}
                          className={classNames(
                            "flex-1 px-3 sm:px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm",
                            {
                              "bg-white shadow text-primary": isMail,

                              "text-gray-500 hover:text-gray-700": !isMail,
                            },
                          )}
                        >
                          <FiMail size={16} />
                          Mail
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTypeChange("sms")}
                          className={classNames(
                            "flex-1 px-3 sm:px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm",
                            {
                              "bg-white shadow text-primary": isSms,

                              "text-gray-500 hover:text-gray-700": !isSms,
                            },
                          )}
                        >
                          <FiMessageSquare size={16} />
                          SMS
                        </button>
                      </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* TEMPLATE                                             */}
                    {/* ---------------------------------------------------- */}

                    <div className="p-2 border-b border-gray-100">
                      <DynamicFormFields
                        fields={templateField}
                        control={control}
                        errors={errors}
                        gridCols="grid-cols-1"
                      />
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* RECIPIENTS                                           */}
                    {/* ---------------------------------------------------- */}

                    <div className="p-2">
                      {isMail ? (
                        <div className="space-y-3">
                          <EmailSearchDropdown
                            name="to"
                            control={control}
                            label="To"
                            queryKey="mail-to-search"
                            required
                          />

                          <EmailSearchDropdown
                            name="cc"
                            control={control}
                            label="CC"
                            queryKey="mail-cc-search"
                          />

                          <EmailSearchDropdown
                            name="bcc"
                            control={control}
                            label="BCC"
                            queryKey="mail-bcc-search"
                          />
                        </div>
                      ) : (
                        <Controller
                          name="to"
                          control={control}
                          render={({ field }) => (
                            <SearchDropdown
                              isMulti
                              iconName="pi pi-envelope"
                              queryKey="sms-to-search"
                              apiPath="/utility/relation/option"
                              responseKey="optionModelDT"
                              labelKey="label"
                              idKey="value"
                              label="Mobile Number"
                              secondLabelKey="address"
                              placeholder="Select mobile number"
                              payloadBuilder={(search) => ({
                                page: 1,
                                pageSize: 50,

                                ...mobilePayload,

                                relationId: details?.entityCodeId,

                                entityId,

                                searchTerm: search,
                              })}
                              value={field.value || []}
                              onSelect={(items) => {
                                field.onChange(items);
                              }}
                            />
                          )}
                        />
                      )}
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* FILE UPLOAD                                          */}
                    {/* ---------------------------------------------------- */}

                    {isMail && (
                      <div className="px-2 pb-3">
                        <Controller
                          name="file"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attach Document
                              </label>

                              {!field.value ? (
                                <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-primary hover:bg-gray-50 transition-all duration-200">
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(event) => {
                                      field.onChange(
                                        event.target.files?.[0] || null,
                                      );
                                    }}
                                  />

                                  <div className="text-center">
                                    <p className="text-sm font-medium text-gray-700">
                                      Click to upload file
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                      PDF, DOC, DOCX, JPG, PNG
                                    </p>
                                  </div>
                                </label>
                              ) : (
                                <div className="flex items-center justify-between gap-3 border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                      {field.value.name}
                                    </p>

                                    {field.value?.size && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {(field.value.size / 1024).toFixed(1)}{" "}
                                        KB
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => field.onChange(null)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* ESIGN / SAVE TO CASE                                 */}
                    {/* ---------------------------------------------------- */}

                    {isMail && !isBulkMessaging && (
                      <div className="px-2 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <Controller
                            name="esign"
                            control={control}
                            render={({ field }) => (
                              <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-wide text-gray-700">
                                  eSign
                                </label>

                                <CustomToggle
                                  checked={field.value}
                                  disabled={isEsignDisabled}
                                  onChange={(event) => {
                                    field.onChange(event.value ?? event);
                                  }}
                                />
                              </div>
                            )}
                          />

                          {shouldShowSaveToCase && (
                            <Controller
                              name="saveToCase"
                              control={control}
                              render={({ field }) => (
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs uppercase tracking-wide text-gray-700">
                                    Save to Case
                                  </label>

                                  <CustomToggle
                                    checked={field.value}
                                    onChange={(event) => {
                                      field.onChange(event.value ?? event);
                                    }}
                                  />
                                </div>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* CASE / DOCUMENT / FOLDER                             */}
                    {/* ---------------------------------------------------- */}

                    {isMail && caseFields.length > 0 && (
                      <div className="px-2 border-t border-gray-100">
                        <DynamicFormFields
                          fields={caseFields}
                          control={control}
                          errors={errors}
                          gridCols="grid-cols-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* RIGHT SIDE                                                  */}
              {/* ========================================================== */}

              <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-white min-h-125">
                {/* -------------------------------------------------------- */}
                {/* SUBJECT                                                   */}
                {/* -------------------------------------------------------- */}

                {isMail && (
                  <div className="px-2 sm:px-3 border-b border-gray-100 shrink-0 bg-white">
                    <DynamicFormFields
                      fields={[
                        {
                          name: "subject",

                          label: "Subject",

                          component: Input,

                          rules: {
                            required: "Subject is required",
                          },

                          props: {
                            type: "text",

                            isRequired: true,

                            placeholder: "Enter subject",

                            noErrorMessage: true,
                          },
                        },
                      ]}
                      control={control}
                      errors={errors}
                      gridCols="grid-cols-1"
                    />
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* EDITOR                                                   */}
                {/* -------------------------------------------------------- */}

                <div className="flex-1 overflow-y-hidden bg-gray-50 p-2 sm:p-3">
                  <div className="bg-white rounded-2xl overflow-hidden relative h-full flex flex-col">
                    {isReplacingTags && <EditorLoader />}

                    <Controller
                      name="body"
                      control={control}
                      rules={{
                        required: "Message is required",
                      }}
                      render={({ field }) => (
                        <div
                          className={classNames(
                            "flex-1 min-h-0 overflow-hidden",
                            {
                              "pointer-events-none opacity-60": isReplacingTags,
                            },
                          )}
                        >
                          <CKEditor
                            editor={ClassicEditor}
                            data={field.value || ""}
                            disabled={isReplacingTags}
                            onReady={(editor) => {
                              editorRef.current = editor;
                            }}
                            onChange={(event, editor) => {
                              field.onChange(editor.getData());
                            }}
                          />

                          {errors?.body && (
                            <p className="text-red-500 text-xs mt-2 px-2">
                              {errors.body.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* FOOTER                                                    */}
                {/* -------------------------------------------------------- */}

                {!hideSubmit && (
                  <div className="border-t border-gray-100 bg-white px-3 sm:px-6 py-3 shrink-0">
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                      <CustomButton
                        label="Reset"
                        type="button"
                        className="outlineBtn w-full sm:w-auto"
                        onClick={handleReset}
                      />

                      <CustomButton
                        label={isBusy ? "Sending..." : "Send"}
                        type="submit"
                        className="saveBtn w-full sm:w-auto"
                        disabled={isBusy}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ================================================================== */}
      {/* CKEDITOR STYLES                                                    */}
      {/* ================================================================== */}

      <style>
        {`
          .ck-editor__editable_inline {
            min-height: 420px;
            max-height: 320px;
            overflow-y: auto;
          }

          .ck-editor__top {
            border-bottom: 1px solid #e5e7eb;
          }

          .ck-editor__main {
            min-height: 0;
          }

          .ck.ck-editor {
            width: 100%;
          }

          .ck-toolbar {
            border-top-left-radius: 12px !important;
            border-top-right-radius: 12px !important;
          }

          .ck-editor__editable {
            border-bottom-left-radius: 12px !important;
            border-bottom-right-radius: 12px !important;
          }
        `}
      </style>
    </div>
  );
});

export default SendEmailSMSForm;
