import { memo, useCallback, useMemo, useRef } from "react";
// import TabRow from "./TabRow";
import { Skeleton } from "primereact/skeleton";
import ContactDirectory from "../../pages/CaseParties/Contacts/Contacts";
import TabRow from "./TabRow/TabRow";
const colors = ["#FAFBFF", "#FFFBFB", "#F7FFFA"];

export const OverviewSkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-3 mx-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 bg-(--foreground) flex flex-col gap-3"
        >
          <div className="flex justify-between">
            <Skeleton width="150px" height="20px" />
            <Skeleton shape="circle" size="24px" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton height="16px" />
            <Skeleton height="16px" />
            <Skeleton height="16px" />
            <Skeleton height="16px" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ANIMATION_DURATION = 500;

const OverviewView = ({
  tabs,
  isLoading,
  isError,
  expandedTab,
  activeMenu,
  toggleTab,
  openModal,
  tabRefs,
  // eslint-disable-next-line no-unused-vars
  ModalComponent,
  StepOneComponent,
  modalState,
  closeModal,
  entityId,
  details,
  partyData,
}) => {
  const tabRefCallbacks = useRef(new Map());
  const getTabRefCallback = useCallback(
    (tabName) => {
      let cb = tabRefCallbacks.current.get(tabName);
      if (!cb) {
        cb = (el) => {
          tabRefs.current[tabName] = el;
        };
        tabRefCallbacks.current.set(tabName, cb);
      }
      return cb;
    },
    [tabRefs],
  );

  const sortedTabs = useMemo(
    () =>
      [...(tabs || [])].sort((a, b) => a.orderExpression - b.orderExpression),
    [tabs],
  );

  if (isLoading) return <OverviewSkeleton />;
  if (isError) return <p className="text-red-500">Failed to load overview</p>;

  return (
    <div className="flex gap-3 mx-3 ">
      {sortedTabs?.length > 0 && (
        <>
          <div className="min-w-0 w-full flex flex-wrap gap-3 items-start content-start relative">
            {sortedTabs.map((tab, index) => (
              <TabRow
                key={tab.tabName}
                tab={tab}
                canEdit={activeMenu?.update}
                isExpanded={expandedTab === tab.tabName}
                toggleTab={toggleTab}
                openModal={openModal}
                bgColor={colors[index % colors.length]}
                tabRef={getTabRefCallback(tab.tabName)}
              />
            ))}
          </div>
        </>
      )}

      {modalState.visible && (
        <ModalComponent
          initialStep={2}
          details={details}
          visible={modalState.visible}
          setVisible={closeModal}
          id={entityId}
          title={`${activeMenu?.label}`}
          selectedTab={modalState.tab}
          tabs={sortedTabs}
          entityCodeId={activeMenu?.entityCodeId}
          entityCode={activeMenu?.entityCode}
          moduleId={activeMenu?.id}
          designType={activeMenu?.designType}
          StepOneComponent={StepOneComponent}
        />
      )}
      {activeMenu?.designType.includes("contacts") && (
        <div
          className={`${sortedTabs?.length > 0 ? "w-230 border-l px-4" : "w-full"}
        h-[calc(100vh-115px)] overflow-auto`}
        >
          {activeMenu?.designType.includes("contacts") && (
            <ContactDirectory
              partyData={partyData}
              entityId={entityId}
              activeMenu={activeMenu}
              isTabs={sortedTabs?.length > 0}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default memo(OverviewView);
