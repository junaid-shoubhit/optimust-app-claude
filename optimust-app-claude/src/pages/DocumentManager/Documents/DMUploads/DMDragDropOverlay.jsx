import { FaUpload } from "react-icons/fa";

const DMDragDropOverlay = ({
  isDraggingFile,
  isDropUploading,
  canDropFile,
  droppedFiles = [],
  folderName,
}) => {
  return (
    <>
      {/* Drop Target Overlay */}
      {isDraggingFile &&
        canDropFile &&
        !isDropUploading && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-blue-50/95 border-2 border-dashed border-blue-500 pointer-events-none">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FaUpload className="text-blue-600 text-3xl" />
              </div>

              <h3 className="text-lg font-semibold text-blue-700">
                Drop files to upload
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                PDF, DOCX, JPEG, JPG, PNG, MP4, MOV, HEIC, HEIF, and WEBP are
                supported
              </p>

              {folderName && (
                <p className="mt-2 text-xs font-medium text-gray-600">
                  Uploading to: {folderName}
                </p>
              )}
            </div>
          </div>
        )}

      {/* Uploading Overlay */}
      {isDropUploading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl px-10 py-8 min-w-[320px]">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />

              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>

            <h3 className="text-base font-semibold text-gray-800">
              Uploading files...
            </h3>

            {droppedFiles?.length > 0 && (
              <div className="mt-2 text-center max-w-[300px]">
                <p className="text-xs font-medium text-gray-600">
                  {droppedFiles.length}{" "}
                  {droppedFiles.length === 1 ? "file" : "files"}
                </p>

                <p className="mt-1 text-xs text-gray-500 truncate">
                  {droppedFiles.map((file) => file.name).join(", ")}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <i className="pi pi-spin pi-spinner text-blue-600 text-sm" />

              <span className="text-xs text-blue-600 font-medium">
                Processing
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DMDragDropOverlay;