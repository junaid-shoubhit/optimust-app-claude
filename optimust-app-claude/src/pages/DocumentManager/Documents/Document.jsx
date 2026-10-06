import { useMemo, useState, useCallback, useEffect } from "react";
import { FaRegFolder, FaThLarge, FaList, FaSearch } from "react-icons/fa";
import { Paginator } from "primereact/paginator";

import DMSidebar from "./DMSidebar/DMSidebar";
import DMUpload from "./DMUploads/DMUpload";
import DMMoveCopy from "./DMActions/DMMoveCopy";
import DMDelete from "./DMActions/DMDelete";
import DMRenderView from "./DMViews/DMRenderViews";
import DMLoadingSkeleton from "./DMSkeleton";
import { useDMSearch } from "./DMSidebar/DMSearch/useDMSearch";
import { useAppNavigation } from "../../../navigation/NavigationContext";
import { Skeleton } from "primereact/skeleton";
import { MdAttachFile } from "react-icons/md";

import useDMDragDrop from "./DMUploads/hooks/useDMDragDrop";
import DMDragDropOverlay from "./DMUploads/DMDragDropOverlay";

const Document = ({
  SearchParm,
  entityCodeId: propsEntityCodeId,
  entityId: parentEntityId,
  setSelectedDetails,
  uploadedFiles = [],
  isMailDoc,
  onCloseDoc,
  handleAttachement,
  isConverted,
}) => {
  const { activeMenu } = useAppNavigation();
  const isNested = !!propsEntityCodeId;
  const entityCodeId = propsEntityCodeId || activeMenu?.entityCodeId;
  const [allCaseFolders, setAllCaseFolders] = useState({});
  const [allCases, setAllCases] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  // File Name Search
  const [fileNameSearch, setFileNameSearch] = useState("");
  const [isFileNameSearched, setIsFileNameSearched] = useState(false);
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [advancedQuery, setAdvancedQuery] = useState(null);

  const {
    searchDocuments,
    fileLoading,
    folderLoading,
    caseTotalCount,
    fileTotalCount,
  } = useDMSearch({
    setAllCases,
    setAllCaseFolders,
    setSelectedCase,
    setSelectedDetails,
    setSelectedFiles,
    setFiles,
    entityCodeId,
    SearchParm,
  });

  const resetPagination = () => {
    setPage(1);
    setPageSize(15);
  };

  const { mainTitle, isAllCasesView } = useMemo(() => {
    if (selectedCase?.allCases)
      return { mainTitle: "All Cases", isAllCasesView: true };

    if (selectedCase?.allCasesFiles)
      return { mainTitle: "All Cases Files", isAllCasesView: false };

    if (selectedCase?.caseDetails) {
      const caseNum = selectedCase.caseDetails.caseNumber;
      const folderName = selectedCase.selectedFolder?.name || "";
      return {
        mainTitle: folderName ? `${caseNum} / ${folderName}` : caseNum,
        isAllCasesView: false,
      };
    }

    return { mainTitle: "Select Case or Folder", isAllCasesView: false };
  }, [selectedCase]);

  // Correct total records based on backend DataSize
  const totalRecords = selectedCase?.allCases ? caseTotalCount : fileTotalCount;

  // Select All Logic
  const isAllSelected = useMemo(
    () =>
      selectedCase && files.length > 0 && selectedFiles.length === files.length,
    [selectedFiles, selectedCase, files.length],
  );

  const handleSelectAllToggle = useCallback(() => {
    if (!selectedCase) return;
    setSelectedFiles((prev) => (prev.length === files.length ? [] : files));
  }, [selectedCase, files]);

  const displayFiles = useMemo(() => {
    const map = new Map();

    [...uploadedFiles, ...files].forEach((file) => {
      map.set(file.imageId || file.imageId, file);
    });

    return [...map.values()];
  }, [uploadedFiles, files]);

  useEffect(() => {
    if (!SearchParm) return;

    searchDocuments({
      SearchParm,
      Page: 1,
      PageSize: 15,
    });
  }, [SearchParm]);

  // --------------------------------
  // FILE NAME SEARCH
  // --------------------------------

  const searchCurrentLocation = useCallback(
    (fileName = fileNameSearch) => {
      const payload = {};

      // Folder selected
      if (selectedCase?.selectedFolder?.id) {
        payload.FileNos = selectedCase?.caseDetails?.caseNumber;
        payload.folderId = selectedCase.selectedFolder.id;
      }

      // Case selected
      else if (selectedCase?.caseDetails) {
        payload.FileNos = selectedCase.caseDetails.caseNumber;
      }

      // All Cases Files
      else if (selectedCase?.allCasesFiles) {
        payload.FileNos = "";
      }

      // Global search
      else {
        payload.FileNos = "";
      }

      // File Name filter
      if (fileName?.trim()) {
        payload.FileName = fileName.trim();
      }

      searchDocuments(payload, "files");
    },
    [selectedCase, fileNameSearch, searchDocuments],
  );

  const handleFileNameSearch = useCallback(() => {
    if (!fileNameSearch.trim()) return;
    setIsFileNameSearched(true);
    resetPagination();

    searchCurrentLocation(fileNameSearch);
  }, [fileNameSearch, searchCurrentLocation]);

  const handleClearFileNameSearch = useCallback(() => {
    setFileNameSearch("");
    setIsFileNameSearched(false);
    resetPagination();

    searchCurrentLocation("");
  }, [searchCurrentLocation]);

  // --------------------------------
  // DRAG AND DROP
  // --------------------------------

  const canDropFile =
    !isMailDoc &&
    !!selectedCase &&
    !isConverted &&
    selectedCase?.selectedFolder?.id !== "drafts";

  const {
    droppedFiles,
    isDraggingFile,
    isDropUploading,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDroppedFileHandled,
  } = useDMDragDrop({
    canDropFile,
  });

  return (
    <div className="flex bg-(--foreground)">
      {/* Sidebar */}
      <DMSidebar
        allCaseFolders={allCaseFolders}
        allCases={allCases}
        SearchParm={SearchParm}
        selectedCase={selectedCase}
        isFiles={!!files.length}
        searchDocuments={searchDocuments}
        setSelectedCase={(c) => {
          resetPagination();
          setSelectedCase(c);

          if (setSelectedDetails) {
            setSelectedDetails(c);
          }
        }}
        advancedQuery={advancedQuery}
        setAdvancedQuery={setAdvancedQuery}
        loading={folderLoading}
        page={page}
        pageSize={pageSize}
        isNested={isNested}
        isMailDoc={isMailDoc}
        onCloseDoc={onCloseDoc}
        fileNameSearch={fileNameSearch}
        searchCurrentLocation={searchCurrentLocation}
        onPrimarySearch={() => setFileNameSearch("")}
      />

      {/* Main Section */}
      <main className="flex-1 overflow-auto ">
        {/* Header */}
        {/* Header */}
        <div className="p-2 flex justify-between items-center border-b-[0.5px] border-(--border-inverse)">
          {/* Title */}
          <div className="flex items-center min-w-0">
            {fileLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton shape="circle" width="1rem" height="1rem" />
                <Skeleton width="140px" height="1.25rem" borderRadius="4px" />
              </div>
            ) : (
              <h2
                className={`${isMailDoc ? "text-xs" : "text-sm"} font-bold flex items-center gap-2 text-[#2e2e2e]`}
              >
                <FaRegFolder className="text-[#F59E0B]" />
                {mainTitle}
              </h2>
            )}
          </div>

          {/* File Name Search */}
          {!isMailDoc && (
            <div className="flex items-center gap-2 ml-auto mr-3">
              <div className="relative">
                <input
                  type="text"
                  value={fileNameSearch}
                  onChange={(e) => setFileNameSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFileNameSearch();
                    }
                  }}
                  placeholder="Search File Name..."
                  className="h-8 w-60 pl-3 pr-8 text-xs border-[0.5px] rounded-md outline-none border-(--border-inverse) bg-(--foreground) transition-all duration-200 focus:border-(--background-secondary) focus:ring-1 focus:ring-(--background-secondary)/20 placeholder:text-gray-400"
                />

                {/* Input action: Loader / Clear */}
                {fileLoading ? (
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    title="Clear search"
                  >
                    <i className="pi pi-spinner animate-spin text-[10px]" />
                  </button>
                ) : (
                  isFileNameSearched && (
                    <button
                      type="button"
                      onClick={handleClearFileNameSearch}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                      title="Clear"
                    >
                      <i className="pi pi-times text-[10px]" />
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={handleFileNameSearch}
                disabled={fileLoading || !fileNameSearch.trim()}
                className="h-8 w-8 flex items-center justify-center rounded-md bg-(--background-secondary) text-white shadow-sm hover:opacity-90 hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Search File Name"
              >
                <FaSearch size={12} />
              </button>
            </div>
          )}
          {/* Attachment */}
          {isMailDoc && selectedFiles?.length > 0 && (
            <button
              disabled={!selectedCase}
              type="button"
              onClick={() => handleAttachement?.(selectedFiles)}
              className={`flex text-[10px] items-center gap-0.5 py-1 px-2 rounded-lg transition ${
                selectedCase
                  ? "bg-(--background-secondary) text-(--foreground) hover:opacity-90"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              <MdAttachFile size={12} /> Add to Attachement
            </button>
          )}

          {/* Toolbar */}
          {!isMailDoc && (
            <div>
              {selectedFiles.length === 0 ? (
                <div className="flex gap-2">
                  {selectedCase?.selectedFolder?.id !== "drafts" && (
                    <DMUpload
                      isConverted={isConverted}
                      selectedCase={selectedCase}
                      setFiles={setFiles}
                      currentCaseFolders={allCaseFolders?.folders}
                      entityCodeId={entityCodeId}
                      droppedFiles={droppedFiles}
                      onDroppedFileHandled={handleDroppedFileHandled}
                    />
                  )}

                  {["grid", "list"].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2 border-[0.5px] border-(--border-inverse) rounded transition ${
                        viewMode === mode
                          ? "bg-(--background-secondary) text-(--foreground)"
                          : "bg-(--foreground) hover:bg-gray-300"
                      }`}
                    >
                      {mode === "grid" ? (
                        <FaThLarge size={12} />
                      ) : (
                        <FaList size={12} />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <ul className="flex items-center gap-4 bg-(--background-heading-active) px-3 border rounded">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={isAllSelected}
                      onChange={handleSelectAllToggle}
                    />
                    <span>Select All</span>
                  </label>

                  <DMMoveCopy
                    actionType="move"
                    selectedFile={selectedFiles}
                    setFiles={setFiles}
                    caseId={
                      selectedCase?.caseId || selectedCase?.selectedFolder?.id
                    }
                    currentCaseFolders={allCaseFolders?.folders}
                    selectedFolder={selectedCase?.selectedFolder}
                    setSelectedFiles={setSelectedFiles}
                    selectedFiles={selectedFiles}
                    entityCodeId={entityCodeId}
                  />

                  <DMDelete
                    setFiles={setFiles}
                    selectedFile={selectedFiles}
                    caseId={
                      selectedCase?.caseId || selectedCase?.selectedFolder?.id
                    }
                    setSelectedFiles={setSelectedFiles}
                  />

                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-gray-600"
                  >
                    <i className="pi pi-times text-lg"></i>
                  </button>
                </ul>
              )}
            </div>
          )}
        </div>
        {/* File View */}
        <div
          onDragEnterCapture={handleDragEnter}
          onDragOverCapture={handleDragOver}
          onDragLeaveCapture={handleDragLeave}
          onDropCapture={handleDrop}
          className={`${
            isMailDoc
              ? "h-[calc(100vh-215px)]"
              : isNested
                ? "h-[calc(100vh-184px)]"
                : "h-[calc(100vh-130px)]"
          } bg-(--background-body) overflow-auto relative`}
        >
          <DMDragDropOverlay
            isDraggingFile={isDraggingFile}
            isDropUploading={isDropUploading}
            canDropFile={canDropFile}
            droppedFiles={droppedFiles}
            folderName={selectedCase?.selectedFolder?.name}
          />

          {fileLoading ? (
            <DMLoadingSkeleton type={viewMode === "grid" ? "grid" : "list"} />
          ) : (
            <DMRenderView
              files={displayFiles}
              allCases={allCases}
              viewMode={viewMode}
              selectedCase={selectedCase}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              allCaseFolders={allCaseFolders}
              isAllCasesView={isAllCasesView}
              setFiles={setFiles}
              entityCodeId={entityCodeId}
              setSelectedCase={(c) => {
                resetPagination();
                setSelectedCase(c);
              }}
              isMailDoc={isMailDoc}
              parentEntityId={parentEntityId}
            />
          )}
        </div>

        {/* Pagination */}
        {totalRecords > 0 && (
          <Paginator
            className="mx-3!"
            first={(page - 1) * pageSize}
            rows={pageSize}
            totalRecords={totalRecords}
            alwaysShow={false}
            rowsPerPageOptions={[10, 15, 25, 50, 100]}
            onPageChange={(e) => {
              const newPage = Math.floor(e.first / e.rows) + 1;
              const newPageSize = e.rows;

              if (newPage === page && newPageSize === pageSize) {
                return;
              }

              setPage(newPage);
              setPageSize(newPageSize);

              // CASE LIST
              if (selectedCase?.allCases) {
                searchDocuments(
                  {
                    isCases: 1,
                    SearchParm: SearchParm || advancedQuery,
                    FileNos: selectedCase.caseDetails?.caseNumber,
                    Page: newPage,
                    PageSize: newPageSize,
                  },
                  "clearSearch",
                );
              }

              // ALL FILES
              else if (selectedCase?.allCasesFiles) {
                searchDocuments({
                  isCases: 0,
                  SearchParm: SearchParm || advancedQuery,
                  FileNos: selectedCase.caseDetails?.caseNumber,
                  Page: newPage,
                  PageSize: newPageSize,
                  ...(fileNameSearch?.trim()
                    ? { FileName: fileNameSearch.trim() }
                    : {}),
                });
              }

              // CASE FILES
              else if (selectedCase?.caseDetails) {
                searchDocuments(
                  {
                    FileNos: selectedCase.caseDetails.caseNumber,
                    ...(selectedCase?.selectedFolder?.id
                      ? { folderId: selectedCase.selectedFolder.id }
                      : {}),
                    ...(fileNameSearch?.trim()
                      ? { FileName: fileNameSearch.trim() }
                      : {}),
                    Page: newPage,
                    PageSize: newPageSize,
                  },
                  "files",
                );
              }
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Document;
