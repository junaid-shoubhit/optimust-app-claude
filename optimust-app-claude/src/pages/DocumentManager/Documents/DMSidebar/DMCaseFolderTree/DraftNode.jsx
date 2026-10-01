import { FaRegFolder } from "react-icons/fa";

const DraftNode = ({
  caseId,
  caseNumber,
  selectedCase,
  setSelectedCase,
  advancedQuery,
  searchDocuments,
}) => {
  const isSelected =
    selectedCase?.caseDetails?.caseId === caseId &&
    selectedCase?.selectedFolder?.id === "drafts";

  const handleClick = () => {
    if (isSelected) return;

    setSelectedCase((prev) => ({
      ...prev,
      selectedFolder: {
        id: "drafts",
        name: "Drafts",
        nodeName: "Drafts",
      },
    }));

    searchDocuments(
      { FileNos: caseNumber, folderId: "drafts", SearchParm: advancedQuery },
      "drafts",
      caseId,
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`flex gap-2 px-2 py-1 items-center text-sm cursor-pointer hover:bg-blue-50 ${
        isSelected ? "bg-blue-100" : ""
      }`}
    >
      <FaRegFolder className="text-yellow-500 min-w-4" />
      <p className="truncate">Drafts</p>
    </div>
  );
};

export default DraftNode;
