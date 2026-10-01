import { memo } from "react";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import DeleteButton from "../../../../../../../components/Forms/Buttons/DeleteButton";
import { FiEdit2 } from "react-icons/fi";

const TabRulesRow = memo(({ tabRule, onEdit, workflowId }) => {
  return (
    <tr className="border-t hover:bg-gray-50 transition">
      <td className="px-3 py-2 text-sm">{tabRule?.name}</td>
      <td className="px-3 py-2 text-sm">{tabRule?.ruleType}</td>
      {/* <td className="px-3 py-2 text-sm">{tabRule?.name}</td> */}

      <td className="px-3 py-2 text-sm">
        <div className="flex gap-3">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(tabRule)}
            title="Edit Rule"
          >
            <FiEdit2 size={16} />
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <DeleteButton
              id={tabRule?.id}
              message="Delete this rule?"
              apiPath={`WorkflowField/TabRule/${tabRule?.id}`}
              invalidateKeys={[["workflowRules", workflowId]]}
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

const TabRulesList = ({
  tabRules = [],
  onAdd,
  onEdit,
  isLoading,
  workflowId,
}) => {
  return (
    <div className="flex flex-col h-full rounded-lg bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b-[0.5px] border-(--border-inverse)  bg-white">
        <h3 className="text-sm font-semibold text-gray-700">Tabs Rules</h3>

        <CustomButton
          iconPos="left"
          icon="pi pi-plus"
          className="saveBtn"
          label="Add Tab Rules"
          onClick={onAdd}
        />
      </div>

      {/* Table */}
      <div className="p-3 overflow-auto">
        {isLoading ? (
          <div className="text-sm text-gray-400">Loading Tab Rules...</div>
        ) : tabRules.length === 0 ? (
          <div className="text-sm text-gray-400">No Tab Rules added</div>
        ) : (
          <table className="w-full border rounded-lg overflow-hidden bg-white">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Rule Type</th>
                {/* <th className="text-left px-3 py-2">Relation Type</th> */}
                <th className="text-left px-3 py-2 w-30">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tabRules.map((tabRule) => (
                <TabRulesRow
                  key={tabRule.id}
                  tabRule={tabRule}
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

export default TabRulesList;
