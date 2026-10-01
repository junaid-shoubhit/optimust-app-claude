import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../../services/apiBinding";
import StepModal from "../../../../../../../components/Modal/StepModal/StepModal";

/* =========================================================
   NOTES CONFIG
========================================================= */

const NOTES_FIELDS = [
  {
    columnName: "Type",
    type: "select",
    parameterName: "4378",
  },
  {
    columnName: "Comments",
    type: "textarea",
    parameterName: "4384",
  },
  {
    columnName: "Subject",
    type: "text",
    parameterName: "5078",
  },
];

/* =========================================================
   NOTES FILTER QUERY
========================================================= */

const useNotesFiltersQuery = ({ entityId, enabled = true }) => {
  return useQuery({
    queryKey: ["notes-filters", entityId],

    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/TableFilter/GetTableFilters",
        method: "POST",
        signal,
        payload: {
          moduleId: 5268,
          entityCodeId: entityId,
          tableName: "dynamicPage",
        },
      }),

    enabled: enabled && !!entityId,

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,
  });
};

/* =========================================================
   NOTES DATA QUERY
========================================================= */

const useNotesQuery = ({ entityId, enabled = true }) => {
  const payload = useMemo(
    () => ({
      page: 1,
      pageSize: 50,

      filters: [
        {
          parameterName: "5072",
          value: entityId,
          label: "Case",
        },
        {
          parameterName: "5077",
          value: 3,
          value2: null,
          label: "Note",
        },
      ],

      sortCriteria: [],

      moduleId: 5293,
      entityCodeId: 210,
    }),
    [entityId],
  );

  return useQuery({
    queryKey: ["notes", entityId],

    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/Utility/GetDynamicPage",
        method: "POST",
        signal,
        payload,
      }),

    enabled: enabled && !!entityId,

    staleTime: 5 * 60 * 1000,

    keepPreviousData: true,

    refetchOnWindowFocus: false,
  });
};

/* =========================================================
   NOTES CONTENT
========================================================= */

const NotesContent = ({ entityId }) => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  console.log("selectedNote", selectedNote);
  const {
    data: filtersData,
    isLoading: isFiltersLoading,
    isError: isFiltersError,
    error: filtersError,
  } = useNotesFiltersQuery({
    entityId,
  });

  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
    error: notesError,
  } = useNotesQuery({
    entityId,
  });

  const noteFields = useMemo(() => {
    const apiFields = filtersData?.data || [];

    return NOTES_FIELDS.map((requiredField) => {
      const apiField = apiFields.find(
        (field) =>
          String(field.parameterName) === String(requiredField.parameterName),
      );

      return {
        ...requiredField,
        ...apiField,
      };
    });
  }, [filtersData]);

  const notes = useMemo(() => {
    return notesData?.data || [];
  }, [notesData]);

  const queryKeys = useMemo(
    () => ({
      pageQueryKey: ["notes", entityId],
      workFlowPageKey: [
        "dynamic-5293",
        5293,
        {
          page: 1,
          pageSize: 50,
          filters: [
            {
              parameterName: "5072",
              value: entityId,
              label: "Case",
            },
          ],
          sortCriteria: [],
        },
      ],
    }),
    [entityId],
  );

  /* =======================================================
     ADD NOTE
  ======================================================= */

  const handleAddNote = () => {
    setSelectedNote(null);
    setIsFormOpen(true);
  };

  /* =======================================================
     EDIT NOTE
  ======================================================= */

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsFormOpen(true);
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const handleCloseForm = () => {
    setSelectedNote(null);
    setIsFormOpen(false);
  };

  /* =======================================================
     FORM SUCCESS
  ======================================================= */

  const handleFormSuccess = async () => {
    setSelectedNote(null);
    setIsFormOpen(false);

    await queryClient.invalidateQueries({
      queryKey: ["notes", entityId],
    });
  };

  /* =======================================================
     MODAL DETAILS
  ======================================================= */

  const modalDetails = useMemo(
    () => ({
      ...(selectedNote || {}),

      prefillValues: {
        5072: {
          definitionId: 4393,
          value: entityId,
          label: `AUTO-CASE-${entityId}`,
          definitionName: "Case Number",
          isImportant: true,
          type: "text",
          dataType: "nvarchar(max)",
          rowIndex: 1,
          workFlowId: 1293,
          entityId,
          tabTypeId: 1,
          redirectEntityCodeId: null,
          redirectEntityCode: null,
          redirectPath: null,
        },
        5077: {
          label: "Note",
          value: 3,
          id: 3,
          name: "Note",
          firm_id: "",
        },
      },
    }),
    [entityId, selectedNote],
  );

  /* =======================================================
     FORM VIEW
  ======================================================= */

  if (isFormOpen) {
    return (
      <StepModal
        key={`${entityId}-${selectedNote?.id || "new"}`}
        isNoModal={true}
        id={selectedNote?.id || 0}
        entityCodeId={210}
        moduleId={5293}
        designType={"no-tabs"}
        onClose={handleCloseForm}
        colSize={1}
        details={modalDetails}
        queryKeys={queryKeys}
        hideParentFields={true}
      />
      //  <StepModal
      //     visible={visible}
      //     setVisible={setVisible}
      //     id={details?.id || 0}
      //     title={config?.headerName || activeMenu?.label}
      //     widthConfig={config?.stepModal?.widthConfig}
      //     entityCode={activeMenu?.entityCode}
      //     entityCodeId={activeMenu?.entityCodeId}
      //     moduleId={activeMenu?.id}
      //     designType={activeMenu?.designType}
      //     colSize={config?.stepModal?.colSize || ""}
      //     StepOneComponent={StepOneComponent}
      //     details={modalDetails}
      //     selectedMassIds={massUpdateConfig.selectedMassIds}
      //     isMassUpdate={massUpdateConfig.isMassUpdate}
      //     initialStep={massUpdateConfig.initialStep}
      //     queryKeys={queryKeys}
      //   />
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (isFiltersLoading || isNotesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <i className="pi pi-spin pi-spinner" />
          <span>Loading notes...</span>
        </div>
      </div>
    );
  }

  /* =======================================================
     FILTER ERROR
  ======================================================= */

  if (isFiltersError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-sm text-red-500">
          {filtersError?.message || "Failed to load note filters."}
        </p>
      </div>
    );
  }

  /* =======================================================
     NOTES ERROR
  ======================================================= */

  if (isNotesError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-sm text-red-500">
          {notesError?.message || "Failed to load notes."}
        </p>
      </div>
    );
  }

  /* =======================================================
     NOTES LIST
  ======================================================= */

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto bg-slate-50 p-3">
        {!notes.length ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <i className="pi pi-file-edit text-3xl mb-2" />
            <span className="text-sm">No notes found.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note, index) => {
              const typeField = noteFields.find(
                (field) => String(field.parameterName) === "4378",
              );

              const commentsField = noteFields.find(
                (field) => String(field.parameterName) === "4384",
              );

              const subjectField = noteFields.find(
                (field) => String(field.parameterName) === "5078",
              );

              const type = note?.[typeField?.parameterName];
              const comments = note?.[commentsField?.parameterName];
              const subject = note?.[subjectField?.parameterName];

              return (
                <div
                  key={note?.id ?? index}
                  className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="px-3 py-3 border-b border-slate-100">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="pi pi-file-edit text-teal-600 text-xs" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0 text-xs font-semibold text-slate-800 leading-5 whitespace-normal break-words">
                            {subject || "Untitled Note"}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEditNote(note)}
                            className="w-4 h-4 shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                            title="Edit note"
                          >
                            <i className="pi pi-pencil text-xs!" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {type && (
                      <div className="mt-2 w-fit max-w-full px-2 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium leading-4 whitespace-normal break-words">
                        {type}
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2">
                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                      {comments || "No comments"}
                    </div>
                  </div>

                  <div className="px-3 py-1 border-t border-slate-100 flex items-start justify-between gap-3 text-[9px] text-slate-400">
                    <span className="min-w-0 flex-1 break-words">
                      {note?.createdBy || ""}
                    </span>

                    <span className="shrink-0 text-right whitespace-nowrap">
                      {note?.created
                        ? new Date(note.created).toLocaleString("en-US")
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 py-2.5 bg-white border-t border-slate-200">
        <button
          type="button"
          onClick={handleAddNote}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
        >
          <i className="pi pi-plus text-sm" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

export default NotesContent;
