import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useCallback } from "react";

import DynamicRenderer from "./DynamicRenderer";
import { useDynamicConfig } from "./hooks/useDynamicConfig";
import { useDynamicData } from "./hooks/useDynamicData";
import { useFormManagerConfig } from "./hooks/useFormManagerConfig";
import { COMPONENT_REGISTRY } from "../componentRegistry";
import { useUIStateMachine } from "./stateMachine/uiMachine";

const DynamicContainer = ({
  activeMenu,
  isMenuLoading,
  invalidateKeys,
  formManager,
}) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const pageId = useMemo(
    () => Number(new URLSearchParams(search).get("id")) || null,
    [search],
  );

  const [visible, setVisible] = useState(false);

  const shouldFetch =
    pageId &&
    activeMenu?.entityCodeId &&
    activeMenu?.designType !== "tabs-hybrid-contacts";

  const config = useDynamicConfig(activeMenu);

  const StepOneComponent = useMemo(() => {
    const key = config?.stepModal?.componentKey;
    return key ? COMPONENT_REGISTRY[key] : null;
  }, [config]);

  const { apiData, mergedData, dynamicValues, loading, error } = useDynamicData(
    { pageId, activeMenu, shouldFetch },
  );
  const sectionResult = useFormManagerConfig({
    formManager,
    activeMenu,
  });

  const isNotFound = sectionResult.type === "NOT_FOUND";
  const activeSection = sectionResult.config;
  const uiState = useUIStateMachine({
    isMenuLoading,
    hasMenu: !!activeMenu,
    isDataLoading: loading,
    error,
  });

  const handleEdit = useCallback(() => setVisible(true), []);

  return (
    <DynamicRenderer
      navigate={navigate}
      entityId={pageId}
      activeMenu={activeMenu}
      visible={visible}
      setVisible={setVisible}
      apiData={apiData}
      mergedData={mergedData}
      dynamicValues={dynamicValues}
      activeSection={activeSection}
      StepOneComponent={StepOneComponent}
      onEdit={handleEdit}
      uiState={uiState}
      isNotFound={isNotFound}
      formManager={formManager}
      invalidateKeys={invalidateKeys}
      staticQueryKey={config?.queryKey}
    />
  );
};

export default DynamicContainer;
