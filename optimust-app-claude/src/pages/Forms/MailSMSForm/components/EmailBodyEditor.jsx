import React from "react";
import { Controller } from "react-hook-form";
import classNames from "classnames";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import EditorLoader from "./EditorLoader";

const EmailBodyEditor = React.memo(
  ({ control, errors, isReplacingTags, onReady }) => (
    <div className="flex-1 overflow-y-hidden bg-gray-50 p-2 sm:p-3">
      <div className="bg-white rounded-2xl overflow-hidden relative h-full flex flex-col">
        {isReplacingTags && <EditorLoader />}

        <Controller
          name="body"
          control={control}
          rules={{
            required: "Message is required",
          }}
          render={({ field }) => (
            <div
              className={classNames("flex-1 min-h-0 overflow-hidden", {
                "pointer-events-none opacity-60": isReplacingTags,
              })}
            >
              <CKEditor
                editor={ClassicEditor}
                data={field.value || ""}
                disabled={isReplacingTags}
                onReady={onReady}
                onChange={(event, editor) => {
                  field.onChange(editor.getData());
                }}
              />

              {errors?.body && (
                <p className="text-red-500 text-xs mt-2 px-2">
                  {errors.body.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <style>
        {`
          .ck-editor__editable_inline {
            min-height: 420px;
            max-height: 320px;
            overflow-y: auto;
          }

          .ck-editor__top {
            border-bottom: 1px solid #e5e7eb;
          }

          .ck-editor__main {
            min-height: 0;
          }

          .ck.ck-editor {
            width: 100%;
          }

          .ck-toolbar {
            border-top-left-radius: 12px !important;
            border-top-right-radius: 12px !important;
          }

          .ck-editor__editable {
            border-bottom-left-radius: 12px !important;
            border-bottom-right-radius: 12px !important;
          }
        `}
      </style>
    </div>
  ),
);

EmailBodyEditor.displayName = "EmailBodyEditor";

export default EmailBodyEditor;
