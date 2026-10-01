import React from "react";

import DynamicFormFields from "../../../components/Forms/DynamicForm/UserDynamicForm";
import Input from "../../../components/Forms/Input/Input";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";

import EmailBodyEditor from "./components/EmailBodyEditor";

const subjectField = [
  {
    name: "subject",
    label: "Subject",
    component: Input,
    rules: { required: "Subject is required" },
    props: {
      type: "text",
      isRequired: true,
      placeholder: "Enter subject",
      noErrorMessage: true,
    },
  },
];

const EmailSmsComposerPanel = React.memo(
  ({
    isMail,
    control,
    errors,
    isReplacingTags,
    onEditorReady,
    hideSubmit,
    isBusy,
    onReset,
  }) => (
    <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-white min-h-125">
      {/* -------------------------------------------------------- */}
      {/* SUBJECT                                                   */}
      {/* -------------------------------------------------------- */}

      {isMail && (
        <div className="px-2 sm:px-3 border-b border-gray-100 shrink-0 bg-white">
          <DynamicFormFields
            fields={subjectField}
            control={control}
            errors={errors}
            gridCols="grid-cols-1"
          />
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* EDITOR                                                   */}
      {/* -------------------------------------------------------- */}

      <EmailBodyEditor
        control={control}
        errors={errors}
        isReplacingTags={isReplacingTags}
        onReady={onEditorReady}
      />

      {/* -------------------------------------------------------- */}
      {/* FOOTER                                                    */}
      {/* -------------------------------------------------------- */}

      {!hideSubmit && (
        <div className="border-t border-gray-100 bg-white px-3 sm:px-6 py-3 shrink-0">
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <CustomButton
              label="Reset"
              type="button"
              className="outlineBtn w-full sm:w-auto"
              onClick={onReset}
            />

            <CustomButton
              label={isBusy ? "Sending..." : "Send"}
              type="submit"
              className="saveBtn w-full sm:w-auto"
              disabled={isBusy}
            />
          </div>
        </div>
      )}
    </div>
  ),
);

EmailSmsComposerPanel.displayName = "EmailSmsComposerPanel";

export default EmailSmsComposerPanel;
