import { useRef } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Toast } from "primereact/toast";
import { FaEllipsisV } from "react-icons/fa";
import DMPreview from "./DMPreview";
import DMDownload from "./DMDownload";
import DMDelete from "./DMDelete";
import DMMoveCopy from "./DMMoveCopy";
import DMRename from "./DMRename";
import DMEsign from "./DMEsign";

const DMActions = ({
  file,
  openOverlayRef,
  setFiles,
  currentCaseFolders,
  selectedFolder,
  setSelectedFiles,
  entityCodeId,
  parentEntityId,
}) => {
  // const [selectedFile, setSelectedFile] = useState(null);
  const toast = useRef(null);
  const fileActionRef = useRef(null);
  const handleClick = (e) => {
    e.stopPropagation();
    // setSelectedFile(file);

    // 🟢 Close any other open overlays
    if (
      openOverlayRef.current &&
      openOverlayRef.current !== fileActionRef.current
    ) {
      openOverlayRef.current.hide();
    }

    // 🟢 Open this one and mark as active
    openOverlayRef.current = fileActionRef.current;
    fileActionRef.current.toggle(e);
  };

  return (
    <>
      <Toast ref={toast} />
      <button
        onClick={handleClick}
        className="text-gray-500 hover:text-gray-800"
      >
        <FaEllipsisV size={14} />
      </button>

      <OverlayPanel ref={fileActionRef} onClick={(e) => e.stopPropagation()}>
        {file && (
          <ul className="space-y-1 w-40">
            {["PDF", "DOCX"].includes(file?.fileType) && (
              <DMPreview selectedFile={file} fileActionRef={fileActionRef} />
            )}
            <DMDownload selectedFile={file} fileActionRef={fileActionRef} />
            <DMDelete
              selectedFile={file}
              fileActionRef={fileActionRef}
              setSelectedFiles={setSelectedFiles}
              setFiles={setFiles}
            />
            <DMRename
              selectedFile={file}
              fileActionRef={fileActionRef}
              setFiles={setFiles}
            />
            <DMMoveCopy
              selectedFolder={selectedFolder}
              actionType="move"
              selectedFile={file}
              setFiles={setFiles}
              fileActionRef={fileActionRef}
              currentCaseFolders={currentCaseFolders}
              entityCodeId={entityCodeId}
            />
            <DMMoveCopy
              selectedFolder={selectedFolder}
              actionType="copy"
              selectedFile={file}
              setFiles={setFiles}
              fileActionRef={fileActionRef}
              currentCaseFolders={currentCaseFolders}
              entityCodeId={entityCodeId}
            />

            {file?.isSign && (
              <DMEsign
                selectedFile={file}
                fileActionRef={fileActionRef}
                parentEntityId={parentEntityId}
              />
            )}
          </ul>
        )}
      </OverlayPanel>
    </>
  );
};

export default DMActions;
