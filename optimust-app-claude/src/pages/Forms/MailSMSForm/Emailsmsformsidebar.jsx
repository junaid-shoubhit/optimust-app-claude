import React from "react";

import DynamicFormFields from "../../../components/Forms/DynamicForm/UserDynamicForm";

import MailSmsToggle from "./components/MailSmsToggle";
import RecipientSearchDropdown from "./components/RecipientSearchDropdown";
import FileAttachmentField from "./components/FileAttachmentField";
import LabeledToggle from "./components/LabeledToggle";

const EmailSmsFormSidebar = React.memo(
  ({
    activeType,
    onTypeChange,
    control,
    errors,
    templateField,
    isMail,
    mailRecipientPayloadBuilder,
    smsRecipientPayloadBuilder,
    isBulkMessaging,
    isEsignDisabled,
    shouldShowSaveToCase,
    caseFields,
    hasCaseSelected,
    isViewingCaseDocument,
    onToggleCaseDocument,
    setValue,
  }) => (
    <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50 overflow-y-auto">
      <div className="p-2 sm:p-3">
        <div className="overflow-visible">
          <MailSmsToggle activeType={activeType} onChange={onTypeChange} />

          {/* ---------------------------------------------------- */}
          {/* TEMPLATE                                             */}
          {/* ---------------------------------------------------- */}

          <div className="p-2 border-b border-gray-100">
            <DynamicFormFields
              fields={templateField}
              control={control}
              errors={errors}
              gridCols="grid-cols-1"
            />
          </div>

          {/* ---------------------------------------------------- */}
          {/* RECIPIENTS                                           */}
          {/* ---------------------------------------------------- */}

          <div className="p-2">
            {isMail ? (
              <div className="space-y-3">
                <RecipientSearchDropdown
                  name="to"
                  control={control}
                  label="To"
                  queryKey="mail-to-search"
                  payloadBuilder={mailRecipientPayloadBuilder}
                  required
                />

                <RecipientSearchDropdown
                  name="cc"
                  control={control}
                  label="CC"
                  queryKey="mail-cc-search"
                  payloadBuilder={mailRecipientPayloadBuilder}
                />

                <RecipientSearchDropdown
                  name="bcc"
                  control={control}
                  label="BCC"
                  queryKey="mail-bcc-search"
                  payloadBuilder={mailRecipientPayloadBuilder}
                />
              </div>
            ) : (
              <RecipientSearchDropdown
                name="to"
                control={control}
                label="Mobile Number"
                queryKey="sms-to-search"
                placeholder="Select mobile number"
                payloadBuilder={smsRecipientPayloadBuilder}
              />
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* FILE UPLOAD                                          */}
          {/* ---------------------------------------------------- */}

          {isMail && (
            <div className="px-2 pb-3">
              <FileAttachmentField
                name="file"
                control={control}
                hasCaseSelected={hasCaseSelected}
                isViewingCaseDocument={isViewingCaseDocument}
                onToggleCaseDocument={onToggleCaseDocument}
                setValue={setValue}
              />
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* ESIGN / SAVE TO CASE                                 */}
          {/* ---------------------------------------------------- */}

          {isMail && !isBulkMessaging && (
            <div className="px-2 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <LabeledToggle
                  name="esign"
                  control={control}
                  label="eSign"
                  disabled={isEsignDisabled}
                />

                {shouldShowSaveToCase && (
                  <LabeledToggle
                    name="saveToCase"
                    control={control}
                    label="Save to Case"
                  />
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* CASE / DOCUMENT / FOLDER                             */}
          {/* ---------------------------------------------------- */}

          {isMail && caseFields.length > 0 && (
            <div className="px-2 border-t border-gray-100">
              <DynamicFormFields
                fields={caseFields}
                control={control}
                errors={errors}
                gridCols="grid-cols-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  ),
);

EmailSmsFormSidebar.displayName = "EmailSmsFormSidebar";

export default EmailSmsFormSidebar;
