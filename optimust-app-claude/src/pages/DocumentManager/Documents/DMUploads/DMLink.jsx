import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import Input from "../../../../components/Forms/Input/Input";
import { apiRequest } from "../../../../services/apiBinding";

const DMLinkForm = ({ addFileToActive, fileMenuRef, caseId }) => {
  const [visible, setVisible] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      CaseId: caseId,
      FileName: "",
      NodeForGrid: "",
      NodeId: 0,
      FromLocation: "Document Manager",
      IsLink: true,
      FileType: "link",
      Extension: ".link",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await apiRequest({
        apiPath: "document",
        payload: data,
        apiClient: "dm",
        method: "post",
      });
    } catch (error) {}
    const newFile = {
      imageId: Date.now(),
      ...data,
    };

    addFileToActive(newFile);
    reset();
    setVisible(false);
    fileMenuRef.current?.hide();
  };

  return (
    <>
      <li>
        <button
          onClick={() => setVisible(true)}
          className="w-full text-left px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-2"
        >
          🔗 New Linked Document
        </button>
      </li>

      <Dialog
        header="New Linked Document"
        visible={visible}
        style={{ width: "25rem" }}
        onHide={() => {
          setVisible(false);
          fileMenuRef.current?.hide();
        }}
        footer={
          <div className="flex justify-end gap-2 pb-1">
            <CustomButton
              label="Cancel"
              outlined
              onClick={() => {
                setVisible(false);
                fileMenuRef.current?.hide();
              }}
            />
            <CustomButton
              label="Save"
              outlined
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="FileName"
            control={control}
            rules={{ required: "Document Name is required" }}
            render={({ field }) => (
              <Input
                type="text"
                label="Document Name"
                placeholder="Enter Document Name"
                {...field}
                invalid={errors.fileName}
              />
            )}
          />

          <Controller
            name="NodeForGrid"
            control={control}
            rules={{
              required: "Document Link is required",
              pattern: {
                value: /^(https?:\/\/[^\s]+)$/i,
                message: "Enter a valid URL",
              },
            }}
            render={({ field }) => (
              <Input
                type="text"
                label="Document Link"
                placeholder="Paste or Enter Document Link"
                {...field}
                // error={errors.docUrl?.message}
                invalid={errors.nodeForGrid}
              />
            )}
          />
        </form>
      </Dialog>
    </>
  );
};

export default DMLinkForm;
