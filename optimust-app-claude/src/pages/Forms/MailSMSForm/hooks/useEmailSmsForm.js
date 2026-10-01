import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import { DEFAULT_VALUES } from "../constants";

export function useEmailSmsForm({ details, activeType, onValuesChange }) {
  const formMethods = useForm({
    defaultValues: {
      ...DEFAULT_VALUES,
      ...details,
    },
  });

  const { control, getValues } = formMethods;

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
