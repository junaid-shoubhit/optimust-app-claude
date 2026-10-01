import { OverlayPanel } from "primereact/overlaypanel";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { FaUpload } from "react-icons/fa";
import DMAdd from "./DMAdd";
// import DMLink from "./DMLink";
// import DMTemplates from "./DMTemplates";
import DMGeneratePDF from "./DMGeneratePDF";

const DMUpload = ({
  selectedCase,
  isConverted = false,
  currentCaseFolders,
  setFiles,
  entityCodeId,
  clientName,
  setUploadedFiles,
  droppedFiles,
  onDroppedFileHandled,
}) => {
  const fileMenuRef = useRef(null);

  const [uploading, setUploading] =
    useState(false);

  const isDisabled =
    !selectedCase || isConverted;

  const uploadTooltip = isConverted
    ? "Upload disabled: Intake converted to Case."
    : !selectedCase
      ? "Please select Case or Folder to Upload."
      : undefined;

  const addFileToActive = (
    newFile = [],
  ) => {
    if (!newFile?.length) return;

    if (setFiles) {
      setFiles((prevFiles) => [
        ...newFile,
        ...prevFiles,
      ]);
    } else if (setUploadedFiles) {
      setUploadedFiles((prev) => [
        ...newFile,
        ...prev,
      ]);
    }
  };

  const handleUploadClick = (e) => {
    if (
      isConverted ||
      !selectedCase
    ) {
      return;
    }

    fileMenuRef.current?.toggle(e);
  };

  return (
    <>
      <Tooltip
        target=".upload-new-btn"
        position="top"
        showDelay={300}
      />

      {/* Upload New Button */}
      <button
        type="button"
        onClick={
          handleUploadClick
        }
        data-pr-tooltip={
          uploadTooltip
        }
        className={`upload-new-btn flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${
          isDisabled
            ? "cursor-not-allowed bg-gray-300 text-gray-600"
            : "bg-(--background-secondary) text-(--foreground) hover:opacity-90"
        }`}
      >
        <FaUpload size={12} />

        {!clientName &&
          "Upload New"}
      </button>

      {/* 
        IMPORTANT:
        DMAdd is mounted OUTSIDE OverlayPanel.

        This allows droppedFile to be processed
        immediately without opening Upload New.
      */}
      <DMAdd
        fileMenuRef={
          fileMenuRef
        }
        uploading={
          uploading
        }
        setUploading={
          setUploading
        }
        addFileToActive={
          addFileToActive
        }
        caseId={
          selectedCase?.allCases
            ?.selectedCaseIds ||
          selectedCase?.caseDetails
            ?.caseId
        }
        folderId={
          selectedCase?.selectedFolder
            ?.nodeName
        }
        folderNewId={
          selectedCase?.selectedFolder
            ?.id
        }
        currentCaseFolders={
          currentCaseFolders
        }
        isAllCase={
          selectedCase?.allCases
            ?.selectedCaseIds ||
          selectedCase?.caseDetails
        }
        entityCodeId={
          entityCodeId
        }
        droppedFiles={
          droppedFiles
        }
        onDroppedFileHandled={
          onDroppedFileHandled
        }
        renderButton={false}
      />

      {/* Overlay Panel */}
      <OverlayPanel
        ref={fileMenuRef}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <ul className="w-60 space-y-1">
          {/* New Document */}
          <DMAdd
            fileMenuRef={
              fileMenuRef
            }
            uploading={
              uploading
            }
            setUploading={
              setUploading
            }
            addFileToActive={
              addFileToActive
            }
            caseId={
              selectedCase?.allCases
                ?.selectedCaseIds ||
              selectedCase?.caseDetails
                ?.caseId
            }
            folderId={
              selectedCase?.selectedFolder
                ?.nodeName
            }
            folderNewId={
              selectedCase?.selectedFolder
                ?.id
            }
            currentCaseFolders={
              currentCaseFolders
            }
            isAllCase={
              selectedCase?.allCases
                ?.selectedCaseIds ||
              selectedCase?.caseDetails
            }
            entityCodeId={
              entityCodeId
            }
            renderButton={true}
            onlyButton={true}
          />

          {/* Generate PDF */}
          <DMGeneratePDF
            fileMenuRef={
              fileMenuRef
            }
            addFileToActive={
              addFileToActive
            }
            caseId={
              selectedCase?.allCases
                ?.selectedCaseIds ||
              selectedCase?.caseDetails
                ?.caseId
            }
            folderId={
              selectedCase?.selectedFolder
                ?.id
            }
            currentCaseFolders={
              currentCaseFolders
            }
            entityCodeId={
              entityCodeId
            }
            isAllCase={
              selectedCase?.allCases
                ?.selectedCaseIds ||
              selectedCase?.caseDetails
            }
            clientName={
              clientName
            }
          />
        </ul>
      </OverlayPanel>
    </>
  );
};

export default DMUpload;