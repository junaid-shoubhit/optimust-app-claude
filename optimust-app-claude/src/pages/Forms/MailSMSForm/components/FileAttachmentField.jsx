import React from "react";
import { Controller, useWatch } from "react-hook-form";

const FileAttachmentField = React.memo(
  ({
    name,
    control,
    setValue,
    hasCaseSelected,
    isViewingCaseDocument,
    onToggleCaseDocument,
  }) => {
    const documents = useWatch({
      control,
      name: "documents",
      defaultValue: [],
    });

    const handleRemoveDocument = (index) => {
      const updatedDocuments = documents.filter(
        (_, documentIndex) => documentIndex !== index,
      );

      setValue("documents", updatedDocuments, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    };

    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const uploadedFiles = Array.isArray(field.value)
            ? field.value
            : field.value
              ? [field.value]
              : [];

          /* ---------------------------------------------------- */
          /* ADD LOCAL FILES                                      */
          /* ---------------------------------------------------- */

          const handleFileChange = (event) => {
            const newFiles = Array.from(event.target.files || []);

            if (!newFiles.length) {
              return;
            }

            setValue(name, [...uploadedFiles, ...newFiles], {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            // Allow selecting the same file again
            event.target.value = "";
          };

          /* ---------------------------------------------------- */
          /* REMOVE LOCAL FILE                                    */
          /* ---------------------------------------------------- */

          const handleRemoveUploadedFile = (index) => {
            const updatedFiles = uploadedFiles.filter(
              (_, fileIndex) => fileIndex !== index,
            );

            setValue(name, updatedFiles, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          };

          const totalAttachments = documents.length + uploadedFiles.length;

          return (
            <div className="space-y-3">
              {/* ================================================== */}
              {/* HEADER                                             */}
              {/* ================================================== */}

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Attach Document
                </label>

                {hasCaseSelected && (
                  <button
                    type="button"
                    onClick={onToggleCaseDocument}
                    className={`text-xs font-medium transition-colors ${
                      isViewingCaseDocument
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-primary hover:underline"
                    }`}
                  >
                    {isViewingCaseDocument ? "Close" : "View Case Document"}
                  </button>
                )}
              </div>

              {/* ================================================== */}
              {/* ATTACHMENT LIST                                    */}
              {/* ================================================== */}

              {totalAttachments > 0 && (
                <div className="space-y-2">
                  {/* ------------------------------------------------ */}
                  {/* CASE DOCUMENTS                                   */}
                  {/* ------------------------------------------------ */}

                  {documents.map((document, index) => (
                    <div
                      key={`case-${document.unc}-${index}`}
                      className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-xl"
                    >
                      {/* Icon */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <i className="pi pi-file text-sm" />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium text-gray-700 truncate"
                          title={document.fileName}
                        >
                          {document.fileName}
                        </p>

                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-blue-600 font-medium">
                            Case Document
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove document"
                      >
                        <i className="pi pi-times text-xs" />
                      </button>
                    </div>
                  ))}

                  {/* ------------------------------------------------ */}
                  {/* LOCAL FILES                                     */}
                  {/* ------------------------------------------------ */}

                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`local-${file.name}-${file.lastModified}-${index}`}
                      className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-xl"
                    >
                      {/* Icon */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 shrink-0">
                        <i className="pi pi-paperclip text-sm" />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium text-gray-700 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-green-600 font-medium">
                            Local File
                          </span>

                          {file.size && (
                            <>
                              <span className="text-[10px] text-gray-300">
                                •
                              </span>

                              <span className="text-[10px] text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedFile(index)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove file"
                      >
                        <i className="pi pi-times text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ================================================== */}
              {/* ADD FILE AREA                                     */}
              {/* ================================================== */}

              <label className="flex items-center gap-3 w-full px-3 py-3 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-gray-50 transition-all">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />

                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-500">
                  <i className="pi pi-paperclip text-sm" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">
                    Add files from your computer
                  </p>

                  <p className="text-[10px] text-gray-400 mt-0.5">
                    PDF, DOC, DOCX, JPG, PNG • Multiple files supported
                  </p>
                </div>

                <i className="pi pi-plus text-xs text-gray-400" />
              </label>

              {/* ================================================== */}
              {/* LEGEND                                             */}
              {/* ================================================== */}

              {totalAttachments > 0 && (
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-gray-500">
                      Case Document
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] text-gray-500">
                      Local File
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
    );
  },
);

FileAttachmentField.displayName = "FileAttachmentField";

export default FileAttachmentField;
