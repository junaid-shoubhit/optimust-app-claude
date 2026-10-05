import { Card } from "primereact/card";
import { useForm, Controller } from "react-hook-form";
import { useMemo, useState, useEffect, useCallback } from "react";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import EditorPanel from "./EditorPanel";
import SideOptionsForm from "./SideOptionsForm";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";
import { useFileParser } from "../../../hooks/templates/useFileParser";
import { useTemplateSubmit } from "../../../hooks/templates/useTemplateSubmit";
import { toast } from "react-toastify";
import { titleMap } from "../../../utils/constant";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import mammoth from "mammoth";
import { useAppNavigation } from "../../../navigation/NavigationContext";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const TemplateForm = ({
  selectedData,
  caseId,
  mode,
  page,
  firmId,
  handleClose,
}) => {
  const { invalidateKeys } = useOutletContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { parseFile } = useFileParser();
  const { activeMenu } = useAppNavigation();
  const formatTemplatePayload = (values) => {
    return {
      ...values,
      blobName: values?.file ? null : values?.blobName || null, // Clear blobName if a new file is uploaded
      id: values.id && values.id > 0 ? values.id : null,
      versionId:
        values.versionId && values.versionId > 0 ? values.versionId : null,
      costTypeId: values?.costTypeId?.value || 0,
      captionOptionId: values?.captionOptionId?.value || 0,
      defaultCaseFolderId: values?.defaultCaseFolderId?.value || null,
      EntityCodeId: values?.EntityCodeId?.value || 0,
    };
  };

  const { submitDMTemplate, submitTemplate } = useTemplateSubmit({
    mode,
    caseId,
    navigate,
    queryClient,
    invalidateKeys,
    page,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const initialValues = useMemo(
    () => ({
      id: mode === "edit" ? selectedData?.templates?.id : 0,
      moduleId: activeMenu?.id,
      templateValue: selectedData?.templates?.templateValue || "",
      name:
        mode === "clone"
          ? `${selectedData?.templates?.name || ""} Clone`
          : selectedData?.templates?.name || "",
      costTypeId: selectedData?.costTypesNamesdt?.[0] || [],
      // firmIds: selectedData?.firmNames || [],
      defaultCaseFolderId:
        selectedData?.templates?.defaultCaseFolderId == -1
          ? { label: "ROOT-FOLDER", value: -1 }
          : selectedData?.folderNames?.[0] || [],
      captionOptionId: selectedData?.captionNames?.[0] || [],
      blobName: selectedData?.templates?.blobName || "",
      // userGroups: selectedData?.userGroupsDatalist || [],
      updateClusterStatus:
        selectedData?.templates?.updateClusterStatus || false,
      clusterExhibits: selectedData?.templates?.clusterExhibits || false,
      isActive: selectedData?.templates?.isActive || false,
      settledStatusOption:
        selectedData?.templates?.settledStatusOption || false,
      discontinuedStatusOption:
        selectedData?.templates?.discontinuedStatusOption || false,
      hasSignature: selectedData?.templates?.hasSignature || false,
      omitExhibits: selectedData?.templates?.omitExhibits || false,
      // isRetainer: selectedData?.templates?.isRetainer || false,
      EntityCodeId: selectedData?.templates?.entityCodeId
        ? {
            label: selectedData?.templates?.entityCode,
            value: selectedData?.templates?.entityCodeId,
          }
        : 0,
      versionId: selectedData?.templates?.versionId,
      versionNumber: selectedData?.templates?.versionNumber
        ? {
            label: selectedData?.templates?.versionNumber,
            value: selectedData?.templates?.versionId,
          }
        : 0,
      tabmappingId: 0,
      UnbindedCodes: [],
    }),
    [selectedData, mode, activeMenu],
  );

  const {
    handleSubmit,
    control,
    watch,
    getValues,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({ defaultValues: initialValues });
  console.log("errors", errors);
  useEffect(() => {
    reset(initialValues);
  }, [reset, initialValues]);

  const extractTextFromPDF = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const htmlParts = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();

        let lastY = null;
        const lines = [];
        let line = [];

        for (const item of textContent.items) {
          const y = Math.round(item.transform[5]);
          if (lastY === null || Math.abs(y - lastY) < 5) {
            line.push(item.str);
          } else {
            lines.push(line.join(" "));
            line = [item.str];
          }
          lastY = y;
        }

        if (line.length) lines.push(line.join(" "));

        return `<div style="margin-bottom:10px;">${lines
          .map((l) => `<p style="margin:2px 0;">${l}</p>`)
          .join(
            "",
          )}</div><hr style="border:0;border-top:1px solid #ddd;margin:10px 0;">`;
      }),
    );

    return htmlParts.join("");
  }, []);

  const extractTextFromDOCX = useCallback(async (file) => {
    const { value } = await mammoth.convertToHtml({
      arrayBuffer: await file.arrayBuffer(),
    });
    return value;
  }, []);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return "";

      try {
        setIsTemplateLoading(true);
        let content = "";
        const { type } = file;

        if (type === "application/pdf")
          content = await extractTextFromPDF(file);
        else if (
          type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
          content = await extractTextFromDOCX(file);
        else {
          toast.error("Only PDF or DOCX files are supported.");
          return "";
        }

        toast.success("File content loaded!");
        setIsTemplateLoading(false);
        return content;
      } catch (err) {
        console.error("File conversion error:", err);
        toast.error("Error reading file.");
        setIsTemplateLoading(false);
        return "";
      }
    },
    [extractTextFromPDF, extractTextFromDOCX],
  );

  const handleVersion = async () => {
    try {
      setIsLoading(true);
      const versionId = getValues("versionNumber.value");
      const res = await apiRequest({
        apiPath: `/Template/TemplateVersionsUpdate?VersionId=${versionId}`,
        method: "post",
        apiClient: "dm",
      });
      console.log("res", res);
      toast.success(res?.ResultMessage || "Version updated!");
    } catch (err) {
      console.error(err);
      toast.error("Error setting current version");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (isDraft) => async (data) => {
    setIsDraft(isDraft);
    if (mode === "DMTemplates") {
      return submitDMTemplate(data, isDraft, handleClose);
    }

    const formatted = formatTemplatePayload({ ...data });
    await submitTemplate(formatted, isDraft);
  };
  return (
    <Card
      className="w-full bg-(--foreground) overflow-y-auto relative"
      style={{ height: mode === "DMTemplates" ? "100%" : "calc(100vh - 65px)" }}
    >
      <form className="h-full">
        <div
          className={
            isFullscreen
              ? "fixed inset-0 px-2 overflow-y-auto z-9999 bg-(--foreground)"
              : ""
          }
        >
          {/* Header */}
          <div className="sticky top-0 z-50 flex bg-(--foreground) justify-between items-center border-b border-gray-300 py-1 px-1 mb-3">
            <h6 className="font-semibold text-base">
              {/* {mode === "edit" ? "Edit Template" : "Create Template"} */}
              {titleMap[mode] ?? "Create"} Template
            </h6>

            <div className="flex gap-2 bg-(--foreground)">
              {selectedData &&
                page === "templates" &&
                !selectedData?.templates?.isCurrent &&
                selectedData?.versionNumbers?.length > 1 && (
                  <CustomButton
                    type="button"
                    className="saveBtn"
                    label="Set as Current"
                    onClick={() => handleVersion()}
                    loading={isLoading}
                    disabled={isLoading}
                  />
                )}

              <CustomButton
                // onClick={handleSubmit((data) => submitTemplate(data, true))}
                // label={isSubmitting ? "Submitting..." : "Draft"}
                disabled={isSubmitting && isDraft}
                className="saveBtn"
                label={
                  isSubmitting && isDraft
                    ? "Saving Draft..."
                    : mode === "DMTemplates"
                      ? "Generate Draft"
                      : mode === "edit" && page === "draft"
                        ? "Save "
                        : "Draft"
                }
                onClick={handleSubmit(onSubmit(true))}
              />

              <CustomButton
                // onClick={handleSubmit((data) => submitTemplate(data, false))}
                // label={isSubmitting ? "Submitting..." : "Publish"}
                disabled={isSubmitting && !isDraft}
                className="saveBtn"
                label={
                  isSubmitting && !isDraft
                    ? "Publishing..."
                    : mode === "DMTemplates"
                      ? "Generate Document"
                      : "Publish"
                }
                // (mode === "edit" && page === "templates") ? "Update Publish Template " :
                onClick={handleSubmit(onSubmit(false))}
              />
            </div>
          </div>

          {/* Editor + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 bg-(--foreground)">
            <div className={sidebarOpen ? "lg:col-span-5" : "lg:col-span-7"}>
              <Controller
                name="templateValue"
                control={control}
                // rules={{ required: "Template is Empty" }}
                render={({ field }) => (
                  <EditorPanel
                    value={field.value}
                    onChange={field.onChange}
                    parseFile={parseFile}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    control={control}
                    mode={mode}
                    page={page}
                    caseId={caseId}
                    errors={errors}
                    setValue={setValue}
                    fileData={selectedData?.templates}
                    versionOptions={selectedData?.versionNumbers || []}
                    handleFileUpload={handleFileUpload}
                    setIsTemplateLoading={setIsTemplateLoading}
                    isTemplateLoading={isTemplateLoading}
                  />
                )}
              />
            </div>

            {sidebarOpen && (
              <SideOptionsForm
                control={control}
                watch={watch}
                errors={errors}
                mode={mode}
                caseId={caseId}
                firmId={firmId}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};

export default TemplateForm;
