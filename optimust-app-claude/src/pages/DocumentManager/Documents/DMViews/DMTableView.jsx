import DMActions from "../DMActions/DMActions";
import { getFileIconClass } from "../helper";
import { formatDateUI } from "../../../../utils/constant";

const DMTableView = ({
  selectedCase,
  filesToRender = [],
  setFiles,
  currentCaseFolders,
  selectedFiles = [],
  openOverlayRef,
  toggleSelect,
  setSelectedFiles,
  closeOtherOverlays,
  entityCodeId,
  isMailDoc = false,
  parentEntityId,
}) => {
  // Safety: always work with arrays
  const safeFiles = Array.isArray(filesToRender) ? filesToRender : [];
  const safeSelectedFiles = Array.isArray(selectedFiles) ? selectedFiles : [];

  const isSelected = (file) => {
    try {
      if (!file || file.imageId === undefined || file.imageId === null) {
        return false;
      }

      return safeSelectedFiles.some((f) => f && f.imageId === file.imageId);
    } catch (error) {
      console.error("Error checking selected file:", error);
      return false;
    }
  };

  const handleRowClick = (e, file) => {
    try {
      if (!file) return;

      if (
        e?.target?.closest(".dm-actions") ||
        e?.target?.closest(".p-overlaypanel") ||
        e?.target?.closest("input[type='checkbox']")
      ) {
        return;
      }

      if (typeof toggleSelect === "function") {
        toggleSelect(file);
      }
    } catch (error) {
      console.error("Error handling row click:", error);
    }
  };

  const handleCheckboxChange = (file) => {
    try {
      if (!file) return;

      if (typeof toggleSelect === "function") {
        toggleSelect(file);
      }
    } catch (error) {
      console.error("Error toggling document selection:", error);
    }
  };

  const safeFormatDate = (date) => {
    try {
      if (!date) return "-";

      return formatDateUI(date) || "-";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const safeFileIcon = (extension) => {
    try {
      return getFileIconClass(extension) || "pi-file";
    } catch (error) {
      console.error("Error getting file icon:", error);
      return "pi-file";
    }
  };

  return (
    <div className="w-full">
      <table className="text-xs w-full border-collapse bg-white rounded-lg shadow-sm">
        {/* =====================================================
            TABLE HEADER
        ===================================================== */}
        <thead className="border-b-[0.5px] border-(--border-inverse) bg-(--background-table) text-(--text-button)!">
          <tr>
            {/* Mail Document Checkbox */}
            {isMailDoc && <th className="p-2 w-10"></th>}

            {/* Always show */}
            <th className="p-2 text-left">Name</th>

            {/* Normal document columns */}
            {!isMailDoc && (
              <>
                <th className="p-2 text-left">Description</th>

                <th className="p-2 text-left hidden sm:table-cell">Type</th>
              </>
            )}

            {/* Folder */}
            <th className="p-2 text-left hidden md:table-cell">Folder</th>

            {/* Normal document columns */}
            {!isMailDoc && (
              <>
                <th className="p-2 text-left hidden lg:table-cell">
                  Uploaded From
                </th>

                <th className="p-2 text-left hidden lg:table-cell">
                  Created Date
                </th>
              </>
            )}

            {/* Created By */}
            <th className="p-2 text-left hidden lg:table-cell">Created By</th>

            {/* Normal document columns */}
            {!isMailDoc && (
              <>
                <th className="p-2 text-left hidden xl:table-cell">
                  Modified Date
                </th>

                <th className="p-2 text-left hidden xl:table-cell">
                  Modified By
                </th>

                {/* Actions */}
                <th className="p-2"></th>
              </>
            )}
          </tr>
        </thead>

        {/* =====================================================
            TABLE BODY
        ===================================================== */}
        <tbody>
          {safeFiles.length > 0 ? (
            safeFiles.map((file, index) => {
              // Prevent invalid/null data from crashing the page
              if (!file || typeof file !== "object") {
                return null;
              }

              const selected = isSelected(file);

              return (
                <tr
                  key={file.imageId ?? file.id ?? `document-${index}`}
                  className={`cursor-pointer border-b-[0.5px] border-(--border-inverse) transition-all duration-200 ease-in-out ${
                    selected
                      ? "bg-(--background-table-active)"
                      : "hover:shadow-sm odd:bg-white even:bg-(--background-heading) hover:bg-gray-100"
                  }`}
                  onDoubleClick={(e) => handleRowClick(e, file)}
                >
                  {/* =====================================================
                      MAIL DOCUMENT CHECKBOX
                  ===================================================== */}
                  {isMailDoc && (
                    <td className="p-2 w-10">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleCheckboxChange(file)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}

                  {/* =====================================================
                      NAME
                  ===================================================== */}
                  <td className="w-48 p-2">
                    <div className="flex items-start gap-2 font-medium text-gray-800">
                      <i
                        className={`pi ${safeFileIcon(file.extension)}`}
                        style={{ fontSize: "1.4rem" }}
                      />

                      <span className="text-(--foreground-dark) wrap-break-word break-all line-clamp-5 overflow-hidden min-w-0">
                        {file.fileName ?? "-"}
                      </span>
                    </div>
                  </td>

                  {/* =====================================================
                      NORMAL DOCUMENT CELLS
                  ===================================================== */}
                  {!isMailDoc && (
                    <>
                      {/* Description */}
                      <td className="p-2 text-(--foreground-dark) text-xs line-clamp-2 wrap-break-word hidden sm:table-cell">
                        {file.description ?? "-"}
                      </td>

                      {/* Type */}
                      <td className="p-2 text-(--foreground-dark) text-xs line-clamp-2 wrap-break-word hidden sm:table-cell">
                        {file.fileType
                          ? String(file.fileType).toUpperCase()
                          : "-"}
                      </td>
                    </>
                  )}

                  {/* =====================================================
                      FOLDER
                  ===================================================== */}
                  <td className="p-2 text-(--foreground-dark) line-clamp-2 wrap-break-word break-all overflow-hidden md:table-cell">
                    {file.folderId === -1 ? "Drafts" : (file.nodeName ?? "-")}
                  </td>

                  {/* =====================================================
                      NORMAL DOCUMENT CELLS
                  ===================================================== */}
                  {!isMailDoc && (
                    <>
                      {/* Uploaded From */}
                      <td className="p-2 text-(--foreground-dark) line-clamp-2 wrap-break-word hidden lg:table-cell">
                        {file.folderId === -1
                          ? "Drafts"
                          : (file.uploadedForm ?? "-")}
                      </td>

                      {/* Created Date */}
                      <td className="p-2 text-(--foreground-dark) line-clamp-2 wrap-break-word hidden lg:table-cell">
                        {safeFormatDate(file.created)}
                      </td>
                    </>
                  )}

                  {/* =====================================================
                      CREATED BY
                  ===================================================== */}
                  <td className="p-2 text-(--foreground-dark) line-clamp-2 wrap-break-word hidden lg:table-cell">
                    {file.createdBy ?? "-"}
                  </td>

                  {/* =====================================================
                      MODIFIED DETAILS - NORMAL DOCUMENT ONLY
                  ===================================================== */}
                  {!isMailDoc && (
                    <>
                      {/* Modified Date */}
                      <td className="p-2 text-(--foreground-dark) line-clamp-2 wrap-break-word hidden xl:table-cell">
                        {safeFormatDate(file.modified)}
                      </td>

                      {/* Modified By */}
                      <td className="p-2 text-(--foreground-dark) line-clamp-2 wrap-break-word hidden xl:table-cell">
                        {file.modifiedBy ?? "-"}
                      </td>
                    </>
                  )}

                  {/* =====================================================
                      ACTIONS - NORMAL DOCUMENT ONLY
                  ===================================================== */}
                  {!isMailDoc && (
                    <td className="p-2 text-right dm-actions">
                      <DMActions
                        entityCodeId={entityCodeId}
                        file={file}
                        setFiles={setFiles}
                        setSelectedFiles={setSelectedFiles}
                        selectedFolder={selectedCase?.selectedFolder}
                        currentCaseFolders={currentCaseFolders}
                        openOverlayRef={openOverlayRef}
                        closeOtherOverlays={closeOtherOverlays}
                        parentEntityId={parentEntityId}
                      />
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={isMailDoc ? 4 : 10}
                className="p-6 text-center text-gray-500"
              >
                No documents found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DMTableView;
