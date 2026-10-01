import { FaChevronDown, FaChevronRight, FaRegFolder } from "react-icons/fa";

const FolderTree = ({
  folders = [],
  caseId,
  caseNumber,
  expandedFolders,
  toggleFolder,
  selectedCase,
  setSelectedCase,
  advancedQuery,
  searchDocuments,
  SearchParm,
  fileNameSearch,
  searchCurrentLocation,
}) => {
  if (!folders.length) return null;

  return folders.map((folder) => {
    const { id, name, folders: subs = [] } = folder;

    const hasChildren = subs.length > 0;

    // Important:
    // Make expansion unique per case + folder.
    const folderKey = `${caseId}-${id}`;

    const isExpanded = expandedFolders.has(folderKey);

    const isSelected =
      selectedCase?.caseDetails?.caseId === caseId &&
      String(selectedCase?.selectedFolder?.id) === String(id);

    const handleClick = () => {
      /*
       * IMPORTANT:
       * Always toggle folders that have children.
       *
       * Do NOT return early when isSelected.
       * That was the reason your folder could not close.
       */
      if (hasChildren) {
        toggleFolder(folderKey);
      }

      // Update selected folder
      setSelectedCase((prev) => ({
        ...prev,
        selectedFolder: folder,
      }));

      // Search documents for this folder
      const payload = {
        FileNos: SearchParm ? "" : caseNumber,
        folderId: id,
        SearchParm: SearchParm || advancedQuery,
      };

      // Preserve File Name search when selecting folder
      if (fileNameSearch?.trim()) {
        payload.FileName = fileNameSearch.trim();
      }

      searchDocuments(payload, "files");
    };

    return (
      <li key={id}>
        <div
          onClick={handleClick}
          className={`
            cursor-pointer
            flex
            items-center
            gap-2
            px-2
            py-1
            text-sm
            truncate
            hover:bg-blue-50
            ${isSelected ? "bg-(--background-active)" : ""}
          `}
        >
          {hasChildren ? (
            isExpanded ? (
              <FaChevronDown className="shrink-0" />
            ) : (
              <FaChevronRight className="shrink-0" />
            )
          ) : (
            <FaRegFolder className="text-[#F59E0B] min-w-4 shrink-0" />
          )}

          <p className="truncate text-xs">{name}</p>
        </div>

        {isExpanded && hasChildren && (
          <ul className="ml-3">
            <FolderTree
              folders={subs}
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
        )}
      </li>
    );
  });
};

export default FolderTree;
