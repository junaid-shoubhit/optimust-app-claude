import { Dialog } from "primereact/dialog";
import { Tree } from "primereact/tree";
import React, { useState } from "react";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import { FaRegFolder } from "react-icons/fa";
import { buildTreeNodes } from "../helper";
import { apiRequest } from "../../../../services/apiBinding";
import { FiMove, FiCopy } from "react-icons/fi"; // Feather icons
import { toast } from "react-toastify";

const DMMoveCopy = ({
  selectedFolder: activeFolder,
  actionType = "move", // "move" | "copy"
  selectedFile,
  setFiles,
  fileActionRef,
  currentCaseFolders,
  setSelectedFiles,
  entityCodeId,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [treeSelection, setTreeSelection] = useState(null);

  const addFileToActive = (newFile) => {
    if (isMove) {
      setFiles((prevFiles) => [...prevFiles, ...newFile]);
    } else {
      setFiles((prevFiles) => [...newFile, ...prevFiles]);
    }
  };

  const isMove = actionType === "move";

  const isMulti = Array.isArray(selectedFile);
  const displayTitle = isMulti
    ? `${selectedFile.length} files`
    : selectedFile?.fileName;

  const handleOpenDialog = () => setShowDialog(true);

  const findNodeById = (folders, id) => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.folders?.length) {
        const found = findNodeById(folder.folders, id);
        if (found) return found;
      }
    }
    return null;
  };
  const performAction = async () => {
    if (!treeSelection) return;
    const selectedFolder = findNodeById(currentCaseFolders, treeSelection);
    const docsArray = isMulti ? selectedFile : [selectedFile];

    try {
      // payload
      const payload = {
        Documents: docsArray.map((f) => ({
          ...f,
          NodeForGrid: selectedFolder?.nodeName,
          NodeId: selectedFolder?.id?.split("_")?.[0],
          Action: isMove ? "move" : "copy",
          ImageId: `${f?.imageId}`,
          CaseId: f?.caseId,
        })),
        entityCodeId: entityCodeId,
        ShouldBeInDefaultFolder: false,
      };

      const res = await apiRequest({
        apiPath: "documentMoveCopy",
        payload,
        apiClient: "dm",
        method: "post",
      });
      if (res) {
        toast.success(`${isMove ? "Moved" : "Copied"} successfully`);
      }
      // local update
      if (res?.documents?.length > 0) {
        addFileToActive(res?.documents);
      }

      setShowDialog(false);
      setTreeSelection(null);
      setSelectedFiles && setSelectedFiles([]); // Clear selection if multi
      fileActionRef?.current?.hide();
    } catch (err) {
      console.error(`${actionType} error:`, err);
    }
  };

  const folderNodeTemplate = (node) => (
    <div className="flex items-center gap-2">
      {!node?.children && <FaRegFolder className="text-yellow-500" />}
      <span>{node.label}</span>
    </div>
  );

  return (
    <>
      <li>
        <button
          onClick={handleOpenDialog}
          className={` text-sm w-full text-left ${
            isMulti ? "px-0 gap-1" : "px-3 gap-2"
          } py-1 rounded hover:bg-gray-100 flex items-center ${
            isMove ? "text-gray-700" : "text-green-600"
          }`}
        >
          {isMove ? <FiMove size={14} /> : <FiCopy size={14} />}
          {isMove ? "Move" : "Copy"}
        </button>
      </li>

      <Dialog
        header={`${isMove ? "Move" : "Copy"} "${displayTitle}" to:`}
        visible={showDialog}
        style={{ width: "400px" }}
        onHide={() => {
          setShowDialog(false);
          fileActionRef?.current?.hide();
        }}
        footer={
          <div className="flex justify-end gap-2">
            <CustomButton
              outlined
              label="Cancel"
              className="outlineBtn"
              onClick={() => {
                setShowDialog(false);
                fileActionRef?.current?.hide();
              }}
            />
            <CustomButton
              outlined
              label={isMove ? "Save" : "Copy"}
              className="saveBtn"
              onClick={performAction}
              disabled={!treeSelection}
            />
          </div>
        }
      >
        <Tree
          value={buildTreeNodes(currentCaseFolders || [])}
          selectionMode="single"
          selectionKeys={treeSelection}
          onSelectionChange={(e) => setTreeSelection(e.value)}
          nodeTemplate={folderNodeTemplate}
          className="w-full"
        />
      </Dialog>
    </>
  );
};

export default DMMoveCopy;
