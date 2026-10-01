import { memo } from "react";
import StepModal from "../../../components/Modal/StepModal/StepModal";
import { useOutletContext } from "react-router-dom";

const DynamicManage = ({ entityId, activeMenu }) => {
  const { invalidateKeys } = useOutletContext();
  return (
    activeMenu?.create && (
      <StepModal
        key={entityId}
        id={entityId}
        title={activeMenu?.label}
        entityCode={activeMenu?.entityCode}
        entityCodeId={activeMenu?.entityCodeId}
        moduleId={activeMenu?.id}
        designType={activeMenu?.designType}
        queryKey={invalidateKeys}
      />
    )
  );
};

export default memo(DynamicManage);
