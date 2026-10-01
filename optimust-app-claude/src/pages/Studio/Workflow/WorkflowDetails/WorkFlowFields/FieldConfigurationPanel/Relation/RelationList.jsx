import { memo } from "react";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import DeleteButton from "../../../../../../../components/Forms/Buttons/DeleteButton";
import { FiEdit2 } from "react-icons/fi";

const RelationRow = memo(({ relation, onEdit, workflowId }) => {
  console.log("relation", relation);
  return (
    <tr className="border-t hover:bg-gray-50 transition">
      <td className="px-3 py-2 text-sm">{relation.parentFieldName}</td>
      <td className="px-3 py-2 text-sm">{relation.chieldFieldName}</td>
      <td className="px-3 py-2 text-sm">{relation.name}</td>

      <td className="px-3 py-2 text-sm">
        <div className="flex gap-3">
          {/* <button
            className="text-blue-600 hover:underline"
            onClick={() => onEdit(relation)}
          >
            Edit
          </button> */}
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(relation)}
            title="Edit Rule"
          >
            <FiEdit2 size={16} />
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <DeleteButton
              id={relation?.id}
              message="Delete this rule?"
              apiPath="WorkflowRelation/:id"
              invalidateKeys={[["workflowRelations", workflowId]]}
              // onDelete={() =>
              //   deleteValidation(validationIndex, ruleIndex)
              // }
              className="text-red-500! hover:text-red-700! p-0! w-fit!"
            />
          </div>

          {/* <button className="text-red-500 hover:underline">
            Delete
          </button> */}
        </div>
      </td>
    </tr>
  );
});

const RelationList = ({
  relations = [],
  onAdd,
  onEdit,
  isLoading,
  workflowId,
}) => {
  return (
    <div className="flex flex-col h-full rounded-lg bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b-[0.5px] border-(--border-inverse)  bg-white">
        <h3 className="text-sm font-semibold text-gray-700">
          Fields Relations
        </h3>

        <CustomButton
          iconPos="left"
          icon="pi pi-plus"
          className="saveBtn"
          label="Add Relation"
          onClick={onAdd}
        />
      </div>

      {/* Table */}
      <div className="p-3 overflow-auto">
        {isLoading ? (
          <div className="text-sm text-gray-400">Loading relations...</div>
        ) : relations.length === 0 ? (
          <div className="text-sm text-gray-400">No relations added</div>
        ) : (
          <table className="w-full border rounded-lg overflow-hidden bg-white">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="text-left px-3 py-2">Parent Field</th>
                <th className="text-left px-3 py-2">Child Field</th>
                <th className="text-left px-3 py-2">Relation Type</th>
                <th className="text-left px-3 py-2 w-[120px]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {relations.map((relation) => (
                <RelationRow
                  key={relation.id}
                  relation={relation}
                  onEdit={onEdit}
                  workflowId={workflowId}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RelationList;
