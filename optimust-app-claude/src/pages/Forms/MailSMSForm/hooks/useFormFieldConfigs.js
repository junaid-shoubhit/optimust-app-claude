import { useMemo } from "react";

import SelectField from "../../../../components/Forms/Select/Select";
import { createPayload } from "../../../../utils/constants/formConstants";

export function useFormFieldConfigs({
  details,
  entityId,
  isReplacingTags,
  watchedEsign,
  watchedSaveToCase,
}) {
  const templatePayload = useMemo(
    () => ({
      dataTable: "ctEmailTemplates",
      dataField: "name",
    }),
    [],
  );

  const casePayload = useMemo(() => createPayload("ctCaseNo"), []);

  const caseFolderPayload = useMemo(
    () => createPayload("dmDefaultCaseFolders"),
    [],
  );

  const documentPayload = useMemo(() => createPayload("dmDocuments"), []);

  const mobilePayload = useMemo(
    () => ({
      dataTable: "PlaintiffMobiles",
      dataField: "name",
    }),
    [],
  );

  const templateField = useMemo(
    () => [
      {
        name: "template",
        label: "Template",
        component: SelectField,
        props: {
          payload: {
            ...templatePayload,
            relationId: details?.entityCodeId,
            entityId,
          },
          isRelation: true,
          placeholder: "Select template",
          noErrorMessage: true,
          disabled: isReplacingTags,
        },
      },
    ],
    [templatePayload, details?.entityCodeId, entityId, isReplacingTags],
  );

  const caseFields = useMemo(() => {
    const isDocumentNeeded = !details?.esign;

    const shouldShowCaseFields =
      watchedEsign &&
      (details?.caseId?.length !== undefined || watchedSaveToCase);

    const shouldShowDocumentField = watchedEsign && isDocumentNeeded;

    const fields = [];

    /* ------------------------------ Case --------------------------------- */

    if (shouldShowCaseFields) {
      fields.push({
        name: "caseId",
        label: "Case",
        component: SelectField,
        rules: { required: "Case is required" },
        props: {
          payload: casePayload,
          isRequired: true,
          placeholder: "Select case",
          disabled: details?.caseId?.length,
        },
      });
    }

    /* ---------------------------- Document ------------------------------- */

    if (shouldShowDocumentField) {
      fields.push({
        name: "documentId",
        label: "Select Document",
        component: SelectField,
        rules: { required: "Document is required" },
        props: {
          payload: {
            ...documentPayload,
            relationId: details?.entityCodeId,
            entityId,
          },
          isRequired: true,
          isRelation: true,
          placeholder: "Select document",
        },
      });
    } else if (shouldShowCaseFields) {
      /* --------------------------- Case Folder ----------------------------- */
      fields.push({
        name: "caseFolderId",
        label: "Case Folder",
        component: SelectField,
        rules: { required: "Case Folder is required" },
        props: {
          payload: {
            ...caseFolderPayload,
            relationId: details?.entityCodeId,
          },
          isRequired: true,
          isRelation: true,
          placeholder: "Select case folder",
          disabled: false,
        },
      });
    }

    return fields;
  }, [
    watchedEsign,
    watchedSaveToCase,
    casePayload,
    caseFolderPayload,
    documentPayload,
    entityId,
    details?.entityCodeId,
    details?.esign,
    details?.caseId,
  ]);

  const mailRecipientPayloadBuilder = useMemo(
    () => (search) => ({
      page: 1,
      pageSize: 50,
      dataTable: "Users_Emails",
      dataField: "name",
      searchTerm: search,
    }),
    [],
  );

  const smsRecipientPayloadBuilder = useMemo(
    () => (search) => ({
      page: 1,
      pageSize: 50,
      ...mobilePayload,
      relationId: details?.entityCodeId,
      entityId,
      searchTerm: search,
    }),
    [mobilePayload, details?.entityCodeId, entityId],
  );

  return {
    templateField,
    caseFields,
    mailRecipientPayloadBuilder,
    smsRecipientPayloadBuilder,
  };
}
