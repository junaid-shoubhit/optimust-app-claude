// GoToBtn.js - Updated
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";

import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import { apiRequest } from "../../../../../services/apiBinding";
import { useCustomNavigation } from "../../../../../layouts/main/Navbar/NavigationContext";
import { useActiveModule } from "../../../../../layouts/main/Navbar/useActiveModule";

const GoToBtn = ({ entityId, activeMenu }) => {
  const navigate = useNavigate();

  const { setActiveModule, lastModuleUrlsRef } = useCustomNavigation();
  const { modules } = useActiveModule();

  const { data: intakeData } = useQuery({
    queryKey: ["intake-entity", activeMenu?.entityCodeId, entityId],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: `/Intakes/EntityIdByEntityCode/${activeMenu?.entityCodeId}/${entityId}`,
        method: "get",
        signal,
      }),
    staleTime: Infinity,
    enabled: !!entityId && !!activeMenu?.entityCodeId,
  });

  if (!intakeData || Number(intakeData?.entityId) === 0) {
    return null;
  }

  const handleNavigation = () => {
    const label = intakeData?.label?.toLowerCase();

    let modulePath = "/intakes";
    let redirectPath = `/intakes/tabs-nested-dynamic/pi/overview?id=${intakeData.entityId}`;

    switch (label) {
      case "case":
      case "cases":
        modulePath = "/cases";
        redirectPath = `/cases/tabs-dynamic/pi/overview?id=${intakeData.entityId}`;
        break;
      default:
        break;
    }

    const targetModule = modules.find((m) => m.path === modulePath);

    // Set the last URL for the target module BEFORE navigating
    if (targetModule) {
      const url = new URL(redirectPath, window.location.origin);
      lastModuleUrlsRef.current[targetModule.id] = {
        path: url.pathname,
        search: url.search,
      };
    }

    flushSync(() => {
      setActiveModule(targetModule);
    });

    // Use setTimeout to ensure module is set before navigation
    setTimeout(() => {
      navigate(redirectPath, { replace: false });
    }, 0);
  };

  return (
    <CustomButton
      label={`Go To ${intakeData?.label || "Intakes"}`}
      icon="pi pi-external-link"
      iconPos="left"
      onClick={handleNavigation}
      className="p-button-sm primary"
    />
  );
};

export default GoToBtn;
