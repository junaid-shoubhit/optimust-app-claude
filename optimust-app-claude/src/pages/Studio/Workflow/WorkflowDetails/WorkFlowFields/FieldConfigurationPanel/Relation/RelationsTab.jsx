import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../../../../../services/apiBinding";
import RelationList from "./RelationList";
import RelationForm from "./RelationForm";

const RelationTab = ({ workflowId, fields, entityCodeId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRelation, setEditingRelation] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["workflowRelations", workflowId],
    enabled: !!workflowId,
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "WorkflowRelation/page",
        method: "post",
        payload: {
          workFlowId: workflowId,
          page: 1,
          pageSize: 999,
        },
        signal,
      }),
  });

  const relations = data?.workFlowRelations || [];

  const startAdd = () => {
    setEditingRelation(null);
    setIsEditing(true);
  };

  const startEdit = (relation) => {
    setEditingRelation(relation);
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {!isEditing && (
        <RelationList
          relations={relations}
          isLoading={isLoading}
          onAdd={startAdd}
          onEdit={startEdit}
          workflowId={workflowId}
        />
      )}

      {isEditing && (
        <RelationForm
          workflowId={workflowId}
          entityCodeId={entityCodeId}
          fields={fields}
          editRelation={editingRelation}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default RelationTab;
