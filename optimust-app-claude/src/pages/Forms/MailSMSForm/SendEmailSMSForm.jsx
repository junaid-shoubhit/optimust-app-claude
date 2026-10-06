import React, {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

import { toast } from "react-toastify";

import { DEFAULT_VALUES, ESIGN_URL_MERGE_TAG } from "./constants";
import { useEmailSmsForm, useDefaultCc } from "./hooks/useEmailSmsForm";
import { useReplaceTagsMutation } from "./hooks/useReplaceTagsMutation";
import { useSigningDocument } from "./hooks/useSigningDocument";
import { useSendMutation } from "./hooks/useSendMutation";
import { useFormFieldConfigs } from "./hooks/useFormFieldConfigs";
import { useEmailEditor } from "./hooks/useEmailEditor";

import EmailSmsFormSidebar from "./EmailSmsFormSidebar";
import EmailSmsComposerPanel from "./EmailSmsComposerPanel";
import Document from "../../DocumentManager/Documents/Document";

/* -------------------------------------------------------------------------- */
/*                         SEND EMAIL SMS FORM                                */
/* -------------------------------------------------------------------------- */

const SendEmailSMSForm = forwardRef(function SendEmailSMSForm(
  {
    id: entityId,
    parentEntityId,
    hideSubmit = false,
    onValuesChange,
    details,
    esignFiles = [],
    coordinates = [],
    esignNodeId = null,
    setVisible,
    resetPdfEsign,
    activeMenu,
    enableDocument = true,
  },
  ref,
) {
  // console.log("entityId", entityId);
  const [activeType, setActiveType] = useState("mail");
  const [isViewingCaseDocument, setIsViewingCaseDocument] = useState(false);

  // const { activeMenu } = useAppNavigation();

  const email = useMemo(() => localStorage.getItem("email"), []);

  const handleToggleCaseDocument = useCallback(() => {
    setIsViewingCaseDocument((prev) => !prev);
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                              FORM + WATCHERS                             */
  /* ------------------------------------------------------------------------ */

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
    selectedTemplate,
    templateId,
    watched,
    isPrefillingTo,
  } = useEmailSmsForm({ details, activeType, onValuesChange });

  useDefaultCc(setValue, email);

  /* ------------------------------------------------------------------------ */
  /*                         DERIVED VALUES                                   */
  /* ------------------------------------------------------------------------ */

  const isMail = activeType === "mail";
  const isBulkMessaging = activeMenu?.path === "/bulk-messaging";
  const isEsignDisabled = Boolean(details?.esign);
  const selectedCaseId = watched.caseId; // rename if the actual field differs
  console.log("selectedCaseId", selectedCaseId);
  const hasCaseSelected = Boolean(selectedCaseId) || enableDocument;
  console.log("hasCaseSelected", hasCaseSelected);
  const shouldShowSaveToCase =
    isMail &&
    !isBulkMessaging &&
    details?.caseId?.length === undefined &&
    details?.saveToCase;

  /* ------------------------------------------------------------------------ */
  /*                         EDITOR + IMPERATIVE HANDLE                       */
  /* ------------------------------------------------------------------------ */

  const { handleEditorReady, insertText } = useEmailEditor(setValue);

  useImperativeHandle(ref, () => ({ insertText }), [insertText]);

  /* ------------------------------------------------------------------------ */
  /*                         TEMPLATE / TAG REPLACEMENT                       */
  /* ------------------------------------------------------------------------ */

  const replaceTagsMutation = useReplaceTagsMutation({
    entityId,
    entityCodeId: details?.entityCodeId,
    selectedTemplate,
    templateId,
    setValue,
  });

  /* ------------------------------------------------------------------------ */
  /*                         ESIGN / SEND MUTATIONS                           */
  /* ------------------------------------------------------------------------ */

  const { saveSigningDocumentMutation, buildSaveSigningDocumentPayload } =
    useSigningDocument({
      activeMenu,
      esignNodeId,
      esignFiles,
      coordinates,
      details,
      watchedSaveToCase: watched.saveToCase,
    });

  const sendMutation = useSendMutation({ activeType, entityId, reset });

  /* ------------------------------------------------------------------------ */
  /*                           FIELD CONFIGS                                  */
  /* ------------------------------------------------------------------------ */

  const {
    templateField,
    caseFields,
    mailRecipientPayloadBuilder,
    smsRecipientPayloadBuilder,
  } = useFormFieldConfigs({
    details,
    entityId,
    isReplacingTags: replaceTagsMutation.isPending,
    watchedEsign: watched.esign,
    watchedSaveToCase: watched.saveToCase,
  });

  /* ------------------------------------------------------------------------ */
  /*                          HANDLE TYPE CHANGE                              */
  /* ------------------------------------------------------------------------ */

  const handleTypeChange = useCallback(
    (type) => {
      if (type === activeType) {
        return;
      }

      const currentValues = getValues();

      setActiveType(type);
      setIsViewingCaseDocument(false);

      reset({
        ...DEFAULT_VALUES,
        ...currentValues,
        type,
        to: [],
        ...(type === "sms" ? { bcc: [], cc: [], file: null, subject: "" } : {}),
      });
    },
    [activeType, getValues, reset],
  );

  /* ------------------------------------------------------------------------ */
  /*                              SUBMIT                                      */
  /* ------------------------------------------------------------------------ */

  const onSubmit = useCallback(
    async (values) => {
      try {
        let body = values?.body || "";

        /* ---------------------------------------------------------------- */
        /*                              ESIGN                               */
        /* ---------------------------------------------------------------- */

        if (activeType === "mail" && values?.esign) {
          const signingPayload = buildSaveSigningDocumentPayload(values);

          const signingResponse =
            await saveSigningDocumentMutation.mutateAsync(signingPayload);

          const signingGuid = signingResponse?.guid;

          const signingUrl = signingGuid
            ? `${import.meta.env.VITE_API_OPTIMUST_APP}/sign-document?${signingGuid}`
            : "";

          if (signingUrl) {
            const signLink = `<a href="${signingUrl}">Click here to sign</a>`;

            if (body.includes(ESIGN_URL_MERGE_TAG)) {
              body = body.replaceAll(ESIGN_URL_MERGE_TAG, signLink);
            } else {
              body = body + `\n${signLink}`;
            }
          }
        }

        /* ---------------------------------------------------------------- */
        /*                              SEND                                */
        /* ---------------------------------------------------------------- */

        await sendMutation.mutateAsync({
          ...values,
          body,
        });

        toast.success("Email Sent Successfully");

        setVisible?.(false);
        resetPdfEsign?.();
      } catch (error) {
        console.error("SEND ERROR =>", error);
      }
    },
    [
      activeType,
      buildSaveSigningDocumentPayload,
      saveSigningDocumentMutation,
      sendMutation,
      setVisible,
      resetPdfEsign,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /*                              RESET                                       */
  /* ------------------------------------------------------------------------ */

  const handleReset = useCallback(() => {
    reset({
      ...DEFAULT_VALUES,
      type: activeType,
    });
  }, [reset, activeType]);

  /* ------------------------------------------------------------------------ */
  /*                          LOADING STATE                                   */
  /* ------------------------------------------------------------------------ */

  const isSending =
    sendMutation.isPending || saveSigningDocumentMutation.isPending;

  const isReplacingTags = replaceTagsMutation.isPending;

  const isBusy = isSending || isReplacingTags;

  const handleAttachement = useCallback(
    (selectedDocuments) => {
      if (!selectedDocuments?.length) {
        return;
      }

      const documents = selectedDocuments.map((document) => ({
        fileName: document.fileName,
        BlobName: document.unc,
      }));
      setValue("documents", documents, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setIsViewingCaseDocument(false);
    },
    [setValue],
  );
  /* ------------------------------------------------------------------------ */
  /*                               RENDER                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden">
      <div className="bg-white border border-gray-200  shadow-sm h-full overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex flex-col overflow-hidden px-3"
        >
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
              <EmailSmsFormSidebar
                activeType={activeType}
                onTypeChange={handleTypeChange}
                control={control}
                errors={errors}
                templateField={templateField}
                isMail={isMail}
                mailRecipientPayloadBuilder={mailRecipientPayloadBuilder}
                smsRecipientPayloadBuilder={smsRecipientPayloadBuilder}
                isBulkMessaging={isBulkMessaging}
                isEsignDisabled={isEsignDisabled}
                shouldShowSaveToCase={shouldShowSaveToCase}
                caseFields={caseFields}
                hasCaseSelected={hasCaseSelected}
                isViewingCaseDocument={isViewingCaseDocument}
                onToggleCaseDocument={handleToggleCaseDocument}
                setValue={setValue}
                isPrefillingTo={isPrefillingTo}
              />

              <div className="lg:col-span-8 h-full min-w-0 overflow-hidden">
                {isMail && isViewingCaseDocument ? (
                  <Document
                    SearchParm={`(cc.id ='${parentEntityId || entityId}')`}
                    onCloseDoc={handleToggleCaseDocument}
                    isMailDoc={true}
                    handleAttachement={handleAttachement}
                  />
                ) : (
                  <EmailSmsComposerPanel
                    isMail={isMail}
                    control={control}
                    errors={errors}
                    isReplacingTags={isReplacingTags}
                    onEditorReady={handleEditorReady}
                    hideSubmit={hideSubmit}
                    isBusy={isBusy}
                    onReset={handleReset}
                  />
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

export default SendEmailSMSForm;
