import { apiRequest } from "../../../../services/apiBinding";
import { confirmPopup } from "primereact/confirmpopup";
import { PiTrash } from "react-icons/pi";
import { toast } from "react-toastify";

const DMDelete = ({
  selectedFile,
  fileActionRef,
  setFiles,
  setSelectedFiles,
}) => {
  const isMulti = Array.isArray(selectedFile);

  const deleteFile = (e, file) => {
    const accept = async () => {
      try {
        const docsArray = isMulti ? file : [file];

        const payload = {
          Documents: docsArray.map((f) => ({ ...f })),
          ShouldBeInDefaultFolder: false,
        };

        const res = await apiRequest({
          apiPath: "document",
          payload,
          apiClient: "dm",
          method: "delete",
        });

        const removeIds = docsArray.map((x) => x.imageId);

        if (res?.deleted?.length) {
          toast.success(
            `${res.deleted.length} document(s) deleted successfully`,
          );

          // Remove deleted files from file list
          setFiles((prevFiles) =>
            prevFiles.filter((f) => !removeIds.includes(f.imageId)),
          );

          // Remove deleted files from selected files
          setSelectedFiles((prevSelected = []) =>
            prevSelected.filter((f) => !removeIds.includes(f.imageId)),
          );
        }

        if (res?.failed?.length) {
          toast.error(`${res.failed.length} document(s) failed to delete`);
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Error deleting files");
      } finally {
        fileActionRef?.current?.hide();
      }
    };

    confirmPopup({
      // group: "delete-doc",
      className: "deletePopup",
      target: e.currentTarget,
      message: isMulti
        ? `Are you sure you want to delete ${file.length} selected document(s)?`
        : "Are you sure?",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      accept,
    });
  };

  return (
    <li className="relative">
      <button
        onClick={(e) => deleteFile(e, selectedFile)}
        className={`flex text-sm items-center ${
          isMulti ? "gap-1 px-0" : "gap-2 px-3"
        } w-full text-left py-1 rounded text-red-600 hover:bg-gray-100`}
      >
        <PiTrash size={14} />
        Delete
      </button>
    </li>
  );
};

export default DMDelete;
