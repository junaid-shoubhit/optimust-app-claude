import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "../../../../services/apiBinding";
import { DEFAULT_VALUES } from "../constants";
import { getEmails, getId } from "../utils";

export function useSendMutation({ activeType, entityId, reset }) {
  return useMutation({
    mutationFn: async (values) => {
      /* -------------------------------------------------------------------- */
      /*                                MAIL                                  */
      /* -------------------------------------------------------------------- */

      if (activeType === "mail") {
        const files = Array.isArray(values?.file)
          ? values.file
          : values?.file
            ? [values.file]
            : [];

        const documents = Array.isArray(values?.documents)
          ? values.documents
          : [];

        const body = values?.body || "";

        const formData = new FormData();

        formData.append("type", "mail");
        formData.append("templateId", getId(values?.template));
        formData.append("subject", values?.subject || "");
        formData.append("body", body);
        formData.append("to", getEmails(values?.to));
        formData.append("bcc", getEmails(values?.bcc));
        formData.append("cc", getEmails(values?.cc));

        /* ---------------------------------------------------------------- */
        /*                         LOCAL FILES                              */
        /* ---------------------------------------------------------------- */

        files.forEach((file) => {
          if (file instanceof File) {
            formData.append("file", file);
          }
        });

        /* ---------------------------------------------------------------- */
        /*                       CASE DOCUMENTS                            */
        /* ---------------------------------------------------------------- */

        if (documents.length > 0) {
          formData.append(
            "documents",
            JSON.stringify(
              documents.map((document) => ({
                fileName: document.fileName,
                BlobName: document.BlobName,
              })),
            ),
          );
        }

        console.log("Local Files =>", files);
        console.log("Case Documents =>", documents);

        return apiRequest({
          apiPath: "/email/service-email",
          method: "post",
          payload: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      /* -------------------------------------------------------------------- */
      /*                                 SMS                                  */
      /* -------------------------------------------------------------------- */

      return apiRequest({
        apiPath: "/utility/sms/out",
        method: "post",
        payload: {
          type: "sms",
          entityId,
          templateId: getId(values?.template),
          body: values?.body || "",
          to: getEmails(values?.to),
        },
      });
    },

    onSuccess: () => {
      reset({
        ...DEFAULT_VALUES,
        type: activeType,
      });
    },

    onError: (error) => {
      console.error("SEND ERROR =>", error);
    },
  });
}
