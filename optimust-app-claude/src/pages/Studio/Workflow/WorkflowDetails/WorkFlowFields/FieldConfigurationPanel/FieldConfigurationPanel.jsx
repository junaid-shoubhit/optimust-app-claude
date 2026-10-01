import { useState } from "react";
import FieldConfigTabs from "./FieldConfigTabs";
import ValidationTab from "./Validation/ValidationTab";
import RelationTab from "./Relation/RelationsTab";
import TabRules from "./TabRules/TabRules";
const FieldConfigurationPanel = ({ fields, workflowId, entityCodeId }) => {
  const [activeTab, setActiveTab] = useState("validation");

  return (
    <div className="h-full flex flex-col">
      <FieldConfigTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-y-auto">
        {activeTab === "validation" && (
          <ValidationTab fields={fields} workflowId={workflowId} />
        )}

        {activeTab === "relations" && (
          <RelationTab
            fields={fields}
            workflowId={workflowId}
            entityCodeId={entityCodeId}
          />
        )}
        {activeTab === "tabValidation" && (
          <TabRules fields={fields} workflowId={workflowId} />
        )}
      </div>
    </div>
  );
};

export default FieldConfigurationPanel;
