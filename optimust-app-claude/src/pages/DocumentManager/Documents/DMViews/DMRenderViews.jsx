import React, { useRef } from "react";
import DMGridView from "./DMGridView";
import DMTableView from "./DMTableView";
import AllCasesTableView from "./AllCasesView";
import { FolderOpen } from "lucide-react";

const DMRenderView = ({
  files,
  allCases,
  viewMode,
  isAllCasesView,
  allCaseFolders,
  selectedCase,
  selectedFiles,
  setSelectedFiles,
  setFiles,
  setSelectedCase,
  entityCodeId,
  isMailDoc,
  parentEntityId,
}) => {
  const openOverlayRef = useRef(null);

  if (isAllCasesView) {
    return (
      <AllCasesTableView
        filesToRender={allCases}
        setSelectedCase={setSelectedCase}
      />
    );
  }

  if (!files?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl bg-gray-50">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-2">
          <FolderOpen className="w-5 h-5 text-(--text-inverse)" />
        </div>

        <h3 className="text-sm font-semibold text-(--text-inverse)">
          No Files Found
        </h3>

        <p className="mt-1 text-xs text-(--text-inverse) text-center max-w-xs">
          No files were found in this folder. Upload files or modify your search
          criteria.
        </p>
      </div>
    );
  }

  const closeOtherOverlays = () => {
    if (openOverlayRef.current) {
      openOverlayRef.current.hide(); // Close previously opened overlay
      openOverlayRef.current = null;
    }
  };

  const toggleSelect = (file) => {
    setSelectedFiles((prev) => {
      const exists = prev.some((f) => f.imageId === file.imageId);
      return exists
        ? prev.filter((f) => f.imageId !== file.imageId)
        : [...prev, file];
    });
  };

  const sharedProps = {
    filesToRender: files,
    setFiles,
    currentCaseFolders: allCaseFolders?.folders,
    selectedCase,
    selectedFiles,
    setSelectedFiles,
    openOverlayRef,
    closeOtherOverlays,
    toggleSelect,
    entityCodeId,
    isMailDoc,
    parentEntityId,
  };

  return viewMode === "grid" ? (
    <DMGridView {...sharedProps} />
  ) : (
    <DMTableView {...sharedProps} />
  );
};

export default DMRenderView;
