import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "../../../../services/apiBinding";

export function useReplaceTagsMutation({
  entityId,
  entityCodeId,
  selectedTemplate,
  templateId,
  setValue,
}) {
  const replaceTagsMutation = useMutation({
    mutationFn: async ({
      templateId: selectedTemplateId,
      entityId: selectedEntityId,
      body,
    }) =>
      apiRequest({
        apiPath: "emailTemplate/replaceTags",
        method: "post",
        payload: {
          templateId: selectedTemplateId,
          entityId: selectedEntityId,
          entityCodeId,
          body,
        },
      }),

    onSuccess: (response) => {
      const data = response?.data || response;

      if (!data) {
        return;
      }

      setValue("body", data?.body || "", {
        shouldDirty: true,
      });
    },

    onError: (error) => {
      console.error("Replace Tags API Error =>", error);
    },
  });

  const templateSubject = selectedTemplate?.address || "";
  const templateBody = selectedTemplate?.info || "";

  useEffect(() => {
    if (!templateId) {
      return;
    }

    setValue("subject", templateSubject);
    setValue("body", "");

    if (!templateBody) {
      return;
    }

    replaceTagsMutation.mutate({
      templateId,
      body: templateBody,
      entityId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templateSubject, templateBody, entityId, setValue]);

  return replaceTagsMutation;
}
