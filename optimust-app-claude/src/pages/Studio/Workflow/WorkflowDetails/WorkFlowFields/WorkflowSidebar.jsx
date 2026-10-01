import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FiMenu } from "react-icons/fi";
import { Skeleton } from "primereact/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import Input from "../../../../../components/Forms/Input/Input";
import SortableField from "./ SortableField";
import PendingFields from "./PendingFields";
import { useSortableFields } from "./hooks/useSortableFields";
import { apiRequest } from "../../../../../services/apiBinding";
import { getId } from "../../../../../utils/constants/formConstants";

const WorkflowSidebar = ({
  fields,
  pendingFields,
  setPendingFields,
  setMode,
  mode,
  selectedField,
  setSelectedField,
  workflowId,
  isLoading,
}) => {
  const queryClient = useQueryClient();

  const [isSorting, setIsSorting] = useState(false);
  const [search, setSearch] = useState("");

  /* -------------------------------------------------------------------------- */
  /*                                   FILTER                                   */
  /* -------------------------------------------------------------------------- */

  const {
    sortableFields,
    activeItem,
    handleDragStart,
    handleDragEnd,
    resetOrder,
  } = useSortableFields(fields);

  const visibleFields = useMemo(() => {
    return sortableFields.filter((f) =>
      f.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [sortableFields, search]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  /* -------------------------------------------------------------------------- */
  /*                              CACHE UPDATE HELPERS                          */
  /* -------------------------------------------------------------------------- */

  const updateWorkflowFieldsCache = useCallback(
    (updater) => {
      queryClient.setQueryData(["workflow-fields", workflowId], updater);
    },
    [queryClient, workflowId],
  );

  /* -------------------------------------------------------------------------- */
  /*                                  MUTATIONS                                 */
  /* -------------------------------------------------------------------------- */

  const workflowFieldMutation = useMutation({
    mutationFn: ({ method, payload }) =>
      apiRequest({
        apiPath: "WorkflowField",
        method,
        payload,
      }),

    onSuccess: (response, variables) => {
      const { action } = variables;
      const data = response?.data || [];

      /* ---------------------------- CREATE FIELDS ---------------------------- */

      if (action === "create") {
        queryClient.setQueryData(["workflow-fields", workflowId], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            workFlowFields: [...oldData.workFlowFields, ...data],
          };
        });

        queryClient.setQueryData(
          ["remaining-workflow-fields", workflowId],
          (oldData) => {
            if (!oldData) return oldData;

            const createdIds = data.map((f) => f.fieldDefinitionId);

            return {
              ...oldData,
              workFlowFieldNameDT: oldData.workFlowFieldNameDT.filter(
                (field) => !createdIds.includes(field.id),
              ),
            };
          },
        );
        toast.success(response?.message || "Fields Created Successfully");
      }

      /* ---------------------------- UPDATE FIELDS ---------------------------- */

      if (action === "update") {
        const updatedMap = new Map(data.map((f) => [f.id, f]));

        queryClient.setQueryData(["workflow-fields", workflowId], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            workFlowFields: oldData.workFlowFields.map((field) =>
              updatedMap.has(field.id)
                ? { ...field, ...updatedMap.get(field.id) }
                : field,
            ),
          };
        });
        toast.success(response?.message || "Fields Update Successfully");
      }

      /* ----------------------------- SORT FIELDS ----------------------------- */

      if (action === "sort") {
        queryClient.setQueryData(["workflow-fields", workflowId], (oldData) => {
          if (!oldData) return oldData;

          const updated = [...oldData.workFlowFields];

          variables.payload.forEach((item) => {
            const field = updated.find((f) => f.id === item.id);
            if (field) field.order = item.sortOrder;
          });

          updated.sort((a, b) => a.order - b.order);

          return {
            ...oldData,
            workFlowFields: updated,
          };
        });

        toast.success("Fields Sorted Successfully");
      }
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                              ORDER SAVE HANDLER                            */
  /* -------------------------------------------------------------------------- */

  const handleSaveOrder = async () => {
    const payload = sortableFields.map((f, index) => ({
      id: f.Id,
      workFlowId: workflowId,
      fieldDefinitionId: f.fieldDefinitionId,
      isImportant: f.isImportant,
      isRelation: f.isRelation,
      defaultValue: f.defaultValue,
      sortOrder: index + 1,
      name: f.name,
      formatterId: f?.formatterId,
      validationId: f?.validationId,
    }));

    await workflowFieldMutation.mutateAsync({
      method: "patch",
      payload,
      action: "sort",
    });

    updateWorkflowFieldsCache((oldData) => {
      if (!oldData) return oldData;

      const updated = [...oldData.workFlowFields];

      payload.forEach((item) => {
        const field = updated.find((f) => f.id === item.id);
        if (field) field.order = item.sortOrder;
      });

      updated.sort((a, b) => a.order - b.order);

      return {
        ...oldData,
        workFlowFields: updated,
      };
    });
    setIsSorting(false);
  };

  /* -------------------------------------------------------------------------- */
  /*                                SAVE HANDLER                                */
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!pendingFields.length) return;

    const newFields = pendingFields.filter((f) => !f.isEdit);
    const editedFields = pendingFields.filter((f) => f.isEdit);
    const createPayload = newFields.map((f) => ({
      id: 0,
      workFlowId: workflowId,
      fieldDefinitionId: f.id,
      name: f.name,
      isImportant: f.isImportant,
      isRelation: f.isRelation,
      defaultValue: f.defaultValue,
      validationId: getId(f?.validation),
      formatterId: getId(f?.formatter),
    }));

    const updatePayload = editedFields.map((f) => ({
      id: f.id,
      workFlowId: workflowId,
      fieldDefinitionId: f.fieldDefinitionId,
      name: f.name,
      isImportant: f.isImportant,
      isRelation: f.isRelation,
      defaultValue: f.defaultValue,
      sortOrder: f.orderByExpression,
      validationId: getId(f?.validation),
      formatterId: getId(f?.formatter),
    }));

    try {
      const promises = [];

      if (createPayload.length) {
        promises.push(
          workflowFieldMutation.mutateAsync({
            method: "post",
            payload: createPayload,
            action: "create",
          }),
        );
      }

      if (updatePayload.length) {
        promises.push(
          workflowFieldMutation.mutateAsync({
            method: "patch",
            payload: updatePayload,
            action: "update",
          }),
        );
      }

      await Promise.all(promises);
      setPendingFields([]);
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="w-60 min-w-[200px] flex flex-col border-r-[0.5px] border-(--border-inverse) h-full">
      {/* SEARCH */}
      <div className="flex items-center gap-3 p-3 border-b-[0.5px] border-(--border-inverse)">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fields..."
          noErrorMessage
          className="w-40!"
        />

        <CustomButton
          text
          icon={isSorting ? "pi pi-times" : "pi pi-sort-alt"}
          className={`p-0! w-fit! ${isSorting ? "text-red-500!" : ""}`}
          onClick={() => {
            if (isSorting) resetOrder();
            setIsSorting((prev) => !prev);
          }}
        />

        <CustomButton
          text
          icon="pi pi-cog"
          className={`p-0! w-fit! ${
            mode === "config" ? "text-blue-500! bg-blue-50!" : ""
          }`}
          onClick={() => setMode("config")}
        />
      </div>

      <PendingFields
        pendingFields={pendingFields}
        setPendingFields={setPendingFields}
      />

      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 border-b-[0.5px] border-(--border-inverse) bg-white">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Fields Added ({fields?.length})
        </p>

        <CustomButton
          text
          icon="pi pi-plus"
          className={`p-0.5! w-fit! ${
            mode === "list" ? "text-blue-500! bg-blue-50!" : ""
          }`}
          onClick={() => setMode("list")}
        />
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton shape="circle" size="1.5rem" />
              <div className="flex-1">
                <Skeleton width="70%" height="12px" className="mb-1" />
                <Skeleton width="40%" height="10px" />
              </div>
            </div>
          ))}

        {!isLoading &&
          !isSorting &&
          visibleFields.map((field) => (
            <SortableField
              key={field.id}
              workflowId={workflowId}
              field={field}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
              setMode={setMode}
              pendingFields={pendingFields}
            />
          ))}

        {!isLoading && isSorting && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortableFields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortableFields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  isSorting
                  selectedField={selectedField}
                  setSelectedField={setSelectedField}
                  setMode={setMode}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeItem && (
                <div className="bg-white shadow-2xl flex items-center gap-3 p-2 rounded-xl">
                  <span className="cursor-grab text-gray-400">
                    <FiMenu size={16} />
                  </span>

                  <div className="flex-1">
                    <p className="font-semibold text-sm">{activeItem.name}</p>
                    <p className="text-xs text-gray-500">{activeItem.type}</p>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {isSorting && (
        <div className="p-3 border-t-[0.5px] border-(--border-inverse) bg-white">
          <CustomButton
            label="Save Order"
            className="w-full saveBtn"
            onClick={handleSaveOrder}
          />
        </div>
      )}

      {pendingFields.length > 0 && !isSorting && (
        <div className="p-3 border-t-[0.5px] border-(--border-inverse) bg-white">
          <CustomButton
            label={`Save ${pendingFields.length} Field${
              pendingFields.length > 1 ? "s" : ""
            }`}
            className="w-full saveBtn"
            onClick={handleSave}
          />
        </div>
      )}
    </div>
  );
};

export default WorkflowSidebar;
