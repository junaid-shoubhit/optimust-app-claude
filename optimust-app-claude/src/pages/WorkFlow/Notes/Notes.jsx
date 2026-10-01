import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import { StickyNote } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "../../../components/Forms/Input/Input";
import SelectField from "../../../components/Forms/Select/Select";
import { useForm, Controller } from "react-hook-form";
import { apiRequest } from "../../../services/apiBinding";
import DeleteButton from "../../../components/Forms/Buttons/DeleteButton";
import { Pencil } from "lucide-react";
import { OverlayPanel } from "primereact/overlaypanel";
import { getId } from "../../../utils/constants/formConstants";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext";
// ─── Payloads ─────────────────────────────────────────────────────────────────

const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const NOTE_TYPE_PAYLOAD = createPayload("ctNoteTypes");
const CASE_NUMBER_PAYLOAD = createPayload("ctCaseNumber");

const NOTES_QUERY_KEY = "notes";

// ─── NoteForm ────────────────────────────────────────────────────────────────

const NoteForm = memo(({ initialData, onSave, onClose, entityCode }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: initialData?.subject ?? "",
      noteTypeId: initialData?.noteTypeId ?? null,
      entityid: initialData?.entityid ?? null,
      body: initialData?.body ?? "",
    },
  });

  const onSubmit = (values) => {
    onSave({
      ...values,
      noteTypeId: values.noteTypeId?.value ?? values.noteTypeId ?? "",
    });
    onClose?.();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[350px] p-3 flex flex-col gap-2"
    >
      <Controller
        name="subject"
        control={control}
        rules={{ required: "Title is required" }}
        render={({ field }) => (
          <Input
            {...field}
            label="Title"
            isRequired
            error={errors.subject?.message}
          />
        )}
      />
      <Controller
        name="noteTypeId"
        control={control}
        rules={{ required: "Note type is required" }}
        render={({ field }) => (
          <SelectField
            {...field}
            label="Note Type"
            payload={NOTE_TYPE_PAYLOAD}
            error={errors.noteTypeId?.message}
          />
        )}
      />

      {entityCode !== "case" && (
        <Controller
          name="entityid"
          control={control}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Case"
              payload={CASE_NUMBER_PAYLOAD}
            />
          )}
        />
      )}

      <Controller
        name="body"
        control={control}
        rules={{ required: "Description is required" }}
        render={({ field }) => (
          <Input
            {...field}
            label="Description"
            type="textarea"
            error={errors.body?.message}
          />
        )}
      />
      <div className="flex justify-end gap-2">
        <CustomButton
          label="Cancel"
          type="button"
          className="cancelBtn"
          onClick={onClose}
        />
        <CustomButton label="Save" type="submit" className="saveBtn" />
      </div>
    </form>
  );
});

// ─── NoteCard ─────────────────────────────────────────────────────────────────

const NoteCard = memo(({ note, onEdit, invalidateKeys, entityCode }) => {
  const editOp = useRef(null);

  return (
    <>
      <div
        onDoubleClick={(e) => editOp.current.toggle(e)}
        className="group relative bg-white rounded-xl border border-gray-300 px-3 py-2.5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-150"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 rounded-t-xl bg-gray-400" />

        {/* Type tag */}
        {note.noteType && (
          <span
            className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1.5 leading-none"
            style={{
              backgroundColor: "#5b5fc71a",
              color: "#5b5fc7",
            }}
          >
            {note.noteType}
          </span>
        )}

        {/* Title */}
        {note.subject && (
          <p className="text-xs font-semibold text-gray-800 truncate leading-snug">
            {note.subject}
          </p>
        )}

        {/* Description */}
        {note.body && (
          <p
            className="text-[11px] text-gray-500 mt-0.5 leading-relaxed"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "auto",
            }}
          >
            {note.body}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end items-center gap-1 mt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              editOp.current.toggle(e);
            }}
            className="p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={14} />
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <DeleteButton
              id={note?.id}
              apiPath="/Note/:id"
              invalidateKeys={invalidateKeys}
              message="Delete this note?"
              dataKey="noteFields"
            />
          </div>
        </div>
      </div>

      <OverlayPanel ref={editOp} dismissable showCloseIcon>
        <NoteForm
          entityCode={entityCode}
          initialData={{
            subject: note.subject,
            noteTypeId: note.noteTypeId
              ? { label: note.noteType, value: note.noteTypeId }
              : null,
            entityid: note.entityId
              ? { label: note.caseNumber, value: note.entityId }
              : null,
            body: note.body,
          }}
          onSave={(updated) => {
            onEdit(note.id, updated);
            editOp.current?.hide();
          }}
          onClose={() => editOp.current?.hide()}
        />
      </OverlayPanel>
    </>
  );
});

// ─── Main Notes Component ─────────────────────────────────────────────────────

const Notes = () => {
  const addNoteOp = useRef(null);
  const queryClient = useQueryClient();
  const { activeMenu } = useCustomNavigation();
  const { entityCodeId, entityCode } = activeMenu;
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");

  console.log(idParam);
  const invalidateKeys = useMemo(
    () => [[NOTES_QUERY_KEY, entityCodeId]],
    [entityCodeId],
  );

  console.log("notes activeMenu", activeMenu);
  // ── Fetch ──────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: [NOTES_QUERY_KEY, entityCodeId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/note/page",
        method: "post",
        payload: {
          page: 1,
          pageSize: 50,
          entityCodeId,
          entityId: Number(idParam) ? Number(idParam) : null,
        },
        signal,
      }),

    enabled: true,
  });

  const notes = useMemo(() => data?.notes ?? [], [data]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const { mutate: addNote } = useMutation({
    mutationFn: (form) =>
      apiRequest({
        apiPath: "/note",
        method: "post",
        payload: {
          ...form,
          entityid: getId(form?.entityid) ?? Number(idParam),
          entityCodeId,
          entityCode,
          isEmailTemplateLog: 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTES_QUERY_KEY, entityCodeId],
      });
    },
  });

  const { mutate: editNote } = useMutation({
    mutationFn: ({ id, form }) =>
      apiRequest({
        apiPath: "/note",
        method: "patch",
        payload: {
          ...form,
          entityCodeId,
          entityCode,
          id,
          entityid: getId(form?.entityid),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTES_QUERY_KEY, entityCodeId],
      });
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = useCallback(
    (form) => {
      addNote(form);
      addNoteOp.current?.hide();
    },
    [addNote],
  );

  const handleEdit = useCallback(
    (id, form) => {
      console.log("id", id);
      console.log("form", form);

      editNote({ id, form });
    },
    [editNote],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 bg-white shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-(--color-fontFour)">
          Notes
        </p>
        <CustomButton
          iconPos="left"
          label="Add Note"
          icon="pi pi-plus"
          className="iconSaveBtn"
          aria-label="Add Note"
          onClick={(e) => addNoteOp.current.toggle(e)}
        />
      </div>

      <OverlayPanel ref={addNoteOp} dismissable showCloseIcon>
        <NoteForm
          entityCode={entityCode}
          initialData={{
            subject: "",
            noteTypeId: null,
            entityid: null,
            body: "",
          }}
          onSave={handleAdd}
          onClose={() => addNoteOp.current?.hide()}
        />
      </OverlayPanel>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <i className="pi pi-spin pi-spinner text-gray-400 text-xl" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2 text-gray-400">
            <StickyNote size={32} strokeWidth={1.2} />
            <p className="text-xs font-medium">No notes yet</p>
            <p className="text-[11px]">Click "Add Note" to get started</p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              invalidateKeys={invalidateKeys}
              entityCode={entityCode}
            />
          ))
        )}
      </div>

      {/* Footer count */}
      {notes.length > 0 && (
        <div className="shrink-0 px-3 py-1.5 border-t border-gray-200 bg-white">
          <p className="text-[10px] text-gray-400">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notes;
