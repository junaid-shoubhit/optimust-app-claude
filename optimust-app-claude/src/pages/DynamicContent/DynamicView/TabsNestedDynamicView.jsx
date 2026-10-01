import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  lazy,
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import { apiRequest } from "../../../services/apiBinding";
import TopPanel from "../../../components/Common/TopPanel.jsx";
import EntityList from "../../../components/Common/KeyValueList/EntityList.jsx";
import { useNoTabFormData } from "../../../components/NoTabsForm/hooks/useNoTabFormData.js";
import AdditionalClient from "../../Intakes/PI/AdditionalClient.jsx";
import StepModal from "../../../components/Modal/StepModal/StepModal.jsx";
import EntityMultiList from "../../../components/Common/KeyValueList/EntityMultiList.jsx";
import GoToBtn from "./components/Buttons/GoToBtn.jsx";
import { OverviewSkeleton } from "../../../components/Overview/OverviewView.jsx";
import AdditionalClientSkeleton from "../../Intakes/PI/AdditionalClientSkeleton.jsx";
import MailBtn from "./components/Buttons/MailBtn.jsx";
import { formatFieldValue } from "../../../utils/constant.js";
import ProgressStatus from "./components/ProgressStatus.jsx";

const ChatsBtn = lazy(() => import("./components/Buttons/ChatBtn/ChatBtn.jsx"));
const ConvertToCase = lazy(
  () => import("./components/Buttons/ConvertToCase/ConvertToCase.jsx"),
);

/* ===================== LAZY ===================== */

const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

// OverviewView
const Overview = lazyWithPreload(
  () => import("../../../components/Overview/Index.jsx"),
);

const Documents = lazyWithPreload(
  () => import("../../DocumentManager/Documents/Document"),
);

/* ===================== CONFIG ===================== */

const ACTION_REGISTRY = {
  DOWNLOAD: { label: "DOWNLOAD", icon: "pi pi-download" },
  CONVERTCASE: {
    type: "component",
    Component: ConvertToCase,
    label: "CONVERT TO CASE",
    icon: "pi pi-ticket",
  },

  GOTO: {
    type: "component",
    Component: GoToBtn,
    label: "GO TO INTAKES",
    icon: "pi pi-external-link",
  },
  CHATS: {
    type: "component",
    Component: ChatsBtn,
    label: "SMS",
    icon: "pi pi-comments",
  },
  MAIL: {
    type: "component",
    Component: MailBtn,
    label: "SMS",
    icon: "pi pi-comments",
  },
};

const SECTION_ACTION_MAP = {
  overview: ["GOTO", "CONVERTCASE", "CHATS", "MAIL"],
  calllogs: [],
  auditlogs: [],
  chats: [],
};

const FORM_MANAGER_CONFIG = {
  overview: {
    title: "Overview",
    Component: Overview,
    getProps: ({ entityId, clientEnitityId, update, id }) => ({
      entityId,
      activeMenu: {
        ...clientEnitityId,
        id,
        label: "Intake Client",
        update,
      },
      entityCode: "intake-client",
      tabsApiPath: (id) =>
        `FieldDefinition/tabs/${clientEnitityId?.entityCodeId}/${id}/true/false`,
      extraFieldsApiPath: ({ tabName, tabTypeId, entityId }) =>
        `Case/CaseOverviewGetTabDetails?tabName=${tabName}&TabTypeId=${tabTypeId}&entityId=${entityId}&entityCodeId=${clientEnitityId?.entityCodeId}&includeIsImportant=false
        &isParent=${true}
      `,
      ModalComponent: StepModal,
    }),
  },
  documents: {
    Component: Documents,
    noHeader: true,
    getProps: ({ entityId, SearchParm, isConverted }) => ({
      caseId: entityId,
      SearchParm,
      isConverted,
    }),
  },
};

/* ===================== COMPONENT ===================== */

const TabsNestedDynamicView = ({
  activeMenu,
  isMenuLoading,
  invalidateKeys,
}) => {
  const navigate = useNavigate();
  const { formManager = "overview" } = useParams();
  const { search } = useLocation();
  const intakeId = Number(new URLSearchParams(search).get("id")) || null;
  /* ===================== STATE ===================== */

  const [visible, setVisible] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  /* ===================== INTAKE DATA ===================== */

  const { fieldData, dynamicValues, isLoading, isError, error } =
    useNoTabFormData({
      entityId: intakeId,
      entityCode: activeMenu?.entityCode,
      entityCodeId: activeMenu?.entityCodeId,
      moduleId: activeMenu?.id,
      tabName: "No Tab",
    });

  /* ===================== CLIENT ENTITY ===================== */

  const { data: clientEnitityId, isLoading: isClientIdLoading } = useQuery({
    queryKey: ["tabs-nested-dynamic-id", intakeId],
    queryFn: () =>
      apiRequest({
        apiPath: `/Intakes/GetClientChieldEntity/${activeMenu?.entityCodeId}/${intakeId}`,
        method: "get",
      }),
    enabled: !!activeMenu?.entityCodeId && !!intakeId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
  const entityId = intakeId;
  const entityCodeId = clientEnitityId?.entityCodeId;

  /* ===================== CLIENT DATA ===================== */

  const {
    fieldData: clientField,
    dynamicValues: clientDynamic,
    isLoading: isClientLoading,
    isError: isClientError,
    error: clientError,
  } = useNoTabFormData(
    {
      entityId,
      entityCode: "intake-client",
      entityCodeId,
      moduleId: activeMenu?.id,
      isParent: true,
      tabName: "No Tab",
    },
    { enabled: !!clientEnitityId },
    clientEnitityId?.designType,
  );
  const clientFieldData = clientField?.fieldDefinitions;
  const clientDynamicValues = clientDynamic?.data;

  /* ===================== CLIENTS ===================== */

  const clients = useMemo(() => {
    if (!clientFieldData?.length || !clientDynamicValues?.length) {
      return [];
    }

    const keyMap = {
      title: "clientTitle",
      firstname: "clientFirstName",
      middlename: "clientMiddleName",
      lastname: "clientLastName",
      gender: "gender",
      dateofbirth: "dateOfBirth",
      ssn: "ssn",
      partytype: "partyType",
    };

    const fieldMap = new Map(
      clientFieldData.map((field) => [Number(field.id), field]),
    );

    const grouped = new Map();

    clientDynamicValues.forEach((item) => {
      const entityId = item.entityId;
      const rowIndex = item.rowIndex ?? 0;

      // entityId + rowIndex = unique client row
      const groupKey = `${entityId}_${rowIndex}`;

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          entityId,
          rowIndex,
          values: [],
        });
      }

      grouped.get(groupKey).values.push(item);
    });

    return Array.from(grouped.values()).map(
      ({ entityId, rowIndex, values }) => {
        const client = {
          rowIndex: Number(rowIndex),
          entityId,
        };

        values.forEach((val) => {
          const field = fieldMap.get(Number(val.definitionId));

          if (!field) return;

          const rawKey = (val.definitionName || field.name || "")
            .toLowerCase()
            .replace(/\s+/g, "");

          const key = keyMap[rawKey] || rawKey;

          let displayValue = field.isDropdown ? val.label : val.value;

          if (!field.isDropdown && field.formatterId) {
            displayValue = formatFieldValue({
              value: displayValue,
              formatterId: field.formatterId,
            });
          }

          client[key] = displayValue;

          // Preserve actual dropdown ID
          if (rawKey === "partytype") {
            client.partyTypeId = val.value;
          }
        });

        return client;
      },
    );
  }, [clientFieldData, clientDynamicValues]);

  const isConverted = clientEnitityId?.convertCaseFlag ?? false;

  /* ===================== CLIENT IDS ===================== */

  const entityIds = useMemo(
    () => clients.map((item) => item.entityId).join(","),
    [clients],
  );

  /* ===================== LOADING ===================== */

  const combinedLoading = isLoading || isClientLoading || isMenuLoading;
  /* ===================== ACTIVE SECTION ===================== */

  const activeSection =
    FORM_MANAGER_CONFIG[formManager] || FORM_MANAGER_CONFIG.overview;

  const ActiveComponent = activeSection.Component;

  /* ===================== HANDLERS ===================== */

  const handleEdit = useCallback(() => setVisible(true), []);

  /* ===================== PRELOAD ===================== */

  useEffect(() => {
    ActiveComponent?.preload?.();
  }, [ActiveComponent]);

  /* ===================== ACTIVE PROPS ===================== */

  const activeProps = useMemo(() => {
    if (formManager === "documents") {
      return {
        entityId: intakeId,
        SearchParm: !entityIds
          ? `cc.id=${intakeId}`
          : `cc.id=${intakeId}  OR (dd.entity_code_id=${clientEnitityId?.entityCodeId} AND dd.case_id in(${entityIds}))`,
        entityCodeId: activeMenu?.entityCodeId,
        setSelectedDetails,
        uploadedFiles,
        setUploadedFiles,
        isConverted,
      };
    }

    return activeSection.getProps
      ? activeSection.getProps({
          entityId: selectedClient?.entityId,
          clientEnitityId,
          update: activeMenu?.update && !isConverted,
          id: activeMenu?.id,
        })
      : { intakeId };
  }, [
    activeMenu?.entityCodeId,
    activeMenu?.update,
    activeMenu?.id,
    activeSection,
    selectedClient?.entityId,
    clientEnitityId,
    intakeId,
    entityIds,
    formManager,
    uploadedFiles,
    isConverted,
  ]);

  /* ===================== ACTIONS ===================== */
  const visibleActions = useMemo(() => {
    const actionKeys = SECTION_ACTION_MAP[formManager] || [];

    return actionKeys.map((key) => ({
      ...ACTION_REGISTRY[key],
      isConverted: key === "CONVERTCASE" && isConverted,
    }));
  }, [formManager, isConverted]);

  /* ===================== TOP PANEL ===================== */

  const shouldShowToggle = fieldData && Object.keys(fieldData).length > 8;

  /* ===================== QUERY KEYS ===================== */

  const queryKeys = useMemo(
    () => ({
      pageQueryKey: invalidateKeys,
      editQueryKey: ["notab-dynamic", entityId, activeMenu?.entityCodeId],
    }),
    [invalidateKeys, activeMenu?.entityCodeId, entityId],
  );

  const clientQueryKeys = useMemo(
    () => ({
      clientQueryKey: ["notab-dynamic", entityId, entityCodeId, "No Tab"],
      editClientQueryKey: [
        "notab-dynamic",
        selectedClient?.entityId,
        clientEnitityId?.entityCodeId,
      ],
    }),
    [
      entityCodeId,
      entityId,
      selectedClient?.entityId,
      clientEnitityId?.entityCodeId,
    ],
  );

  /* ===================== MODAL ===================== */

  const Modal = useMemo(() => {
    if (!visible) return null;

    return (
      <StepModal
        visible={visible}
        setVisible={setVisible}
        id={intakeId || 0}
        title={activeMenu?.label}
        moduleId={activeMenu?.id}
        entityCode={activeMenu?.entityCode}
        entityCodeId={activeMenu?.entityCodeId}
        designType={activeMenu?.designType}
        // colSize={1}
        queryKeys={queryKeys}
        tabQueryKey={["overview-tabs", clientEnitityId?.entityCodeId]}
      />
    );
  }, [visible, intakeId, activeMenu, queryKeys, clientEnitityId?.entityCodeId]);
  /* ===================== RENDER ===================== */

  return (
    <div
      className={`${activeSection?.noHeader ? "h-[calc(100vh-47.2px)]" : "h-[calc(100vh-54px)]"} flex flex-col gap-2 overflow-hidden`}
    >
      {/* =========================================================
          TOP PANEL
      ========================================================= */}

      <TopPanel
        title={`${activeMenu?.label} Details`}
        onEdit={handleEdit}
        canEdit={activeMenu?.update && !isConverted}
        isLoading={combinedLoading}
        shouldShowToggle={shouldShowToggle}
        renderModal={() => Modal}
        className="shrink-0"
      >
        {({ isExpanded }) => (
          <>
            <EntityList
              fieldData={fieldData}
              dynamicValues={dynamicValues}
              isLoading={combinedLoading}
              isError={isError}
              errorMessage={error?.message}
              limit={8}
              isExpanded={isExpanded}
              columns={8}
            />
            {isExpanded && (
              <EntityMultiList
                fieldData={fieldData?.multipleFieldDefinitions}
                dynamicValues={dynamicValues?.multiFields}
                isExpanded={isExpanded}
                columns={8}
              />
            )}
          </>
        )}
      </TopPanel>

      {/* =========================================================
    MAIN CONTENT
========================================================= */}

      <div className="flex flex-1 min-h-0 flex-col gap-2 px-2">
        {/* ================= HEADER ================= */}

        {!activeSection.noHeader && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 shrink-0">
            {/* LEFT — TITLE */}
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <div className="flex items-center gap-1 shrink-0">
                <CustomButton
                  text
                  icon="text-sm! text-(--background-secondary)! pi pi-arrow-left"
                  className="p-0! w-fit!"
                  onClick={() => navigate("../")}
                />

                {/* <p className="text-[15px] font-semibold uppercase text-(--color-fontFour) whitespace-nowrap">
                  {activeSection.title}
                </p> */}
              </div>

              {selectedClient && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1 h-1 rounded-full bg-(--background-secondary) shrink-0" />

                  <i className="pi pi-user text-[11px] text-(--background-secondary) shrink-0" />

                  <span className="text-[15px] font-semibold text-(--text-secondary) truncate max-w-[220px]">
                    {selectedClient.clientTitle}{" "}
                    {selectedClient.clientFirstName}{" "}
                    {selectedClient.clientLastName}
                  </span>
                </div>
              )}
            </div>

            {/* CENTER — PROGRESS */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <ProgressStatus
                payload={{
                  entityId: selectedClient?.entityId,
                  entityCodeId: clientEnitityId?.entityCodeId,
                }}
              />
            </div>

            {/* RIGHT — ACTIONS */}
            {visibleActions.length > 0 && !isClientIdLoading && (
              <div className="flex items-center gap-3 shrink-0 ml-auto">
                {visibleActions.map(
                  // eslint-disable-next-line no-unused-vars
                  ({ label, icon, type, Component, isConverted }) => {
                    if (type === "component") {
                      return (
                        <Component
                          key={label}
                          label={label}
                          icon={icon}
                          entityId={intakeId}
                          activeMenu={activeMenu}
                          isConverted={isConverted}
                          isLoading={isClientIdLoading}
                        />
                      );
                    }

                    return (
                      <CustomButton
                        key={label}
                        label={label}
                        icon={icon}
                        className="primary"
                      />
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
      ACTIVE SECTION + ADDITIONAL CLIENTS
  ========================================================= */}

        <div className="flex flex-1 min-h-0 gap-3">
          {/* =====================================================
        LEFT / MAIN SECTION
    ===================================================== */}

          <section className="flex flex-col flex-1 min-w-0 min-h-0 rounded-t-3xl">
            {/* YOUR EXISTING CONTENT — NO CHANGE */}

            <div className="flex-1 min-h-0 overflow-y-auto py-1">
              {isClientLoading || isClientIdLoading ? (
                <OverviewSkeleton />
              ) : formManager !== "overview" || selectedClient ? (
                <Suspense
                  fallback={
                    <div className="flex justify-center items-center h-full">
                      <p className="animate-pulse text-sm">
                        Loading {activeSection.title}...
                      </p>
                    </div>
                  }
                >
                  <ActiveComponent {...activeProps} />
                </Suspense>
              ) : (
                /* YOUR EXISTING EMPTY STATE */
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-pulse"
                    style={{ backgroundColor: "var(--color-bgThree)" }}
                  >
                    <i className="pi pi-users text-3xl!" />

                    <div
                      onClick={() => {
                        setIsAddMode(true);
                        setClientModalVisible(true);
                      }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-bgSeven)" }}
                    >
                      <i className="pi pi-plus text-xs text-white" />
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold">No Client Selected</h2>

                  <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    Add or select a client to view intake details.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =====================================================
        RIGHT / CLIENT LIST
    ===================================================== */}

          <section className="w-72.5 shrink-0 min-h-0 overflow-y-auto flex flex-col rounded-t-3xl">
            {/* YOUR EXISTING ADDITIONAL CLIENT CODE — NO CHANGE */}

            {isClientLoading ? (
              <AdditionalClientSkeleton />
            ) : (
              <AdditionalClient
                activeMenu={activeMenu}
                isConverted={isConverted}
                entityParentId={intakeId}
                clientEnitityId={clientEnitityId}
                clients={clients}
                clientError={clientError}
                isClientError={isClientError}
                intakeId={intakeId}
                setSelectedClient={setSelectedClient}
                isSelectable={formManager !== "documents"}
                selectedClient={selectedClient}
                setVisible={setClientModalVisible}
                visible={clientModalVisible}
                selectedDetails={selectedDetails}
                queryKeys={clientQueryKeys}
                setUploadedFiles={setUploadedFiles}
                isAddMode={isAddMode}
                setIsAddMode={setIsAddMode}
                tabQueryKey={["overview-tabs", clientEnitityId?.entityCodeId]}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TabsNestedDynamicView;
