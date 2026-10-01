import DMActions from "../DMActions/DMActions";
import { getFileIconClass } from "../helper";

const DMGridView = ({
  filesToRender,
  setFiles,
  currentCaseFolders,
  selectedFiles,
  selectedCase,
  openOverlayRef,
  toggleSelect,
  closeOtherOverlays,
  setSelectedFiles,
  entityCodeId,
}) => {
  const isSelected = (file) =>
    selectedFiles.some((f) => f.imageId === file.imageId);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4 p-3 ">
      {filesToRender.map((file) => (
        <div
          key={file.imageId}
          className={`border rounded-lg cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${
                          isSelected(file)
                            ? "bg-blue-100 border-blue-400"
                            : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]"
                        }
                    `}
          // onDoubleClick
          onDoubleClick={(e) => {
            if (
              !e.target.closest(".dm-overlay") &&
              !e.target.closest(".dm-actions-button")
            ) {
              toggleSelect(file);
            }
          }}
        >
          <div className="grid w-full gap-3">
            <div className="flex items-center justify-center relative h-20 w-full rounded-t-lg bg-(--background-heading-active)">
              <i
                className={`p-4 pi ${getFileIconClass(file.extension)}`}
                style={{ fontSize: "1.7rem" }}
              ></i>
              <div className="absolute top-2 p-1 rounded-lg right-2 bg-(--foreground)">
                <DMActions
                  entityCodeId={entityCodeId}
                  file={file}
                  setSelectedFiles={setSelectedFiles}
                  setFiles={setFiles}
                  selectedFolder={selectedCase?.selectedFolder}
                  currentCaseFolders={currentCaseFolders}
                  openOverlayRef={openOverlayRef}
                  closeOtherOverlays={closeOtherOverlays}
                />
              </div>
            </div>
            {/* Text container */}
            <div className="px-3">
              <div className="font-medium text-sm line-clamp-2 break-words break-all overflow-hidden">
                {file.fileName}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {file.fileType === "link"
                  ? "🔗 Linked Doc"
                  : `📄 ${file.fileType?.toUpperCase()}`}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DMGridView;
