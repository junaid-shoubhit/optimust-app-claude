import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import DynamicFormFields from "../../../../components/Forms/DynamicForm/UserDynamicForm";
import Input from "../../../../components/Forms/Input/Input";
import CustomDate from "../../../../components/Forms/Date/Date";
import SelectField from "../../../../components/Forms/Select/Select";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import CustomToggle from "../../../../components/Forms/CustomToggle/CustomToggle";
import { getId } from "../../../../utils/constants/formConstants";
import { createPayload } from "../../../../utils/constants/formConstants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../services/apiBinding";
import CaseFolderSelect from "./CaseFolderSelect";
import { useAppNavigation } from "../../../../navigation/NavigationContext";
const ESignSendForm = ({ setVisible, files, coordinates }) => {
  const [saveToCase, setSaveToCase] = useState(false);
  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(
    () => ({
      recipientName: "",
      recipientEmail: "",
      expirationDate: "",
      saveToCase: false,
      caseId: null,
      caseFolderId: null,
    }),
    [],
  );

  /* ------------------ FORM CONTROL ------------------ */
  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  const watchSaveToCase = watch("saveToCase");
  const caseFolderPayload = useMemo(
    () => createPayload("dmDefaultCaseFolders"),
    [],
  );
  const firmPayload = useMemo(() => createPayload("frmFirms_Basic"), []);
  const casePayload = useMemo(() => createPayload("ctCaseNo"), []);
  const { activeMenu } = useAppNavigation();

  /* ------------------ FORM FIELDS CONFIG ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "recipientName",
        label: "Recipient Full Name",
        component: Input,
        props: { isRequired: true },
        rules: { required: "Name is required" },
      },
      {
        name: "recipientEmail",
        label: "Recipient Email",
        component: Input,
        props: { isRequired: true },
        rules: { required: "Email is required" },
      },
      {
        name: "expirationDate",
        label: "Expiration Date",
        component: CustomDate,
        // props: { type: "date" },
      },
      {
        name: "saveToCase",
        label: "Save To Case",
        customRender: ({ field }) => (
          <div className="flex flex-col col-span-2">
            <label className="text-xs uppercase tracking-wide text-gray-700 mb-1">
              Save To Case
            </label>
            <CustomToggle
              checked={field.value}
              onChange={(e) => {
                field.onChange(e.value ?? e);
                setSaveToCase(e.value ?? e);
              }}
            />
          </div>
        ),
      },
      // Conditional fields will be handled below
    ],
    [],
  );

  /* ------------------ CONDITIONAL FIELDS ------------------ */
  const conditionalFields = useMemo(() => {
    if (!watchSaveToCase)
      return [
        {
          name: "Firm",
          label: "Firm",
          component: SelectField,
          props: {
            payload: firmPayload,
            isRequired: true,
          },
          rules: { required: "Case is required" },
        },
      ];

    return [
      {
        name: "caseId",
        label: "Case",
        component: SelectField,
        props: {
          payload: casePayload,
          isRequired: true,
        },
        rules: { required: "Case is required" },
      },
      {
        name: "caseFolderId",
        label: "Case Folder",
        component: CaseFolderSelect, // 👈 Swapped here
        props: {
          isRequired: true,
          // Optional: if the folder list depends on the firm
          // firmId: watch("Firm")?.value
        },
        rules: { required: "Case Folder is required" },
      },
    ];
  }, [watchSaveToCase]);

  const allFields = [...formFields, ...conditionalFields];

  const documentSigningMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/documentSigning",
        method: "POST",
        payload,
        apiClient: "dm",
      }),
  });

  const uploadFile = async ({ file, nodeForGrid, values }) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("FileName", file.name);
    formData.append("NodeForGrid", nodeForGrid);
    formData.append("NodeId", getId(values.caseFolderId) || null);
    formData.append("CaseId", getId(values.caseId) || -1);
    formData.append("AccessToken", null);
    formData.append("ForceOverwrite", true);
    formData.append("ESignType", 1);
    formData.append("UploadNew", true);
    formData.append("FromLocation", "PDF Sign Tool");
    // formData.append("UserId", "11105");

    return apiRequest({
      apiPath: "/fileUpload",
      method: "POST",
      payload: formData,
      isFormData: true,
      apiClient: "dm",
    });
  };

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (values) => {
    try {
      if (!files?.length) {
        throw new Error("No files selected");
      }

      if (!coordinates?.length) {
        throw new Error("No tags added");
      }

      // const nodeForGrid = `ESignDocument/${crypto.randomUUID()}`;
      const folderInfo = values?.caseFolderId?.info || "\\";
      const nodeForGrid = `${values?.caseId?.label}/${folderInfo}`;

      console.log("nodeForGrid", nodeForGrid);
      // const userid = user?.userid;
      console.log("nodeForGrid", nodeForGrid);

      console.log("files", files);

      /* ------------------ STEP 1: UPLOAD ALL FILES ------------------ */
      const uploadResponses = await Promise.all(
        files.map((file) => uploadFile({ file, nodeForGrid, values })),
      );

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

      /* ------------------ STEP 2: CALL /pdfESign FOR EACH FILE ------------------ */
      // ✅ STEP 2: CALL /document FOR EACH FILE
      console.log("values", values);
      console.log("coordinates", coordinates);

      let documentResponses = await Promise.all(
        uploadResponses.map((fileData, index) => {
          const file = files[index];

          const payload = {
            ImageId: -1,
            FileName: file.name,
            NodeName: "",
            CreatedBy: "",
            ModifiedBy: "",
            Created: null,
            Modified: null,
            FromLocation: "PDF Sign Tool",
            Description: "",
            NodeForGrid: nodeForGrid,
            UNC: fileData?.UNC,
            FileType: "",
            ByteSize: file.size || 0,
            FileNo: "",

            // 🔥 conditional values
            NodeId: values?.saveToCase ? getId(values?.caseFolderId) || 0 : 0,
            CaseId: values?.saveToCase ? getId(values?.caseId) || -1 : -1,
            DefaultCaseFolderId: values?.saveToCase
              ? getId(values?.caseFolderId) || -1
              : -1,

            UserId: 0,
            Bytes: "",
            AccessToken: "",
            Extension: file.name.split(".").pop(),
            IntakeId: -1,
            CheckOverwrite: true,
            IsLink: false,
            HasOldVersions: false,
            Delete: false,
            TemplateId: 0,
            Action: "",
            TaskId: -1,
            CaseName: "",
            Entity: "",
            SignInitials: false,
            GeneratesCost: false,
            RelativePath: "",
            AddingNewVersion: null,
            LauncherString: "",
            ForcePreview: false,
            CaseIds: "",
            ConvertTif: false,
            HasSignature: false,
            isRetainer: false,
            SentTo: "",
            SentByEmail: "",
            CaseStatus: null,
            DateStatusChanged: null,
            ESignType: -1,
          };

          return apiRequest({
            apiPath: "/document",
            method: "POST",
            payload,
            apiClient: "dm",
          });
        }),
      );

      await Promise.all(
        documentResponses.map((docRes, index) => {
          console.log("docRes0", docRes);

          const payload = {
            documentId: docRes, // 👈 important link
            // NodeForGrid: nodeForGrid,
            // FromLocation: "PDF Sign Tool",

            // SentTo: values?.recipientName,
            // SentByEmail: values?.recipientEmail,

            // CaseId: getId(values?.caseId) || -1,
            // DefaultCaseFolderId: getId(values?.caseFolderId) || -1,
            // firm: values?.Firm?.value || null,

            coordinates: coordinates
              .filter((c) => c.currentFileIndex === index)
              .map((c) => ({
                id: c.id,
                currentFileIndex: c.currentFileIndex,
                pageNumber: c.pageNumber,
                x: c.x,
                y: c.y,
                width: c.width,
                height: c.height,
                tagType: getTagTypeNumber(c.tagType?.value),
                xCoord: c.x,
                yCoord: c.y,
              })),

            // IntakeId: -1,
            // TaskId: -1,
          };

          return apiRequest({
            apiPath: "/pdfESign",
            method: "PATCH",
            payload,
            apiClient: "dm",
          });
        }),
      );

      const documentIds = documentResponses.map((res) => res);

      // 👇 pick first file for Document object
      const firstFile = files[0];
      const firstUpload = uploadResponses[0];

      const documentSigningPayload = {
        UserId: 0, // ⚠️ replace dynamically later
        EntityId: 0,
        UniqueId: crypto.randomUUID(),
        ModuleId: 0,

        DocumentIds: documentIds.join(","),

        Document: {
          UserId: 11105,
          ImageId: 0,
          FileName: firstFile?.name || "",
          NodeName: "",
          CreatedBy: "",
          ModifiedBy: "",
          Created: new Date().toISOString(),
          Modified: new Date().toISOString(),
          FromLocation: "PDF Sign Tool",
          Description: "",
          NodeForGrid: nodeForGrid,
          FileType: "",
          UNC: firstUpload?.UNC || "",
          ByteSize: firstFile?.size || 0,
          FileNo: "",
          NodeId: values?.saveToCase ? getId(values?.caseFolderId) || 0 : 0,
          Bytes: "",
          Extension: firstFile?.name.split(".").pop(),
          CaseId: values?.saveToCase ? getId(values?.caseId) || -1 : -1,
          IntakeId: -1,
          CheckOverwrite: true,
          IsLink: false,
          HasOldVersions: false,
          Delete: false,
          TemplateId: 0,
          Action: "",
          TaskId: -1,
          TabMappingId: 0,
          CaseName: "",
          Entity: "",
          SignInitials: false,
          GeneratesCost: false,
          DefaultCaseFolderId: values?.saveToCase
            ? getId(values?.caseFolderId) || -1
            : -1,
          RelativePath: "",
          AddingNewVersion: true,
          LauncherString: "",
          ForcePreview: true,
          CaseIds: "",
          ConvertTif: false,
          HasSignature: true,
          SentTo: values?.recipientName,
          SentByEmail: values?.recipientEmail,
          CaseStatus: "",
          DateStatusChanged: new Date().toISOString(),
          ESignType: 1,
          AccessToken: firstUpload?.AccessToken || "",
        },

        RecipientName: values.recipientName,
        Email: values.recipientEmail,
        Entity: "",
        ESignType: 1,
        RequestId: 0,
        ExpirationDate: values.expirationDate || new Date().toISOString(),
      };

      await documentSigningMutation.mutateAsync(documentSigningPayload);

      toast.success("Email sent");
      handleClose();
    } catch (err) {
      console.error("ESign flow failed ❌", err);
    }
  };

  /* ------------------ CLOSE ------------------ */
  const handleClose = () => {
    reset();
    setVisible(false);
    setSaveToCase(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicFormFields
        fields={allFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-2"
      />

      <div className="flex justify-end gap-3 mt-6">
        <CustomButton
          label="Cancel"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={isSubmitting ? "SENDING..." : "Send"}
          type="submit"
          className="saveBtn"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ESignSendForm;
