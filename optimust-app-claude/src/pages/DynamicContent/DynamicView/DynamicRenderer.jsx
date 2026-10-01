import { Suspense, useMemo, useEffect, useCallback } from "react";

import TopPanel from "../../../components/Common/TopPanel";
import EntityList from "../../../components/Common/KeyValueList/EntityList";
import StepModal from "../../../components/Modal/StepModal/StepModal";

import PageSkeleton from "./components/PageSkeleton";
import ErrorDisplay from "./components/ErrorDisplay";
import SectionHeader from "./components/SectionHeader";

import { MODULE_ACTION_REGISTRY } from "./config/moduleActionRegistry";
import { ACTION_REGISTRY } from "./config/ACTION_REGISTRY";
import { SECTION_ACTION_REGISTRY } from "./config/SECTION_ACTION_REGISTRY";
import CaseOverViewCard from "../../Cases/PI/CaseOverViewCard";

const DynamicRenderer = ({
  navigate,
  entityId,
  activeMenu,
  visible,
  setVisible,
  apiData,
  mergedData,
  dynamicValues,
  activeSection,
  StepOneComponent,
  onEdit,
  uiState,
  isNotFound,
  formManager,
  invalidateKeys,
  staticQueryKey,
}) => {
  const { status, error } = uiState || {};
  const ActiveComponent = activeSection?.Component;

  /* =====================================================
     PRELOAD ACTIVE COMPONENT
  ===================================================== */

  useEffect(() => {
    ActiveComponent?.preload?.();
  }, [ActiveComponent]);

  /* =====================================================
     CASE DATA
  ===================================================== */

  const getCaseData = useCallback(
    (data) =>
      data
        ?.filter((d) => d.definitionId === 4393)
        .map((d) => ({
          ...d,
          value: entityId,
        })),
    [entityId],
  );

  const getPartyName = useCallback((data) => {
    if (!Array.isArray(data)) {
      return { name: "" };
    }

    const partyFormType = data.find((d) => d.definitionId === 5023);

    const isCompany = partyFormType?.label?.toLowerCase() === "company";

    if (isCompany) {
      const companyName =
        data.find((d) => d.definitionId === 4368)?.value || "";

      return {
        name: companyName.trim(),
      };
    }

    const firstName = data.find((d) => d.definitionId === 4371)?.value || "";

    const lastName = data.find((d) => d.definitionId === 4373)?.value || "";

    return {
      name: `${firstName} ${lastName}`.trim(),
    };
  }, []);

  const sourceData = useMemo(() => {
    // 1. Dynamic values have priority
    if (dynamicValues?.data?.length) {
      return dynamicValues.data;
    }

    // 3. mergedData API response format
    if (mergedData?.data) {
      return mergedData.data;
    }

    return [];
  }, [dynamicValues?.data, mergedData]);

  /* =====================================================
     ACTIVE COMPONENT PROPS
  ===================================================== */
  const activeProps = useMemo(() => {
    const caseData = getCaseData(dynamicValues?.data);

    const hasContactDesign = activeMenu?.designType
      ?.toLowerCase()
      ?.includes("contact");

    const partyData = hasContactDesign ? getPartyName(sourceData) : undefined;
    const props = {
      entityId,
      activeMenu,
      apiData,
      caseData,
      ...(hasContactDesign && {
        partyData,
      }),
    };

    if (formManager === "pdfesign") {
      return activeSection?.getProps?.(props) || props;
    }

    if (!activeSection?.getProps) {
      return props;
    }

    return activeSection.getProps(props);
  }, [
    activeSection,
    entityId,
    activeMenu,
    apiData,
    formManager,
    dynamicValues,
    getCaseData,
    getPartyName,
    sourceData,
  ]);

  /* =====================================================
     MODULE ACTIONS
  ===================================================== */

  const actions = useMemo(() => {
    if (activeSection?.noHeader) return [];
    const moduleKey = activeMenu?.entityCode;
    const sectionKey = activeSection?.key || activeMenu?.formCode;
    const actionKeys = [
      ...new Set([
        ...(SECTION_ACTION_REGISTRY[moduleKey]?.[sectionKey] || []),
        ...(MODULE_ACTION_REGISTRY[moduleKey] || []),
      ]),
    ];

    return actionKeys
      .map((key) => {
        const action = ACTION_REGISTRY[key];
        if (!action) return null;

        /* ================= COMPONENT ================= */

        if (action.type === "component" && action.Component) {
          return {
            type: "component",
            Component: action.Component,
            props: {
              entityId,
              apiData,
              activeMenu,
              onEdit,
              caseData: getCaseData(dynamicValues?.data),
            },
          };
        }

        /* ================= BUTTON ================= */

        return {
          type: "button",
          label: action.label,
          icon: action.icon,
          onClick: () =>
            action.onClick({
              entityId,
              apiData,
              activeMenu,
              onEdit,
            }),
        };
      })
      .filter(Boolean);
  }, [
    activeMenu,
    activeSection,
    entityId,
    apiData,
    onEdit,
    dynamicValues,
    getCaseData,
  ]);

  /* =====================================================
     CASE OVERVIEW
  ===================================================== */

  const isCaseOverview =
    activeMenu?.entityCode === "case" && formManager === "overview";

  /* =====================================================
     QUERY KEYS
  ===================================================== */

  const queryKeys = useMemo(
    () => ({
      pageQueryKey: invalidateKeys,
      editQueryKey: [
        staticQueryKey || "notab-dynamic",
        entityId,
        activeMenu?.entityCodeId,
      ],
      ...(isCaseOverview && {
        caseOverviewQueryKey: ["caseOverviewDetails", entityId],
        progressKey: ["tab-save-progress", entityId],
      }),
    }),
    [
      invalidateKeys,
      activeMenu?.entityCodeId,
      entityId,
      isCaseOverview,
      staticQueryKey,
    ],
  );

  /* =====================================================
     LOADING / ERROR STATES
  ===================================================== */

  if (isNotFound) {
    return <ErrorDisplay message="Page Not Found" />;
  }

  if (!uiState) {
    return <PageSkeleton />;
  }

  if (status === "MENU_LOADING" || status === "DATA_LOADING") {
    return <PageSkeleton />;
  }

  if (status === "ERROR") {
    return <ErrorDisplay message={"Something went wrong"} />;
  }

  if (status !== "READY") {
    return <PageSkeleton />;
  }

  /* =====================================================
     TOP PANEL TOGGLE
  ===================================================== */

  const shouldShowToggle = (mergedData?.fieldDefinitions?.length || 0) > 8;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className={`${activeSection?.heigth || "h-[calc(100vh-54px)]"} flex flex-col gap-2 overflow-hidden`}
    >
      {/* =================================================
          TOP PANEL
      ================================================= */}

      {activeMenu?.designType !== "tabs-dynamic-edit" && (
        <TopPanel
          title={`${activeMenu?.label || ""} Details`}
          isLoading={false}
          shouldShowToggle={shouldShowToggle}
          onEdit={onEdit}
          canEdit={activeMenu?.update}
          className="shrink-0"
        >
          {({ isExpanded }) => (
            <EntityList
              fieldData={mergedData || []}
              configKey={
                activeMenu?.designType === "tabs-hybrid-contacts"
                  ? `${activeMenu.entityCode}`
                  : ""
              }
              dynamicValues={dynamicValues}
              isLoading={false}
              limit={8}
              isExpanded={isExpanded}
              columns={8}
            />
          )}
        </TopPanel>
      )}

      {/* =================================================
          MAIN CONTENT AREA
      ================================================= */}

      <section className="flex flex-col flex-1 min-h-0 min-w-0">
        {/* ===============================================
            SECTION HEADER
        =============================================== */}

        {!activeSection?.noHeader && (
          <div className="shrink-0">
            <SectionHeader
              entityId={entityId}
              entityCodeId={activeMenu?.entityCodeId}
              buttonMenus={activeMenu?.buttonMenu || []}
              fullPath={activeMenu?.fullPath}
              title={activeSection?.title || ""}
              onBack={() => navigate("../")}
              actions={actions}
              isCaseOverview={isCaseOverview}
            />
          </div>
        )}

        {/* ===============================================
            CONTENT
        =============================================== */}

        <div className="flex flex-1 min-h-0 min-w-0 shadow-md">
          <div className="flex-1 min-h-0 min-w-0 w-full overflow-y-auto">
            {/* =========================================
                CASE OVERVIEW CARD
            ========================================= */}

            {isCaseOverview && <CaseOverViewCard entityId={entityId} />}

            {/* =========================================
                ACTIVE COMPONENT
            ========================================= */}

            <Suspense fallback={<PageSkeleton />}>
              {ActiveComponent ? (
                <ActiveComponent
                  {...activeProps}
                  activeMenu={activeSection?.activeSectionMenu || activeMenu}
                />
              ) : (
                <ErrorDisplay message="Component not found" />
              )}
            </Suspense>
          </div>
        </div>
      </section>

      {/* =================================================
          STEP MODAL
      ================================================= */}

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={entityId || 0}
          title={activeMenu?.label}
          entityCode={activeMenu?.entityCode}
          moduleId={activeMenu?.id}
          entityCodeId={activeMenu?.entityCodeId}
          designType={activeMenu?.designType}
          // colSize={1}
          StepOneComponent={StepOneComponent}
          details={apiData}
          queryKeys={queryKeys}
          tabQueryKey={["overview-tabs", activeMenu?.entityCodeId, entityId]}
        />
      )}
    </div>
  );
};

export default DynamicRenderer;
