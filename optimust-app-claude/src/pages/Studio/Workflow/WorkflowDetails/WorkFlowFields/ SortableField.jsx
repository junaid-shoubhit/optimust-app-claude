import { AiFillStar } from "react-icons/ai";
import { FiMenu, FiTrash2 } from "react-icons/fi";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from "react";
import DeleteButton from "../../../../../components/Forms/Buttons/DeleteButton";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "../../../../../services/apiBinding";
// import { toast } from "react-toastify";

const SortableField = ({
  field,
  isSorting,
  selectedField,
  setSelectedField,
  workflowId,
  setMode,
}) => {
  // const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  // const deleteFieldMutation = useMutation({
  //   mutationFn: (id) =>
  //     apiRequest({
  //       apiPath: `/WorkflowField/${id}`,
  //       method: "delete",
  //     }),

  //   onSuccess: (_, id) => {
  //     console.log("id", id);
  //     queryClient.setQueryData(["workflow-fields", workflowId], (oldData) => {
  //       if (!oldData) return oldData;
  //       console.log("oldData", oldData);

  //       return {
  //         ...oldData,
  //         workFlowFields: oldData.workFlowFields.filter((f) => f.id !== id),
  //         dataSize: oldData.dataSize - 1,
  //       };
  //     });

  //     queryClient.invalidateQueries({
  //       queryKey: ["remaining-workflow-fields", workflowId],
  //     });

  //     toast.success("Field deleted successfully");
  //   },

  //   onError: () => {
  //     toast.error("Failed to delete field");
  //   },
  // });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedField?.id === field.id;

  // const handleDelete = (e) => {
  //   e.stopPropagation();
  //   deleteFieldMutation.mutate(field.id);
  // };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 rounded-xl transition ${
        isDragging
          ? "opacity-40"
          : isSelected
            ? "bg-blue-50"
            : "hover:bg-gray-100"
      }`}
      onClick={() => {
        !isSorting &&
          (setSelectedField({ ...field, isEdit: true }), setMode("add"));
      }}
    >
      {isSorting && (
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400"
        >
          <FiMenu size={16} />
        </span>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-sm truncate">{field.name}</p>
          {field.isImportant && (
            <AiFillStar className="text-yellow-400 text-sm shrink-0" />
          )}
        </div>

        <p className="text-xs text-gray-500 truncate">{field.type}</p>
      </div>

      {!isSorting && (
        // <button
        //   onClick={handleDelete}
        //   disabled={deleteFieldMutation.isPending}
        //   className="text-red-400 hover:text-red-600 transition"
        // >
        //   <FiTrash2 size={16} />
        // </button>
        <div
          onClick={(e) => e.stopPropagation()} // 🚀 VERY IMPORTANT (prevents card click)
        >
          <DeleteButton
            id={field.id}
            apiPath="/WorkflowField/:id"
            invalidateKeys={[
              ["workflow-fields", workflowId],
              ["remaining-workflow-fields", workflowId],
            ]}
            message="Delete this field?"
            dataKey="workFlowFields" // 🔥 IMPORTANT (matches your API)
            className="!text-red-400 hover:!text-red-600 !p-0 !w-fit"
          />
        </div>
      )}
    </div>
  );
};

export default memo(SortableField);
