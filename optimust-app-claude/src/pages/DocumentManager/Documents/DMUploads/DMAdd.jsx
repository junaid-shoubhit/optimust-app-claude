import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../services/apiBinding";
import { confirmDialog } from "primereact/confirmdialog";
import CaseFolderSelector from "./CaseFolderSelector";

const DMAdd = ({
  addFileToActive,
  caseId,
  folderId,
  folderNewId,
  currentCaseFolders,
  // setUploadedFiles,
  uploading,
  setUploading,
  entityCodeId,
  fileMenuRef,
  droppedFiles = [],
  onDroppedFileHandled,
  renderButton = true,
  onlyButton = false,
}) => {
  const fileInputRef = useRef(null);
  const [showSelector, setShowSelector] = useState(false);
  const [resolvedCaseData, setResolvedCaseData] = useState(null);

  // --------------------------------
  // OPEN FILE PICKER
  // --------------------------------

  const openFilePicker = () => {
    if (uploading) return;

    if (!caseId) {
      setShowSelector(true);
      return;
    }

    fileInputRef.current?.click();
  };

  // --------------------------------
  // OVERWRITE CONFIRMATION
  // --------------------------------

  const confirmOverwrite = () => {
    return new Promise((resolve) => {
      let resolved = false;

      const finish = (value) => {
        if (resolved) return;

        resolved = true;
        resolve(value);
      };

      confirmDialog({
        header: "Overwrite File",
        closable: true,
        closeOnEscape: true,
        className: "rounded-2xl overflow-hidden",
        message: (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <i className="pi pi-file text-amber-600 text-2xl" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              File Already Exists
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              One or more documents with the same name already exist in this
              folder. Overwriting will replace the existing files permanently.
            </p>
          </div>
        ),

        acceptLabel: "Overwrite File",
        rejectLabel: "Keep Existing",

        acceptClassName:
          "!bg-red-600 hover:!bg-red-700 !border-red-600 px-4 py-2",

        rejectClassName:
          "!bg-white !text-gray-700 !border-gray-300 hover:!bg-gray-50 px-4 py-2",

        acceptIcon: "pi pi-refresh",
        rejectIcon: "pi pi-times",

        accept: () => finish(true),
        reject: () => finish(false),
        onHide: () => finish(false),
      });
    });
  };

  // --------------------------------
  // UPLOAD MULTIPLE FILES
  // --------------------------------

  const uploadDMFile = async ({
    files,
    id,
    nodeForGrid,
    caseIds,
    forceOverwrite = false,
    intNodeId,
  }) => {
    // --------------------------------
    // UPLOAD MULTIPLE FILES
    // --------------------------------

    const formData = new FormData();

    formData.append("Id", id);
    formData.append("Chunk", 0);
    formData.append("Chunks", 1);
    formData.append("NodeForGrid", nodeForGrid);
    formData.append("NodeId", intNodeId || -1);

    formData.append(
      "CaseIds",
      Array.isArray(caseIds) ? caseIds.join(",") : caseIds,
    );

    formData.append("ForceOverwrite", forceOverwrite);

    formData.append("EntityCodeId", entityCodeId ?? 0);

    // Append all files
    files.forEach((file) => {
      formData.append("File", file, file.name);

      formData.append("Name", file.name);

      formData.append(
        "FileName",
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
      );

      formData.append("Extension", "." + file.name.split(".").pop());
    });

    return await apiRequest({
      apiPath: "fileuploadlarge/UploadChunkDocumentMulti",
      payload: formData,
      method: "post",
      apiClient: "dm",
      config: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    });
  };

  // --------------------------
  // FILE CHOOSER CLICK LOGIC
  // --------------------------

  const processFileUpload = async (
    selectedFiles,
    selectorData = resolvedCaseData,
  ) => {
    console.log("========== PROCESS FILE UPLOAD ==========");

    const files = Array.from(selectedFiles || []);

    console.log("Files received:", files);

    if (!files.length) {
      console.error("No files received");

      return;
    }

    try {
      setUploading(true);

      const allowed = [
        "pdf",
        "docx",
        "jpeg",
        "jpg",
        "png",
        "mp4",
        "mov",
        "heic",
        "heif",
        "webp",
      ];

      const validFiles = [];
      const invalidFiles = [];

      files.forEach((file) => {
        if (!(file instanceof File)) {
          invalidFiles.push(file);
          return;
        }

        const ext = file.name.split(".").pop().toLowerCase();

        if (!allowed.includes(ext)) {
          invalidFiles.push(file);
          return;
        }

        validFiles.push(file);
      });

      if (invalidFiles.length) {
        toast.info(
          "Only PDF, DOCX, JPEG, JPG, PNG, MP4, MOV, HEIC, HEIF, and WEBP files are allowed",
        );
      }

      if (!validFiles.length) {
        return;
      }

      // --------------------------------
      // RESOLVE CASE / FOLDER
      // --------------------------------

      const activeCase = selectorData?.caseId || caseId;

      const activeFolder = selectorData?.folderId || folderId;

      const activeFolderId = selectorData?.folderId || folderNewId;

      if (!activeCase) {
        toast.error("Please select a Case before uploading.");

        return;
      }

      const id = Date.now();

      const nodeForGrid = activeFolder
        ? `${activeCase}/${selectorData?.folderName || activeFolder}`
        : activeCase;

      // --------------------------------
      // UPLOAD
      // --------------------------------

      let res = await uploadDMFile({
        files: validFiles,
        id,
        nodeForGrid,
        caseIds: activeCase,
        intNodeId: activeFolderId,
      });

      // --------------------------------
      // FILE ALREADY EXISTS
      // --------------------------------

      if (res?.isExists === "exists" || res?.statusCode === 409) {
        const shouldOverwrite = await confirmOverwrite();

        if (!shouldOverwrite) {
          return;
        }

        // --------------------------------
        // RE-UPLOAD WITH OVERWRITE
        // --------------------------------

        res = await uploadDMFile({
          files: validFiles,
          id,
          nodeForGrid,
          caseIds: activeCase,
          forceOverwrite: true,
          intNodeId: activeFolderId,
        });
      }

      // --------------------------------
      // UPLOAD SUCCESS
      // --------------------------------

      if (res?.success !== false) {
        if (res?.documentList?.length) {
          addFileToActive(res.documentList);
        }

        toast.success(
          validFiles.length === 1
            ? "File uploaded successfully"
            : `${validFiles.length} files uploaded successfully`,
        );

        fileMenuRef?.current?.hide?.();
      } else if (res?.message) {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Upload error:", error);

      toast.error(error?.message || "File upload failed");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // --------------------------------
  // FILE INPUT CHANGE
  // --------------------------------

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    console.log("Normal files selected:", files);

    await processFileUpload(files);
  };

  // --------------------------------
  // CASE/FOLDER SELECTOR
  // --------------------------------

  const onSelectorComplete = (data) => {
    setResolvedCaseData(data);

    setShowSelector(false);

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  // --------------------------------
  // DRAG/DROP UPLOAD
  // --------------------------------

  useEffect(() => {
    if (!droppedFiles?.length) {
      return;
    }

    const uploadDroppedFiles = async () => {
      try {
        await processFileUpload(droppedFiles, null);
      } catch (error) {
        console.error("Dropped upload error:", error);
      } finally {
        onDroppedFileHandled?.();
      }
    };

    uploadDroppedFiles();
  }, [droppedFiles]);

  // --------------------------------
  // HIDDEN FILE INPUT
  // --------------------------------

  const fileInput = (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileUpload}
      className="hidden"
      multiple
      accept=".pdf,.docx,.jpeg,.jpg,.png,.mp4,.mov,.heic,.heif,.webp"
    />
  );

  // --------------------------------
  // ONLY BUTTON
  // --------------------------------

  if (onlyButton) {
    return (
      <>
        {fileInput}

        <li>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className={`w-full text-left px-3 py-1 rounded hover:bg-gray-100 ${
              uploading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {uploading ? (
              <div className="flex items-center gap-2 w-full">
                <div className="relative">
                  <i className="pi pi-spin pi-spinner text-blue-600 text-lg" />

                  <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
                </div>

                <span className="font-semibold text-blue-700 animate-pulse">
                  Uploading...
                </span>
              </div>
            ) : (
              <>📂 New Document (Upload)</>
            )}
          </button>
        </li>
      </>
    );
  }

  // --------------------------------
  // NORMAL RENDER
  // --------------------------------

  return (
    <>
      {fileInput}

      {renderButton && (
        <li>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="w-full text-left px-3 py-1 rounded hover:bg-gray-100"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <i className="pi pi-spin pi-spinner text-blue-600 text-lg" />

                <span className="font-semibold text-blue-700">
                  Uploading...
                </span>
              </div>
            ) : (
              <>📂 New Document (Upload)</>
            )}
          </button>
        </li>
      )}

      <CaseFolderSelector
        visible={showSelector}
        onHide={() => setShowSelector(false)}
        onComplete={onSelectorComplete}
        currentCaseFolders={currentCaseFolders}
      />
    </>
  );
};

export default DMAdd;
