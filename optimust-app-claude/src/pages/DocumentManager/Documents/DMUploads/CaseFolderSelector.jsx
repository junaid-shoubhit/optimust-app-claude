import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Tree } from "primereact/tree";
import { Button } from "primereact/button";
import { Controller, useForm } from "react-hook-form";
import { apiRequest } from "../../../../services/apiBinding";
import { buildTreeNodes } from "../helper";
import { FaRegFolder } from "react-icons/fa";
import Input from "../../../../components/Forms/Input/Input";
import Field from "../../../../components/Forms/Field";

export default function CaseFolderSelector({
  visible,
  onHide,
  onComplete,
  currentCaseFolders,
  requireFolder = true,   // 🔥 NEW PROP
}) {
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(false);
  const [caseError, setCaseError] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  const {
    handleSubmit,
    control,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      caseName: "",
      folder: null,
    },
  });

  const caseName = watch("caseName");
  const selectedFolder = watch("folder");

  // -------------------------------
  // STEP 1 – CHECK CASE
  // -------------------------------
  const submitCheckCase = async ({ caseName }) => {
    setChecking(true);
    setCaseError("");

    try {
      const res = await apiRequest({
        apiPath: `CaseExistance?CaseNo=${encodeURIComponent(caseName)}`,
        apiClient: "dm",
      });

      if (res?.length > 0) {
        const caseId = res[0].Name;
        setSelectedCaseId(caseId);

        // 🔥 If folder NOT required → complete immediately
        if (!requireFolder) {
          onComplete({ caseId });
          resetForm();
          onHide();
          return;
        }

        // Otherwise go to Step 2
        setStep(2);
      } else {
        setError("caseName", { message: "Case not found." });
        setCaseError("Case not found.");
      }
    } catch {
      setError("caseName", { message: "Unable to verify Case. Try again." });
      setCaseError("Unable to verify Case. Try again.");
    } finally {
      setChecking(false);
    }
  };

  // -------------------------------
  // STEP 2 – SELECT FOLDER
  // -------------------------------
  const submitSelectFolder = ({ folder }) => {
    const folderNode = currentCaseFolders?.find((n) => n.id === folder);

    onComplete({
      caseId: selectedCaseId,
      folderId: folderNode?.id?.split("_")?.[0],
      folderName: folderNode?.nodeName,
    });

    resetForm();
    onHide();
  };

  const resetForm = () => {
    reset();
    setStep(1);
    setSelectedCaseId(null);
    setCaseError("");
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        type="button"
        onClick={() => {
          resetForm();
          onHide();
        }}
      />

      {step === 1 && (
        <Button
          type="submit"
          form="caseFolderForm"
          label="Check Case"
          loading={checking}
          disabled={!caseName?.trim()}
        />
      )}

      {step === 2 && requireFolder && (
        <Button
          type="submit"
          form="caseFolderForm"
          label="Select"
          disabled={!selectedFolder}
        />
      )}
    </div>
  );

  return (
    <Dialog
      header="Select Case"
      visible={visible}
      footer={footer}
      onHide={onHide}
      style={{ width: "400px" }}
    >
      <form
        id="caseFolderForm"
        onSubmit={handleSubmit(step === 1 ? submitCheckCase : submitSelectFolder)}
        className="flex flex-col gap-3"
      >
        {step === 1 && (
          <>
            <Field
              controller={{
                name: "caseName",
                control: control,
                rules: { required: "Case name is required." },
                render: ({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter Case Name"
                    invalid={errors?.caseName}
                  />
                ),
              }}
            />
            {caseError && <small className="text-red-500">{caseError}</small>}
          </>
        )}

        {step === 2 && requireFolder && (
          <>
            <label>Select Folder</label>
            <Controller
              name="folder"
              control={control}
              rules={{ required: "Please select a folder." }}
              render={({ field }) => (
                <>
                  <Tree
                    value={buildTreeNodes(currentCaseFolders || [])}
                    selectionMode="single"
                    selectionKeys={field.value}
                    onSelectionChange={(e) => field.onChange(e.value)}
                    nodeTemplate={(node) => (
                      <div className="flex items-center gap-2">
                        <FaRegFolder className="text-yellow-500" />
                        {node.label}
                      </div>
                    )}
                  />
                  {errors.folder && (
                    <small className="text-red-500">{errors.folder.message}</small>
                  )}
                </>
              )}
            />
          </>
        )}
      </form>
    </Dialog>
  );
}

