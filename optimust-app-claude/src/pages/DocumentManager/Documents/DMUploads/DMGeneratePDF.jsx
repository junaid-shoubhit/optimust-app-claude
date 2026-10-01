import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../services/apiBinding";

import CaseFolderSelector from "./CaseFolderSelector";
import { Dialog } from "primereact/dialog";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import { Controller, useForm } from "react-hook-form";
import Input from "../../../../components/Forms/Input/Input";
import SelectField from "../../../../components/Forms/Select/Select";

const DMGeneratePDF = ({
  fileMenuRef,
  caseId,
  folderId,
  currentCaseFolders,
  entityCodeId,
  addFileToActive,
  clientName,
}) => {
  const fileInputRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visible, setVisible] = useState(false);

  const [showSelector, setShowSelector] = useState(false);
  const [infoFolder, setInfoFolder] = useState(false);

  // OVERWRITE DIALOG
  const [overwriteConfirm, setOverwriteConfirm] = useState(false);

  // STORE FORM DATA
  const [pendingFormData, setPendingFormData] = useState(null);

  // DYNAMIC ADDITIONAL COLUMNS
  const [additionalCodes, setAdditionalCodes] = useState([]);

  // TRACK WHETHER CURRENT GENERATION IS AN OVERWRITE
  const [isOverwrite, setIsOverwrite] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      templateId: "",
      fileName: "",
      caseId,
      folderId,

      // DOCUMENT FORMAT OPTIONS
      SaveDocx: false,
      SavePdf: true,
    },
  });

  // =====================================================
  // CASE + FOLDER SELECTOR
  // =====================================================
  const onSelectorComplete = () => {
    fileInputRef.current?.click();

    setShowSelector(false);
  };

  // =====================================================
  // HANDLE DYNAMIC FIELD CHANGE
  // =====================================================
  const handleAdditionalCodeChange = (index, value) => {
    setAdditionalCodes((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              value,
            }
          : item,
      ),
    );
  };

  // =====================================================
  // RESET ALL
  // =====================================================
  const resetState = () => {
    setAdditionalCodes([]);

    setPendingFormData(null);

    setOverwriteConfirm(false);

    setIsOverwrite(false);

    setInfoFolder(false);
  };

  // =====================================================
  // GENERATE DOCUMENT
  // =====================================================
  const generateDocument = async ({
    formData,
    overwrite = false,
    sendAdditionalCodes = false,
    skipExistsCheck = false,
  }) => {
    try {
      setIsGenerating(true);
      const payload = {
        ...formData,
        templateId: formData?.templateId?.value,
        EntityCodeId: entityCodeId,
      };

      if (overwrite) {
        payload.ForceOverwrite = true;
      }

      if (sendAdditionalCodes) {
        payload.AdditionalTemplateColumns = additionalCodes;
      }

      const res = await apiRequest({
        apiPath: "Template/GenerateDocument",
        payload,
        apiClient: "dm",
        method: "post",
      });

      // Exists check
      if (res?.isExists === "exists" && !overwrite && !skipExistsCheck) {
        setPendingFormData(formData);
        setOverwriteConfirm(true);
        return;
      }

      // =====================================================
      // ADDITIONAL FIELDS RESPONSE
      // =====================================================
      if (
        Array.isArray(res?.data) &&
        res?.data?.length > 0 &&
        !sendAdditionalCodes
      ) {
        const formattedFields = res.data.map((item) => ({
          key: item?.replace(/[{}]/g, ""),
          value: "",
        }));

        setAdditionalCodes(formattedFields);
        setPendingFormData(formData);
        return;
      }

      // =====================================================
      // SUCCESS
      // =====================================================
      toast.success(res?.message || "PDF Generated Successfully");
      addFileToActive(res?.documentList || []);
      setVisible(false);
      resetState();
      fileMenuRef.current?.hide();
    } catch (error) {
      toast.error(error || "Something went wrong while generating document");
    } finally {
      setIsGenerating(false);
    }
  };

  // =====================================================
  // INITIAL SUBMIT
  // =====================================================
  const onSubmit = async (data) => {
    setPendingFormData(data);
    setIsOverwrite(false);

    await generateDocument({
      formData: data,
      overwrite: false,
      sendAdditionalCodes: false,
      skipExistsCheck: false,
    });
  };

  // =====================================================
  // OVERWRITE YES
  // =====================================================
  const handleOverwriteYes = async () => {
    setOverwriteConfirm(false);

    // IMPORTANT:
    // Remember that this generation is now an overwrite.
    // If additional fields are returned, the final save
    // will also use overwrite: true.
    setIsOverwrite(true);

    await generateDocument({
      formData: pendingFormData,
      overwrite: true,
      sendAdditionalCodes: false,
      skipExistsCheck: true,
    });
  };

  // =====================================================
  // OVERWRITE NO
  // =====================================================
  const handleOverwriteNo = () => {
    setOverwriteConfirm(false);
    setIsOverwrite(false);
  };

  // =====================================================
  // FINAL SAVE
  // =====================================================
  const handleFinalSave = async () => {
    await generateDocument({
      formData: pendingFormData,

      // IMPORTANT:
      // If user selected "Yes, Continue" in overwrite dialog,
      // this will be true.
      overwrite: isOverwrite,

      sendAdditionalCodes: true,

      // We already checked existence during the first request.
      skipExistsCheck: true,
    });
  };

  // =====================================================
  // CLOSE MAIN DIALOG
  // =====================================================
  const handleClose = () => {
    if (isGenerating) return;

    setVisible(false);

    resetState();

    fileMenuRef.current?.hide();
  };

  return (
    <>
      {/* ===================================================== */}
      {/* MENU BUTTON */}
      {/* ===================================================== */}
      <li>
        <button
          onClick={() => setVisible(true)}
          className="w-full text-left px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-2"
        >
          📄 Generate Template
        </button>
      </li>

      {/* ===================================================== */}
      {/* MAIN DIALOG */}
      {/* ===================================================== */}
      <Dialog
        header="Generate Template"
        visible={visible}
        style={{
          width: "45rem",
          zIndex: 2,
        }}
        onHide={handleClose}
        footer={
          <div className="flex justify-end gap-2 pb-1">
            <CustomButton
              label="Cancel"
              className="outlineBtn"
              onClick={handleClose}
              disabled={isGenerating}
            />

            <CustomButton
              label={additionalCodes?.length > 0 ? "Generate" : "Save"}
              className="saveBtn"
              loading={isGenerating}
              disabled={isGenerating}
              onClick={
                additionalCodes?.length > 0
                  ? handleFinalSave
                  : handleSubmit(onSubmit)
              }
            />
          </div>
        }
      >
        <form
          className="flex flex-col gap-4 p-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* ===================================================== */}
          {/* INITIAL FIELDS */}
          {/* ===================================================== */}
          {additionalCodes?.length === 0 && (
            <>
              {/* ===================================================== */}
              {/* TEMPLATE SELECT */}
              {/* ===================================================== */}
              <div>
                <Controller
                  name="templateId"
                  control={control}
                  rules={{
                    required: "Template is required",
                  }}
                  render={({ field }) => (
                    <SelectField
                      label="Select Template"
                      {...field}
                      placeholder="Template"
                      invalid={errors?.templateId}
                      payload={{
                        dataTable: "dmTemplates",
                        dataField: "name",
                        relationId: entityCodeId,
                      }}
                      isRelation={true}
                      onChange={(e) => {
                        field.onChange(e);

                        if (e) {
                          setValue(
                            "fileName",
                            `${e?.label} ${clientName || ""}`,
                          );

                          setInfoFolder(e?.info);
                        } else {
                          setValue("fileName", "");

                          setInfoFolder("");
                        }
                      }}
                      isRequired={true}
                    />
                  )}
                />

                {/* ===================================================== */}
                {/* INFO FOLDER */}
                {/* ===================================================== */}
                {infoFolder && (
                  <p className="text-sm font-bold">
                    <span>Saving in - </span>
                    {infoFolder} Folder
                  </p>
                )}
              </div>

              {/* ===================================================== */}
              {/* DOCUMENT NAME */}
              {/* ===================================================== */}
              <Controller
                name="fileName"
                control={control}
                rules={{
                  required: "Document Name is required",
                }}
                render={({ field }) => (
                  <Input
                    type="text"
                    label="Document Name"
                    placeholder="Enter Document Name"
                    {...field}
                    invalid={errors?.fileName}
                    isRequired={true}
                  />
                )}
              />

              {/* ===================================================== */}
              {/* DOCUMENT FORMAT OPTIONS */}
              {/* ===================================================== */}
              <div className="flex items-center gap-6">
                {/* SAVE AS DOCX */}
                <Controller
                  name="SaveDocx"
                  control={control}
                  render={({ field: docxField }) => (
                    <Controller
                      name="SavePdf"
                      control={control}
                      render={({ field: pdfField }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="documentFormat"
                            checked={!!docxField.value}
                            onChange={() => {
                              docxField.onChange(true);
                              pdfField.onChange(false);
                            }}
                            className="w-4 h-4 cursor-pointer"
                          />

                          <span className="text-sm font-medium">
                            Save as DOCX
                          </span>
                        </label>
                      )}
                    />
                  )}
                />

                {/* SAVE AS PDF */}
                <Controller
                  name="SavePdf"
                  control={control}
                  render={({ field: pdfField }) => (
                    <Controller
                      name="SaveDocx"
                      control={control}
                      render={({ field: docxField }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="documentFormat"
                            checked={!!pdfField.value}
                            onChange={() => {
                              pdfField.onChange(true);
                              docxField.onChange(false);
                            }}
                            className="w-4 h-4 cursor-pointer"
                          />

                          <span className="text-sm font-medium">
                            Save as PDF
                          </span>
                        </label>
                      )}
                    />
                  )}
                />
              </div>
            </>
          )}

          {/* ===================================================== */}
          {/* DYNAMIC ADDITIONAL FIELDS */}
          {/* ===================================================== */}
          {additionalCodes?.length > 0 && (
            <>
              <p className="uppercase text-xs text-red-400 font-semibold">
                {" "}
                Merge code not found for the fields below. You can enter one
                manually or skip.
              </p>
              {additionalCodes.map((item, index) => (
                <Input
                  key={index}
                  type="text"
                  label={item?.key}
                  placeholder={`Enter ${item?.key}`}
                  value={item?.value || ""}
                  onChange={(e) =>
                    handleAdditionalCodeChange(index, e.target.value)
                  }
                />
              ))}
            </>
          )}
        </form>
      </Dialog>

      {/* ===================================================== */}
      {/* OVERWRITE DIALOG */}
      {/* ===================================================== */}
      <Dialog
        header="Overwrite Existing File?"
        visible={overwriteConfirm}
        style={{
          width: "30rem",
        }}
        onHide={() => {
          if (isGenerating) return;

          setOverwriteConfirm(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <CustomButton
              label="No"
              icon="pi-times pi"
              iconPos="left"
              outlined
              className="cancelBtn text-white!"
              onClick={handleOverwriteNo}
              disabled={isGenerating}
            />

            <CustomButton
              label="Yes, Continue"
              icon="pi-check-circle pi"
              iconPos="left"
              onClick={handleOverwriteYes}
              loading={isGenerating}
              className="saveBtn"
              disabled={isGenerating}
            />
          </div>
        }
      >
        <p className="p-3 font-semibold">
          A file with the same name already exists.
          <br />
          Do you want to overwrite the existing file?
        </p>
      </Dialog>

      {/* ===================================================== */}
      {/* CASE + FOLDER SELECTOR */}
      {/* ===================================================== */}
      <CaseFolderSelector
        visible={showSelector}
        onHide={() => setShowSelector(false)}
        onComplete={onSelectorComplete}
        currentCaseFolders={currentCaseFolders}
      />
    </>
  );
};

export default DMGeneratePDF;
