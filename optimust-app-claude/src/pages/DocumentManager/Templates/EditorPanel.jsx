import {
  FaChevronLeft,
  FaRegWindowMaximize,
  FaRegWindowMinimize,
  FaUpload,
  FaDownload,
  FaTrash,
  FaFilePdf,
  FaFileWord,
  FaUndo,
  FaCloudUploadAlt,
} from "react-icons/fa";

import SelectField from "../../../components/Forms/Select/Select";
import Field from "../../../components/Forms/Field";
import { apiRequest } from "../../../services/apiBinding";
import VersionSelectField from "./VersionSelectionField";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import classNames from "classnames";
import { useQueryClient } from "@tanstack/react-query";

const EditorPanel = ({
  isFullscreen,
  fileData,
  setIsFullscreen,
  sidebarOpen,
  setSidebarOpen,
  caseId,
  mode,
  page,
  control,
  setValue,
  errors,
  versionOptions,
  setIsTemplateLoading,
}) => {
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();
  const getFileIcon = (fileName = "") => {
    if (fileName?.toLowerCase()?.includes(".pdf")) {
      return <FaFilePdf className="text-red-500 text-3xl" />;
    }

    return <FaFileWord className="text-blue-500 text-3xl" />;
  };

  const handleDownload = async (file) => {
    try {
      console.log("handle Download");
      if (file) {
        const url = URL.createObjectURL(file);
        window.open(url);
        return;
      }
      console.log("fileData", fileData);
      const response = await queryClient.fetchQuery({
        queryKey: ["file-download", fileData?.imageId],
        queryFn: () =>
          apiRequest({
            apiPath: `Blob/download-bytes?containerName=template-documents&fileName=${fileData?.blobName}`,
            apiClient: "dm",
            method: "get",
            config: { responseType: "arraybuffer" },
            noErrorHandle: true,
          }),
      });

      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Trigger download as DOCX
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileData?.unc;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const validateFile = (selectedFile, onChange) => {
    if (!selectedFile) return;

    const validTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.info("Only DOC and DOCX files are allowed.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    onChange(selectedFile);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* TOP BAR */}
      <div className="sticky top-[2.7rem] bg-(--foreground) z-40 flex flex-wrap items-center justify-between gap-3 border border-gray-200 rounded-xl py-2 px-3 shadow-sm">
        <div className="flex gap-2">
          {mode === "DMTemplates" && (
            <div className="w-70">
              <Field
                controller={{
                  name: "selectedTemplate",
                  control,
                  render: ({ field }) => {
                    const handleTemplateChange = async (val) => {
                      field.onChange(val);

                      const resetTemplateFields = () => {
                        setValue("templateValue", "");
                        setValue("name", "");
                        setValue("defaultCaseFolderId", "");
                        setValue("UnbindedCodes", []);
                        setValue("BindedMargeCodes", []);
                        setValue("versionId", "");
                        setValue("file", null);
                      };

                      if (!val?.value) {
                        resetTemplateFields();
                        return;
                      }

                      try {
                        setIsTemplateLoading(true);

                        const res = await apiRequest({
                          apiPath: `Template/GetTemplateValueDetails?CaseId=${caseId}&templateId=${val.value}`,
                          apiClient: "dm",
                        });

                        setValue(
                          "templateValue",
                          res?.Result || "No Template Found",
                        );

                        setValue("name", val?.label);

                        setValue("versionId", val?.VersionId || "");

                        setValue(
                          "defaultCaseFolderId",
                          res?.FolderNames?.[0] || "",
                        );

                        setValue("UnbindedCodes", res?.UnbindedCodes || []);

                        setValue("BindedMargeCodes", res?.BindedCodes || []);

                        setIsTemplateLoading(false);
                      } catch (error) {
                        console.error("Template fetch error:", error);

                        resetTemplateFields();

                        setIsTemplateLoading(false);
                      }
                    };

                    return (
                      <SelectField
                        {...field}
                        placeholder="Template"
                        onChange={handleTemplateChange}
                        invalid={field?.error}
                        payload={{
                          dataTable: "dmTemplates",
                          dataField: "name",
                          searchTerm: "",
                        }}
                      />
                    );
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          {mode !== "DMTemplates" && (
            <button
              type="button"
              className="
                p-2.5 border border-gray-300 rounded-lg
                hover:bg-white hover:shadow-sm
                transition-all duration-200
              "
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <FaRegWindowMinimize className="text-gray-600" size={16} />
              ) : (
                <FaRegWindowMaximize className="text-gray-600" size={16} />
              )}
            </button>
          )}

          {page === "templates" && mode === "edit" && versionOptions && (
            <div className="border rounded-lg px-3 py-1 bg-white shadow-sm">
              <VersionSelectField
                control={control}
                versionOptions={versionOptions}
              />
            </div>
          )}

          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                p-2 bg-white border border-gray-200
                rounded-full hover:shadow-md
                transition-all duration-200
              "
            >
              <FaChevronLeft />
            </button>
          )}
        </div>
      </div>

      {/* FILE SECTION */}
      {/* FILE SECTION */}
      <Field
        controller={{
          name: "file",
          control,
          rules: {
            required: !fileData?.unc && "Template file is required",
          },
          render: ({ field }) => {
            const file = field.value;
            console.log("fileData", fileData);
            const existingFile = fileData?.unc
              ? {
                  name: fileData?.unc,
                  blobName: fileData?.blobName,
                  // type:
                  // size:
                }
              : null;

            const displayFile = file || existingFile;
            console.log("displayFile", displayFile);

            const handleSelectFile = () => {
              fileInputRef.current?.click();
            };

            const isReplacingExistingFile = !!file && !!existingFile;

            return (
              <>
                <input
                  type="file"
                  accept=".doc,.docx"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];

                    validateFile(selectedFile, field.onChange);
                  }}
                />

                <div
                  onClick={handleSelectFile}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => {
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);

                    const droppedFile = e.dataTransfer.files?.[0];

                    validateFile(droppedFile, field.onChange);
                  }}
                  className={classNames(
                    `
                relative overflow-hidden
                border-2 border-dashed rounded-xl
                min-h-[124px]
                transition-all duration-300
                cursor-pointer group
              `,
                    {
                      "border-primary bg-primary/5 shadow-md": isDragging,

                      "border-gray-300 bg-white hover:border-primary hover:shadow-md":
                        !isDragging,

                      "border-red-300": errors?.file,
                    },
                  )}
                >
                  {!displayFile ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
                      {/* ICON */}
                      <div
                        className="
                    w-14 h-14 rounded-full
                    bg-primary/10
                    flex items-center justify-center
                    mb-4
                  "
                      >
                        <FaCloudUploadAlt className="text-3xl text-primary" />
                      </div>

                      <h3 className="text-base font-semibold text-gray-800">
                        Upload Template
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Drag & drop or click to browse
                      </p>

                      <div className="mt-4 flex gap-2">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                          DOC
                        </span>

                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                          DOCX
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div
                        className="
                    bg-gray-50 border border-gray-200
                    rounded-xl p-4
                    flex items-center justify-between gap-4
                  "
                      >
                        {/* FILE INFO */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="
                        w-12 h-12 rounded-xl
                        bg-white border
                        flex items-center justify-center
                        shrink-0
                      "
                          >
                            {getFileIcon(displayFile?.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-gray-800 truncate">
                              {displayFile?.name}
                            </p>

                            {file?.size && (
                              <p className="text-xs text-gray-500 mt-1">
                                {(file?.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}

                            <p className="text-xs text-primary mt-1">
                              Click to replace file
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
                          {/* DOWNLOAD */}
                          {displayFile && (
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // ADD THIS
                                handleDownload(file);
                              }}
                            >
                              <FaDownload className="text-gray-700 text-sm" />
                            </a>
                          )}

                          {/* UNDO */}
                          {isReplacingExistingFile ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                field.onChange(null);

                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                              className="
                          h-9 w-9 rounded-lg
                          border border-yellow-200
                          bg-yellow-50
                          flex items-center justify-center
                          hover:bg-yellow-100
                          transition-all duration-200
                        "
                            >
                              <FaUndo className="text-yellow-600 text-sm" />
                            </button>
                          ) : (
                            file && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  field.onChange(null);

                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                                className="
                            h-9 w-9 rounded-lg
                            border border-red-200
                            bg-red-50
                            flex items-center justify-center
                            hover:bg-red-100
                            transition-all duration-200
                          "
                              >
                                <FaTrash className="text-red-500 text-sm" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          },
        }}
      />

      {errors?.file && (
        <p className="text-red-500 text-sm ml-1 font-medium">
          {errors?.file?.message}
        </p>
      )}
    </div>
  );
};

export default EditorPanel;
