import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { DEFAULT_VALUES } from "../constants";
import { getCascadeOptions } from "../../../../services/apiBinding";

export function useEmailSmsForm({ details, activeType, onValuesChange }) {
  const formMethods = useForm({
    defaultValues: {
      ...DEFAULT_VALUES,
      ...details,
    },
  });

  const { control, getValues, setValue } = formMethods;

  /* ----------------------- Prefill "to" from mailDetails ----------------------- */

  const mailDetails = details?.mailDetails;

  const { data: workflowEmails, isFetching: isPrefillingTo } = useQuery({
    queryKey: ["workflowEmails", mailDetails],
    queryFn: () =>
      getCascadeOptions({
        page: 1,
        pageSize: 50,
        dataTable: "Users_WorkFlowEmails",
        dataField: "name",
        searchTerm: mailDetails,
      }),
    enabled: Boolean(mailDetails),
    // Drop the cache when the form closes so every open fetches fresh.
    gcTime: 0,
    staleTime: 0,
  });

  useEffect(() => {
    const options = workflowEmails?.options;

    if (!options?.length) {
      return;
    }

    setValue(
      "to",
      options.map((option) => ({
        value: option.value,
        label: option.label,
        address: option.address || option.label,
      })),
      { shouldDirty: true },
    );
  }, [workflowEmails, setValue]);

  const selectedTemplate = useWatch({ control, name: "template" });

  const watchedValues = useWatch({
    control,
    name: [
      "body",
      "subject",
      "to",
      "cc",
      "bcc",
      "file",
      "esign",
      "caseId",
      "saveToCase",
      "caseFolderId",
      "documentId",
    ],
  });

  const [
    watchedBody,
    watchedSubject,
    watchedTo,
    watchedCc,
    watchedBcc,
    watchedFile,
    watchedEsign,
    watchedCaseId,
    watchedSaveToCase,
    watchedCaseFolderId,
    watchedDocumentId,
  ] = watchedValues;

  // Notify the parent whenever any watched field (or the mail/sms type) changes.
  useEffect(() => {
    onValuesChange?.({
      ...getValues(),
      type: activeType,
    });
  }, [
    activeType,
    watchedBody,
    watchedSubject,
    watchedTo,
    watchedCc,
    watchedBcc,
    watchedFile,
    watchedEsign,
    watchedCaseId,
    watchedSaveToCase,
    watchedCaseFolderId,
    watchedDocumentId,
    getValues,
    onValuesChange,
  ]);

  const templateId = selectedTemplate?.value || null;

  const watched = useMemo(
    () => ({
      body: watchedBody,
      subject: watchedSubject,
      to: watchedTo,
      cc: watchedCc,
      bcc: watchedBcc,
      file: watchedFile,
      esign: watchedEsign,
      caseId: watchedCaseId,
      saveToCase: watchedSaveToCase,
      caseFolderId: watchedCaseFolderId,
      documentId: watchedDocumentId,
    }),
    [
      watchedBody,
      watchedSubject,
      watchedTo,
      watchedCc,
      watchedBcc,
      watchedFile,
      watchedEsign,
      watchedCaseId,
      watchedSaveToCase,
      watchedCaseFolderId,
      watchedDocumentId,
    ],
  );

  return {
    ...formMethods,
    selectedTemplate,
    templateId,
    watched,
    isPrefillingTo,
  };
}

/** Defaults the CC field to the logged-in user's email, once it's known. */
export function useDefaultCc(setValue, email) {
  useEffect(() => {
    if (!email) {
      return;
    }

    setValue("cc", [
      {
        value: email,
        label: email,
        address: email,
      },
    ]);
  }, [email, setValue]);
}
