import { useCallback } from "react";
import { toast } from "react-toastify";
import { apiRequest } from "../../services/apiBinding";
// import { apiRequest } from "../../../services/apiBinding";

export const useTemplateSubmit = ({
  caseId,
  navigate,
  queryClient,
  page,
  invalidateKeys,
}) => {
  const submitDMTemplate = useCallback(
    async (data, isDraft, handleClose) => {
      const isUpdate = !!data.id && data.id > 0;

      const payload = {
        DraftdocumentId: 0,
        TemplateId: data?.selectedTemplate?.value,
        DocumentId: 0,
        CaseId: caseId,
        FolderId: data?.defaultCaseFolderId?.value,
        NodeId: data?.defaultCaseFolderId?.value,
        FileName: `${data?.name}.html`,
        DocumentValue: data?.templateValue,
        versionId: data?.versionId || 0,
        BindedMargeCodes: data?.BindedMargeCodes || [],
        TempMergeCodeMappingId: 0,
      };

      let apiPath = "";
      let method = isUpdate ? "put" : "post";

      if (isDraft) {
        apiPath = isUpdate
          ? "/Document/DraftDocument_Update"
          : "/Document/DraftDocument_Save";
      } else {
        apiPath = isUpdate
          ? "/Document/DraftDocumentRelease_Update"
          : "/Document/DraftDocumentRelease_Save";
        method = "post";
      }

      try {
        await apiRequest({ apiPath, payload, method, apiClient: "dm" });

        toast.success(
          isDraft
            ? isUpdate
              ? "Draft updated!"
              : "Draft saved!"
            : isUpdate
              ? "Template updated!"
              : "Template published!",
        );

        handleClose();
      } catch (err) {
        console.error(err);
        toast.error("Error submitting!");
      }
    },
    [caseId],
  );

  const submitTemplate = useCallback(
    async (formattedData, isDraft) => {
      console.log("formattedData", formattedData);

      const isUpdate = !!formattedData.id && formattedData.id > 0;

      try {
        const formData = new FormData();

        Object.entries(formattedData).forEach(([key, value]) => {
          if (key === "file") {
            if (value instanceof File) {
              formData.append("file", value);
            }
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== null && typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value ?? "");
          }
        });

        formData.append("isDraft", isDraft);

        console.log("formData", formData);
        const res = await apiRequest({
          apiPath: "/Template",
          payload: formData,
          method: "post",
          // headers: {
          //   "Content-Type": "multipart/form-data",
          // },
        });

        toast.success(
          isDraft
            ? isUpdate
              ? "Draft updated!"
              : "Draft saved!"
            : isUpdate
              ? "Template updated!"
              : "Template published!",
        );

        queryClient.setQueryData(invalidateKeys, (oldData) => {
          if (!oldData) return { templates: [res?.data], dataSize: 1 };
          const existingIndex = oldData.data?.findIndex(
            (t) => t.id === res?.data?.id,
          );

          if (existingIndex !== -1) {
            const updated = [...oldData.data];
            updated[existingIndex] = res?.data;
            return {
              ...oldData,
              data: updated,
            };
          }

          return {
            ...oldData,
            data: [res?.data, ...oldData.data],
            dataSize: oldData.dataSize + 1,
          };
        });

        if (isDraft) {
          navigate("/documents/templates?type=draft");
        } else if (!isDraft) {
          navigate("/documents/templates?type=templates");
        } else {
          navigate("..", { replace: true });
        }
      } catch (err) {
        console.error("Submit error:", err);
        toast.error("Error submitting template.");
      }
    },
    [queryClient, navigate, page],
  );

  return { submitDMTemplate, submitTemplate };
};
