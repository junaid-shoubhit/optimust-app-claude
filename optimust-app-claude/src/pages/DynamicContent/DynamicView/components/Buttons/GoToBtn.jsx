// GoToBtn.js - Updated
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import { apiRequest } from "../../../../../services/apiBinding";

const GoToBtn = ({ entityId, activeMenu }) => {
  const navigate = useNavigate();

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

    let redirectPath = `/intakes/tabs-nested-dynamic/pi/overview?id=${intakeData.entityId}`;

    switch (label) {
      case "case":
      case "cases":
        redirectPath = `/cases/tabs-dynamic/pi/overview?id=${intakeData.entityId}`;
        break;
      default:
        break;
    }

    // The active module follows the URL, so navigating is all it takes.
    navigate(redirectPath);
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
