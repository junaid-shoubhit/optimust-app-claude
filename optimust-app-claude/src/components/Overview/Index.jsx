import { useOverview } from "./useOverview";
import OverviewView from "./OverviewView";

const Overview = ({
  entityId,
  activeMenu,
  tabsApiPath,
  ModalComponent,
  StepOneComponent,
  details,
  partyData,
}) => {
  const overview = useOverview({
    entityId,
    entityCodeId: activeMenu?.entityCodeId,
    tabsApiPath,
  });

  const { tabsQuery } = overview;
  return (
    <OverviewView
      tabs={tabsQuery?.data?.data ?? []}
      isLoading={tabsQuery.isLoading}
      isError={tabsQuery.isError}
      ModalComponent={ModalComponent}
      activeMenu={activeMenu}
      entityId={entityId}
      details={details}
      StepOneComponent={StepOneComponent}
      partyData={partyData}
      {...overview}
    />
  );
};

export default Overview;
