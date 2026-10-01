import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "../../../../services/apiBinding";
import {
  buildSigningCoordinates,
  getEmails,
  getEntityId,
  getId,
  getRecipientNames,
} from "../utils";

export function useSigningDocument({
  activeMenu,
  esignNodeId,
  esignFiles,
  coordinates,
  details,
  watchedSaveToCase,
}) {
  const saveSigningDocumentMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/DocumentSigning/SaveSigningDocument",
        method: "post",
        payload,
        apiClient: "dm",
      }),
  });

  const buildSaveSigningDocumentPayload = useCallback(
    (values) => {
      const selectedDocumentId = getId(values?.documentId);

      const formData = new FormData();

      formData.append("ModuleId", activeMenu?.id ?? esignNodeId ?? "");
      formData.append("ESignType", 1);
      formData.append("RequestId", 0);
      formData.append("ExpirationDate", null);
      formData.append("email", getEmails(values?.to));
      formData.append("recipientName", getRecipientNames(values?.to));

      /* -------------------------- Existing document --------------------- */

      if (selectedDocumentId) {
        formData.append("DocumentIds", String(selectedDocumentId));
        return formData;
      }

      /* -------------------------- Uploaded PDF --------------------------- */

      if (!esignFiles?.length) {
        throw new Error("No PDF files available for signing");
      }

      if (!coordinates?.length) {
        throw new Error("No coordinates available for signing");
      }

      formData.append(
        "CaseId",
        getId(values?.caseId) || getEntityId(details?.caseId?.[0]) || -1,
      );

      formData.append(
        "EntityCodeId",
        watchedSaveToCase ? 1 : (details?.entityCodeId ?? 1),
      );

      formData.append("NodeId", getId(values?.caseFolderId) ?? -1);

      formData.append(
        "Coordinates",
        JSON.stringify(buildSigningCoordinates(esignFiles, coordinates)),
      );

      esignFiles.forEach((file) => {
        formData.append("file", file);
      });

      return formData;
    },
    [
      activeMenu?.id,
      esignNodeId,
      esignFiles,
      coordinates,
      details?.caseId,
      details?.entityCodeId,
      watchedSaveToCase,
    ],
  );

  return { saveSigningDocumentMutation, buildSaveSigningDocumentPayload };
}
