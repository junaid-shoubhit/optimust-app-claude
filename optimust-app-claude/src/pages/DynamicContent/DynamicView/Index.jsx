import TabsNestedDynamicView from "./TabsNestedDynamicView";
import DynamicContainer from "./DynamicContainer";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext";
import { useOutletContext, useParams } from "react-router-dom";

const DynamicView = () => {
  const { activeMenu, isLoading } = useCustomNavigation();
  const { invalidateKeys } = useOutletContext();
  const { formManager } = useParams();
  if (activeMenu?.designType === "tabs-nested-dynamic") {
    return (
      <TabsNestedDynamicView
        activeMenu={activeMenu}
        isMenuLoading={isLoading}
        invalidateKeys={invalidateKeys}
        formManager={formManager}
      />
    );
  }

  return (
    <DynamicContainer
      activeMenu={activeMenu}
      isMenuLoading={isLoading}
      invalidateKeys={invalidateKeys}
      formManager={formManager}
    />
  );
};

export default DynamicView;
