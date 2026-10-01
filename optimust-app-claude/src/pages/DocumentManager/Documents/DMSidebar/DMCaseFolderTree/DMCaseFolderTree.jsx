import { useState, useMemo, useCallback } from "react";
import { FaList } from "react-icons/fa";
import CaseItem from "./CaseItem";
import { XIcon } from "lucide-react";

const DMCaseFolderTree = ({
  allCases,
  allCaseFolders,
  selectedCase,
  setSelectedCase,
  advancedQuery,
  searchDocuments,
  SearchParm,
  isMailDoc,
  onCloseDoc,
  fileNameSearch,
  searchCurrentLocation,
}) => {
  const [expandedFolders, setExpandedFolders] = useState(() => new Set());
  const [folderSearchTerm, setFolderSearchTerm] = useState("");

  // --- Toggle Folder ---
  const toggleFolder = useCallback((id) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const renderedCases = useMemo(
    () =>
      allCases.map((c) => (
        <CaseItem
          key={c.caseId}
          caseItem={c}
          caseFolders={allCaseFolders?.folders || []}
          folderSearchTerm={folderSearchTerm}
          setFolderSearchTerm={setFolderSearchTerm}
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          toggleFolder={toggleFolder}
          expandedFolders={expandedFolders}
          advancedQuery={advancedQuery}
          SearchParm={SearchParm}
          searchDocuments={searchDocuments}
          fileNameSearch={fileNameSearch}
          searchCurrentLocation={searchCurrentLocation}
        />
      )),
    [
      allCases,
      allCaseFolders,
      folderSearchTerm,
      selectedCase,
      expandedFolders,
      toggleFolder,
      searchDocuments,
      advancedQuery,
      SearchParm,
      setSelectedCase,
      fileNameSearch,
      searchCurrentLocation,
    ],
  );

  return (
    <li>
      <div className="flex items-center gap-2 px-2 py-2 font-semibold text-xs">
        {isMailDoc && (
          <XIcon
            className="w-4 h-4 text-[#D4183D] cursor-pointer"
            onClick={onCloseDoc}
          />
        )}
        <FaList className="text-(--text-secondary)" />{" "}
        {SearchParm ? "Folders" : "Cases List"}
      </div>

      <ul>{renderedCases}</ul>
    </li>
  );
};

export default DMCaseFolderTree;
