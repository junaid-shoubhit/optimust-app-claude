import { FaFileAlt, FaScroll } from "react-icons/fa";
import DMSearch from "./DMSearch/DMSearch";
import DMLoadingSkeleton from "../DMSkeleton";
import DMCaseFolderTree from "./DMCaseFolderTree/DMCaseFolderTree";

const DMSidebar = ({
  allCaseFolders,
  allCases,
  setSelectedCase,
  isFiles,
  selectedCase,
  searchDocuments,
  loading,
  advancedQuery,
  SearchParm,
  setAdvancedQuery,
  isNested,
  isMailDoc,
  onCloseDoc,
  fileNameSearch,
  searchCurrentLocation,
  onPrimarySearch,
}) => {
  return (
    <aside
      className={`w-68 border-r-[0.5px] border-(--border-inverse) ${isNested ? "h-[calc(100vh-110px)]" : "h-[calc(100vh-53px)]"} shadow-md flex flex-col`}
    >
      {!SearchParm && (
        <DMSearch
          searchDocuments={searchDocuments}
          loading={loading}
          onSaveQuery={(q) => {
            setAdvancedQuery(q);
          }}
          onPrimarySearch={onPrimarySearch}
        />
      )}
      {loading ? (
        <DMLoadingSkeleton type="sidebar" count={7} />
      ) : (
        <ul className="flex-1 overflow-auto">
          {/* All Case Details */}

          {!SearchParm && allCases.length > 0 && (
            <li>
              <div
                onClick={() => {
                  setSelectedCase({ allCases: true });
                }}
                className={`text-xs cursor-pointer flex items-center gap-2 px-2 py-2 font-semibold
                ${selectedCase?.allCases ? "bg-(--background-secondary) text-(--foreground)" : ""}
                `}
              >
                <FaScroll
                  className={`${selectedCase?.allCases ? "text-(--foreground)" : "text-(--text-secondary)"} w-4 h-4 `}
                />{" "}
                Cases Details
              </div>
              <hr />
            </li>
          )}

          {/* All Case Details */}
          {isFiles && allCases.length > 1 && (
            <li>
              <div
                onClick={() => {
                  setSelectedCase({ allCasesFiles: true });
                  searchDocuments(
                    {
                      SearchParm: advancedQuery || {},
                      ...(fileNameSearch?.trim()
                        ? { FileName: fileNameSearch.trim() }
                        : {}),
                    },
                    "files",
                  );
                }}
                className={`cursor-pointer flex items-center hover:bg-blue-50 gap-2 px-2 py-2 font-semibold text-sm ${
                  selectedCase?.allCasesFiles ? "bg-(--background-active)" : " "
                }`}
              >
                <FaFileAlt className="text-(--text-secondary) w-4 h-4" /> Cases
                Files
              </div>
              <hr />
            </li>
          )}

          {allCases.length > 0 && (
            <DMCaseFolderTree
              allCases={allCases}
              allCaseFolders={allCaseFolders}
              selectedCase={selectedCase}
              setSelectedCase={setSelectedCase}
              searchDocuments={searchDocuments}
              advancedQuery={advancedQuery}
              SearchParm={SearchParm}
              isMailDoc={isMailDoc}
              onCloseDoc={onCloseDoc}
              fileNameSearch={fileNameSearch}
              searchCurrentLocation={searchCurrentLocation}
            />
          )}
        </ul>
      )}
    </aside>
  );
};

export default DMSidebar;
