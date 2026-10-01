import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useForm, Controller } from "react-hook-form";
import Input from "../../../../components/Forms/Input/Input";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import { apiRequest } from "../../../../services/apiBinding";
import { PiPencil } from "react-icons/pi";

const DMRename = ({ selectedFile, fileActionRef, setFiles }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extension, setExtension] = useState(""); // store file extension
  const toast = useRef(null);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { newName: "", description: "" },
  });

  // Prefill input without extension
  const openRenameDialog = () => {
    if (!selectedFile?.fileName) return;
    const dotIndex = selectedFile.fileName.lastIndexOf(".");
    const namePart =
      dotIndex !== -1
        ? selectedFile.fileName.substring(0, dotIndex)
        : selectedFile.fileName;

    const extPart =
      dotIndex !== -1 ? selectedFile.fileName.substring(dotIndex) : "";

    setExtension(extPart);

    reset({
      newName: namePart,
      description: selectedFile?.description || "",
    });

    setVisible(true);
  };

  const onRenameSubmit = async (data) => {
    if (!data.newName.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Invalid Name",
        detail: "File name cannot be empty.",
      });
      return;
    }

    const finalName = data.newName.trim() + extension; // append original extension
    setLoading(true);

    try {
      // --- API call ---
      const payload = {
        ...selectedFile,
        FileName: finalName,
        description: data?.description ?? "",
      };
      const resData = await apiRequest({
        apiPath: "document",
        payload,
        apiClient: "dm",
        method: "put",
      });
      const res = resData?.documentList?.[0];
      console.log("resData", resData);
      // --- Update local state immediately ---

      setFiles((prev) =>
        prev.map((f) =>
          f.imageId === selectedFile.imageId
            ? {
                ...f,
                fileName: res?.fileName,
                unc: res?.unc,
                description: res?.description,
              }
            : f,
        ),
      );

      toast.current.show({
        severity: "success",
        summary: "Renamed",
        detail: `File renamed to ${finalName}`,
      });
      setVisible(false);
      fileActionRef.current?.hide();
    } catch (error) {
      console.error("Rename failed:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error || "Failed to rename file.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <li>
        <button
          onClick={openRenameDialog}
          className="text-sm w-full text-left px-3 py-1 rounded text-blue-600 hover:bg-gray-100 flex items-center gap-2"
        >
          <PiPencil size={14} /> Edit
        </button>
      </li>
      {/* <li>
        <button
          onClick={openRenameDialog}
          className="w-full text-left px-3 py-1 rounded text-blue-600 hover:bg-gray-100"
        >
          Rename
        </button>
      </li> */}

      <Dialog
        header="Rename File"
        visible={visible}
        style={{ width: "25rem" }}
        modal
        onHide={() => {
          setVisible(false);
          fileActionRef.current?.hide();
        }}
      >
        <form
          onSubmit={handleSubmit(onRenameSubmit)}
          className="flex flex-col gap-4 p-3"
        >
          <Controller
            name="newName"
            control={control}
            rules={{ required: "File name is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="File Name"
                type="text"
                placeholder="Enter new file name"
                invalid={errors.newName}
                className="mb-0"
              />
            )}
          />

          {extension && (
            <div>
              <label className="uppercase text-xs! pl-0.5 mb-0.5 font-medium">
                FILE EXTENSION:
              </label>
              <span className="text-gray-500 ml-1">
                .{extension.replace(".", "")}
              </span>
            </div>
          )}

          <Controller
            name="description"
            control={control}
            // rules={{ required: "Description is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="Description"
                type="textarea"
                placeholder="Enter description"
                invalid={errors.description}
              />
            )}
          />

          <div className="flex justify-end gap-2">
            <CustomButton
              outlined
              label="Cancel"
              className="outlineBtn"
              onClick={() => {
                setVisible(false);
                fileActionRef.current?.hide();
              }}
              disabled={loading || isSubmitting}
            />
            <CustomButton
              label="Save"
              type="submit"
              loading={loading || isSubmitting}
              className="saveBtn"
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default DMRename;
