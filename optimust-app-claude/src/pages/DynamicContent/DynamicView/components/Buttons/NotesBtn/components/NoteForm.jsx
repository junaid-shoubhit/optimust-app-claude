import { useEffect, useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../../services/apiBinding";

/* =========================================================
   FIELD IDS
========================================================= */

const FIELD_IDS = {
  type: "4378",
  comments: "4384",
  subject: "5078",
  case: "5072",
};

/* =========================================================
   NOTE FORM
========================================================= */

const NoteForm = ({
  entityId,
  note,
  isEdit = false,
  filters = [],
  onClose,
  onSuccess,
}) => {
  /* =======================================================
     FORM STATE
  ======================================================= */

  const [formData, setFormData] = useState({
    [FIELD_IDS.type]: "",
    [FIELD_IDS.comments]: "",
    [FIELD_IDS.subject]: "",
    [FIELD_IDS.case]: entityId || "",
  });

  const [errors, setErrors] = useState({});

  /* =======================================================
     FILTER FIELDS
  ======================================================= */

  const typeField = useMemo(
    () =>
      filters?.find((field) => String(field.parameterName) === FIELD_IDS.type),
    [filters],
  );

  /* =======================================================
     EDIT / ADD INITIALIZATION
  ======================================================= */

  useEffect(() => {
    if (isEdit && note) {
      setFormData({
        [FIELD_IDS.type]: note?.[FIELD_IDS.type] || "",
        [FIELD_IDS.comments]: note?.[FIELD_IDS.comments] || "",
        [FIELD_IDS.subject]: note?.[FIELD_IDS.subject] || "",
        [FIELD_IDS.case]: entityId || note?.[FIELD_IDS.case] || "",
      });
    } else {
      setFormData({
        [FIELD_IDS.type]: "",
        [FIELD_IDS.comments]: "",
        [FIELD_IDS.subject]: "",
        [FIELD_IDS.case]: entityId || "",
      });
    }

    setErrors({});
  }, [isEdit, note, entityId]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldId]: "",
    }));
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = () => {
    const nextErrors = {};

    if (!formData[FIELD_IDS.type]) {
      nextErrors[FIELD_IDS.type] = "Type is required.";
    }

    if (!formData[FIELD_IDS.subject]?.trim()) {
      nextErrors[FIELD_IDS.subject] = "Subject is required.";
    }

    if (!formData[FIELD_IDS.comments]?.trim()) {
      nextErrors[FIELD_IDS.comments] = "Comments are required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =======================================================
     SAVE MUTATION
  ======================================================= */

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      return apiRequest({
        apiPath: isEdit
          ? "/Utility/DynamicPageUpdate"
          : "/Utility/DynamicPageCreate",
        method: "POST",
        payload,
      });
    },

    onSuccess: async (response) => {
      if (response?.success === false) {
        throw new Error(response?.message || "Failed to save note.");
      }

      if (onSuccess) {
        await onSuccess(response);
      }
    },
  });

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (event) => {
    event?.preventDefault?.();

    if (!validate()) {
      return;
    }

    const payload = {
      ...(isEdit && {
        id: note?.id,
      }),

      moduleId: 5293,
      entityCodeId: 210,

      data: {
        [FIELD_IDS.type]: formData[FIELD_IDS.type],
        [FIELD_IDS.comments]: formData[FIELD_IDS.comments],
        [FIELD_IDS.subject]: formData[FIELD_IDS.subject],
        [FIELD_IDS.case]: entityId,
      },
    };

    saveMutation.mutate(payload);
  };

  /* =======================================================
     TYPE OPTIONS
  ======================================================= */

  const typeOptions = useMemo(() => {
    if (!typeField) return [];

    return typeField?.options || typeField?.data || [];
  }, [typeField]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="shrink-0 flex items-center gap-2 px-3 py-3 border-b border-slate-200">
        <button
          type="button"
          onClick={onClose}
          disabled={saveMutation.isPending}
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          title="Back to notes"
        >
          <i className="pi pi-arrow-left" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800">
            {isEdit ? "Edit Note" : "Add New Note"}
          </div>

          <div className="text-xs text-slate-400">
            {isEdit ? "Update note details" : "Create a new note"}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="note-type"
              className="text-sm font-medium text-slate-700"
            >
              Type
            </label>

            {typeOptions.length > 0 ? (
              <Dropdown
                id="note-type"
                value={formData[FIELD_IDS.type]}
                options={typeOptions}
                onChange={(event) => handleChange(FIELD_IDS.type, event.value)}
                optionLabel="label"
                optionValue="value"
                placeholder="Select Type"
                className="w-full"
                disabled={saveMutation.isPending}
              />
            ) : (
              <InputText
                id="note-type"
                value={formData[FIELD_IDS.type]}
                onChange={(event) =>
                  handleChange(FIELD_IDS.type, event.target.value)
                }
                placeholder="Enter Type"
                className="w-full"
                disabled={saveMutation.isPending}
              />
            )}

            {errors[FIELD_IDS.type] && (
              <small className="text-red-500">{errors[FIELD_IDS.type]}</small>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="note-subject"
              className="text-sm font-medium text-slate-700"
            >
              Subject
            </label>

            <InputText
              id="note-subject"
              value={formData[FIELD_IDS.subject]}
              onChange={(event) =>
                handleChange(FIELD_IDS.subject, event.target.value)
              }
              placeholder="Enter subject"
              className="w-full"
              disabled={saveMutation.isPending}
            />

            {errors[FIELD_IDS.subject] && (
              <small className="text-red-500">
                {errors[FIELD_IDS.subject]}
              </small>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="note-comments"
              className="text-sm font-medium text-slate-700"
            >
              Comments
            </label>

            <InputTextarea
              id="note-comments"
              value={formData[FIELD_IDS.comments]}
              onChange={(event) =>
                handleChange(FIELD_IDS.comments, event.target.value)
              }
              placeholder="Enter comments"
              rows={8}
              autoResize
              className="w-full"
              disabled={saveMutation.isPending}
            />

            {errors[FIELD_IDS.comments] && (
              <small className="text-red-500">
                {errors[FIELD_IDS.comments]}
              </small>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="note-case"
              className="text-sm font-medium text-slate-700"
            >
              Case
            </label>

            <InputText
              id="note-case"
              value={String(entityId || "")}
              className="w-full bg-slate-100"
              disabled
            />
          </div>

          {saveMutation.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <div className="flex items-start gap-2 text-sm text-red-600">
                <i className="pi pi-exclamation-circle mt-0.5" />

                <span>
                  {saveMutation.error?.message || "Failed to save note."}
                </span>
              </div>
            </div>
          )}
        </div>
      </form>

      <div className="shrink-0 flex items-center justify-end gap-2 px-3 py-3 border-t border-slate-200 bg-white">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          onClick={onClose}
          disabled={saveMutation.isPending}
        />

        <Button
          type="button"
          label={isEdit ? "Update Note" : "Save Note"}
          icon={
            saveMutation.isPending ? "pi pi-spin pi-spinner" : "pi pi-check"
          }
          onClick={handleSubmit}
          loading={saveMutation.isPending}
        />
      </div>
    </div>
  );
};

export default NoteForm;
