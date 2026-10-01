import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import Input from "../../../../../components/Forms/Input/Input";
import FolderTree from "./FolderTree";

const CaseItem = ({
  caseItem,
  caseFolders,
  folderSearchTerm,
  setFolderSearchTerm,
  selectedCase,
  setSelectedCase,
  toggleFolder,
  expandedFolders,
  advancedQuery,
  searchDocuments,
  SearchParm,
  fileNameSearch,
  searchCurrentLocation,
}) => {
  const { caseId, caseNumber } = caseItem;

  const isExpanded = selectedCase?.caseDetails?.caseId === caseId;
  const isActive = isExpanded;

  const handleCaseClick = () => {
    const isSameCase = selectedCase?.caseDetails?.caseId === caseId;
    const hasFolderSelected = !!selectedCase?.selectedFolder;

    // If same case and no folder is selected,
    // don't trigger unnecessary search/state update.
    if (isSameCase && !hasFolderSelected) return;

    setSelectedCase({
      caseDetails: caseItem,
      selectedFolder: null,
    });

    const payload = {
      FileNos: SearchParm ? "" : caseNumber,
      SearchParm: SearchParm || advancedQuery,
    };

    // Preserve File Name search when changing case
    if (fileNameSearch?.trim()) {
      payload.FileName = fileNameSearch.trim();
    }

    searchDocuments(payload, "files");
  };

  const term = folderSearchTerm.trim().toLowerCase();
  const filteredFolders = !term
    ? caseFolders
    : caseFolders
        .map((f) => {
          const match = f.name.toLowerCase().includes(term);
          const subs = filterByTerm(f.folders || [], term);

          return match || subs.length
            ? {
                ...f,
                folders: subs,
              }
            : null;
        })
        .filter(Boolean);

  return (
    <li>
      {/* Case Header */}
      <div
        onClick={handleCaseClick}
        className={`text-xs cursor-pointer flex items-center gap-2 px-2 py-2 font-semibold ${
          isActive ? "bg-(--background-secondary) text-(--foreground)" : ""
        }`}
      >
        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
        {caseNumber || caseId}
      </div>

      {/* Folders */}
      {isExpanded && (
        <div className="space-y-2">
          {/* Folder Search */}
          <div className="flex items-center justify-center gap-2 my-0.5 px-2">
            <Input
              featureName="folderSearch"
              type="icon"
              iconName="pi pi-search"
              iconPosition="left"
              onChange={(e) => setFolderSearchTerm(e.target.value)}
              value={folderSearchTerm}
              placeholder="Search Folder..."
              noErrorMessage={true}
            />
          </div>

          {/* Folder Tree */}
          <ul className="ml-2">
            <FolderTree
              folders={filteredFolders}
              caseId={caseId}
              caseNumber={caseNumber}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              selectedCase={selectedCase}
              setSelectedCase={setSelectedCase}
              advancedQuery={advancedQuery}
              searchDocuments={searchDocuments}
              SearchParm={SearchParm}
              fileNameSearch={fileNameSearch}
              searchCurrentLocation={searchCurrentLocation}
            />
          </ul>
        </div>
      )}
    </li>
  );
};

export default CaseItem;

// Recursive folder search
const filterByTerm = (folders = [], term) =>
  folders
    .map((f) => {
      const match = f.name.toLowerCase().includes(term);

      const subs = filterByTerm(f.folders || [], term);

      return match || subs.length
        ? {
            ...f,
            folders: subs,
          }
        : null;
    })
    .filter(Boolean);
