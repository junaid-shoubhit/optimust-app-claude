import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import WorkflowSidebar from "./WorkflowSidebar";
import RemainingFieldsList from "./RemainingFieldsList";
import AddFieldForm from "./AddFieldForm";
import { apiRequest } from "../../../../../services/apiBinding";
import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import FieldConfigurationPanel from "./FieldConfigurationPanel/FieldConfigurationPanel";

const WorkFlowFields = ({ workflowId, activeMenu, workflowTypeId }) => {
  const [mode, setMode] = useState("config");
  const [selectedField, setSelectedField] = useState(null);
  const [pendingFields, setPendingFields] = useState([]);

  const { data: workFlowFieldsData, isLoading: isFieldsLoading } = useQuery({
    queryKey: ["workflow-fields", workflowId],
    queryFn: () =>
      apiRequest({
        apiPath: "WorkflowField/page",
        method: "post",
        payload: {
          page: 1,
          pageSize: 99999,
          workFlowId: workflowId,
        },
      }),
    enabled: Boolean(workflowId),
  });

  const { data: remainingFieldsData, isLoading: isRemainingLoading } = useQuery(
    {
      queryKey: ["remaining-workflow-fields", workflowId],
      queryFn: () =>
        apiRequest({
          apiPath: "WorkflowField/RemaingWorkflowFields",
          method: "post",
          payload: {
            page: 1,
            pageSize: 99999,
            workFlowId: workflowId,
            tabId: 1,
          },
        }),
      enabled: Boolean(workflowId),
    },
  );

  const fields = workFlowFieldsData?.workFlowFields || [];

  const handleAddField = (selectedField) => {
    setPendingFields((prev) => {
      const index = prev.findIndex((f) => f.id === selectedField.id);

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...selectedField };
        return updated;
      }

      // Otherwise add new field
      return [...prev, { ...selectedField }];
    });

    setSelectedField(null);
    setMode("list");
  };

  const remainingFields = useMemo(() => {
    const apiFields = remainingFieldsData?.workFlowFieldNameDT || [];

    const pendingIds = pendingFields.map((f) => f.id);

    return apiFields.filter((field) => !pendingIds.includes(field.id));
  }, [remainingFieldsData, pendingFields]);

  useEffect(() => {
    setSelectedField(null);
    setPendingFields([]);
    setMode("config");
  }, [workflowId]);

  return (
    <div className="bg-white flex h-full">
      <WorkflowSidebar
        fields={fields}
        pendingFields={pendingFields}
        setPendingFields={setPendingFields}
        setMode={setMode}
        mode={mode}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        workflowId={workflowId}
        isLoading={isFieldsLoading}
      />

      <div className="flex-1 flex flex-col">
        {(mode === "add" || mode === "list") && (
          <div className="px-4 py-2 border-b-[0.5px] border-(--border-inverse)">
            {mode === "add" && activeMenu?.create && (
              <div className="flex items-center gap-2">
                <CustomButton
                  text
                  icon="pi pi-arrow-left"
                  className="p-0! w-8!"
                  onClick={() => {
                    setMode("list");
                    setSelectedField(null);
                  }}
                />

                <p className="font-semibold text-sm">
                  Add Field - {selectedField?.name}
                </p>
              </div>
            )}

            {mode === "list" && (
              <p className="text-sm text-gray-500">
                Remaining Fields : Select a field to add
              </p>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {mode === "config" && (
            <FieldConfigurationPanel
              workflowId={workflowId}
              selectedField={selectedField}
              fields={fields}
              entityCodeId={workflowTypeId}
            />
          )}

          {mode === "list" && (
            <RemainingFieldsList
              fields={remainingFields}
              isLoading={isRemainingLoading}
              workflowId={workflowId}
              onSelect={(field) => {
                setSelectedField({
                  ...field,
                  workflowId,
                  name: field.name,
                  isImportant: false,
                });
                setMode("add");
              }}
            />
          )}

          {mode === "add" && (
            <AddFieldForm
              selectedField={selectedField}
              setSelectedField={setSelectedField}
              onAdd={handleAddField}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkFlowFields;
