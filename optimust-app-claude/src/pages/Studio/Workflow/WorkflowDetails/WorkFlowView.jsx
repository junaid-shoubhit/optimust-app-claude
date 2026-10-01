import { useMemo, useState } from "react";
import TopPanel from "../../../../components/Common/TopPanel";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../../services/apiBinding";
import { useLocation, useParams } from "react-router-dom";
import FormModal from "../../../../components/Modal/FormModal";
import WorkFlowForm from "../WorkFlowModalForm/WorkFlowForm";
import WorkFlowFields from "./WorkFlowFields/WorkFlowFields";
import { capitalize } from "../../../../utils/constant";
import EntityList from "../../../../components/Common/KeyValueList/EntityList";
import { useCustomNavigation } from "../../../../layouts/main/Navbar/NavigationContext";

const WorkFlowView = () => {
  const { search } = useLocation();
  const { workflowSlug } = useParams();
  const [visible, setVisible] = useState(false);
  const { activeMenu } = useCustomNavigation();
  /* ---------------- Parse Slug ---------------- */

  const { workflowType, workflowTypeId, workflowTypeKey } = useMemo(() => {
    if (!workflowSlug) return {};

    const [type, id, key] = workflowSlug.split("-");

    return {
      workflowType: capitalize(type),
      workflowTypeId: Number(id),
      workflowTypeKey: capitalize(key || type),
    };
  }, [workflowSlug]);

  /* ---------------- Workflow Id ---------------- */

  const workflowId = useMemo(() => {
    const params = new URLSearchParams(search);
    return Number(params.get("id"));
  }, [search]);

  /* ---------------- Fetch Workflow ---------------- */

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["workflow-details", workflowId],
    queryFn: () =>
      apiRequest({
        apiPath: `DynamicWorkflow/${workflowId}?moduleId=${activeMenu?.id}`,
        method: "get",
      }),
    enabled: Boolean(workflowId),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  const workflowData = {
    ...data?.data,
    workflowTypeMapping: data?.workflowTypeMapping || [],
    parentWorkflows: data?.parentWorkflowMapping || [],
  };
  return (
    <div className="flex h-full pt-2 gap-3 mr-3">
      <TopPanel
        title="Workflow Details"
        onEdit={() => setVisible(true)}
        canEdit={activeMenu?.update}
        isLoading={isLoading}
        width={250}
        heightOffset={62}
        variant={"list"}
      >
        {() => (
          <EntityList
            fieldData={workflowData}
            variant={"list"}
            configKey="workflow"
            columns={3}
            entityCode="workflow"
            isError={isError}
            isLoading={isLoading}
            errorMessage={error?.message}
          />
        )}
      </TopPanel>

      <section className="flex-1 min-w-0">
        <div className="h-[calc(100vh-62px)] shadow-md overflow-y-auto">
          <WorkFlowFields
            workflowId={workflowId}
            activeMenu={activeMenu}
            workflowTypeId={workflowTypeId}
          />
        </div>
      </section>

      {visible && (
        <FormModal
          visible={visible}
          setVisible={setVisible}
          title={`${workflowType} Workflow`}
          width="43vw"
        >
          <WorkFlowForm
            setVisible={setVisible}
            workflowData={workflowData}
            workflowTypeId={workflowTypeId}
            workflowTypeKey={workflowTypeKey}
            mode="edit"
            activeMenu={activeMenu}
          />
        </FormModal>
      )}
    </div>
  );
};

export default WorkFlowView;
