import {
  Suspense,
  useState,
  useMemo,
  useCallback,
  memo,
  useEffect,
  useRef,
} from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import classNames from "classnames";
import Table from "../../../components/Table/Table";
import CardList from "../../../components/CardList/CardList";
import StepModal from "../../../components/Modal/StepModal/StepModal";
import { COMPONENT_REGISTRY } from "../componentRegistry";
import { useDynamicPageStrategy } from "./useDynamicPageStrategy";
import { STATIC_PAGE_CONFIG } from "../dynamicPage.config.jsx";

import {
  useDynamicPageQuery,
  useTableFiltersQuery,
  defaultFilters,
} from "./useDynamicPageQuery";
import { useResizablePanel } from "./useResizablePanel";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext.jsx";
import { capitalize } from "../../../utils/constant.js";

/* ================= MEMOIZED RENDERERS ================= */

const MemoTable = memo(Table);

const MemoCardList = memo(CardList);

/* =========================================================
   FILTER / FIELD CONFIG HELPERS
========================================================= */

const mergeFieldsWithFilters = (columns = [], filters = []) => {
  console.log("columns234", columns);
  console.log("filters", filters);
  const filterMap = new Map(
    filters.map((filter) => [
      String(filter?.parameterName || "").toLowerCase(),
      filter,
    ]),
  );

  return columns.map((column) => {
    const parameterName = String(column?.parameterName || "").toLowerCase();

    const matchedFilter = filterMap.get(parameterName);

    if (!matchedFilter) {
      return {
        ...column,
        isFilter: false,
      };
    }

    return {
      ...column,
      ...matchedFilter,
      isFilter: true,
    };
  });
};

/* ================= PERMISSION ENGINE ================= */

const resolvePermissions = ({ activeMenu, config }) => {
  if (!activeMenu) return {};

  const isNoTabs =
    activeMenu.designType === "no-tabs" ||
    activeMenu.designType === "no-tabs-static" ||
    activeMenu.designType === "no-tabs-card" ||
    activeMenu.designType === "tabs-dynamic-edit";
  let permissions = {
    canView: isNoTabs ? false : !!activeMenu.read,

    canEdit: isNoTabs ? !!activeMenu.update : false,

    canDelete: !!activeMenu.delete,
  };

  const configActions =
    typeof config?.actions === "function"
      ? config.actions()
      : config?.actions || {};

  if (configActions.canDelete !== undefined) {
    permissions.canDelete = configActions.canDelete;
  }

  if (configActions.canEdit !== undefined) {
    permissions.canEdit = configActions.canEdit;
  }

  if (configActions.canView !== undefined) {
    permissions.canView = configActions.canView;
  }

  return permissions;
};

/* =========================================================
   DYNAMIC CONFIG
========================================================= */

const buildDynamicConfig = (activeMenu, filtersData) => {
  const baseColumns = filtersData?.data || [];

  return {
    headerName: activeMenu?.label,

    apiPath: "/Utility/GetDynamicPage",

    deleteApiPath: `/Utility/DynamicPageDelete?Id=:id&ModuleId=${activeMenu?.id}&EntityCodeId=${activeMenu?.entityCodeId}`,

    queryKey: `dynamic-${activeMenu?.id}`,

    fieldsConfig: baseColumns,

    transformResponse: (res) => res?.data || [],

    stepModal: {
      componentKey: "dynamicForm",
    },
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const DynamicPageContent = ({
  activeMenu,
  isMenuLoading,
  isFormOpen,
  filterPayload,
  caseData,
  nestedPage,
  entityId,
}) => {
  const navigate = useNavigate();

  const designType = activeMenu?.designType;

  /* =======================================================
     RESIZABLE PANEL
  ======================================================= */

  const {
    width: tableWidth,
    collapsed: tableCollapsed,
    toggleCollapse: toggleTableCollapse,
    startDragging,
    isDragging,
  } = useResizablePanel({
    pageId: activeMenu?.id,
    isEnabled: isFormOpen,
    designType: activeMenu?.designType,
  });

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const isMasterDataModule = activeMenu?.id === 5268;

  /* =======================================================
     INITIAL FILTERS
  ======================================================= */

  const initialFilters = useMemo(
    () => ({
      ...defaultFilters,

      filters: [filterPayload].filter(Boolean),

      ...(isMasterDataModule && {
        tableName: undefined,
      }),

      sortCriteria: [],
    }),
    [filterPayload, isMasterDataModule],
  );

  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  /* =======================================================
     MENU CHANGE
  ======================================================= */

  const prevMenuIdRef = useRef(activeMenu?.id);

  useEffect(() => {
    if (prevMenuIdRef.current !== activeMenu?.id) {
      prevMenuIdRef.current = activeMenu?.id;

      setAppliedFilters(initialFilters);
      setSelectedRows([]);
      setDetails(null);
      setVisible(false);
    }
  }, [activeMenu?.id, initialFilters]);

  /* =======================================================
     PAGE STRATEGY
  ======================================================= */

  const {
    isStatic,
    showTable,
    showOutlet,
    isFullScreenOutlet,
    isQueryEnabled,
    isEditScreen,
    handleRowAction,
  } = useDynamicPageStrategy({
    designType,
    isFormOpen,
    navigate,
    setVisible,
    setDetails,
  });

  /* =======================================================
     STATIC CONFIG
  ======================================================= */

  const staticConfig = useMemo(() => {
    if (!activeMenu?.path || !activeMenu?.id) {
      return null;
    }

    const pageConfig = STATIC_PAGE_CONFIG[activeMenu.path];

    if (!pageConfig) {
      return null;
    }

    return {
      ...pageConfig,

      deleteApiPath: `/Utility/DynamicPageDelete?Id=:id&ModuleId=${activeMenu?.id}&EntityCodeId=${activeMenu?.entityCodeId}`,
    };
  }, [activeMenu?.path, activeMenu?.id, activeMenu?.entityCodeId]);

  /* =======================================================
     TABLE NAME
  ======================================================= */

  const tableName = isMasterDataModule ? appliedFilters?.tableName : undefined;

  /* =======================================================
     SHOULD FETCH
  ======================================================= */

  const shouldFetch = !activeMenu?.id
    ? false
    : (!isFormOpen || isEditScreen) && (!isMasterDataModule || !!tableName);

  /* =======================================================
     FILTER CONFIGURATION
  ======================================================= */

  const { data: filtersData, isLoading: isFiltersLoading } =
    useTableFiltersQuery({
      activeMenu,
      filterPayload,
      tableName,
      enabled: shouldFetch,
    });

  /* =======================================================
     DYNAMIC CONFIG
  ======================================================= */

  const dynamicConfig = useMemo(() => {
    if (isStatic || !activeMenu) {
      return null;
    }

    return buildDynamicConfig(activeMenu, filtersData);
  }, [isStatic, activeMenu, filtersData]);

  /* =======================================================
     BASE CONFIG
  ======================================================= */

  const baseConfig = isStatic ? staticConfig : dynamicConfig;

  /* =======================================================
     FIELDS CONFIG
  ======================================================= */

  /**
   * For static pages:
   *
   * STATIC_PAGE_CONFIG provides the base columns.
   *
   * useTableFiltersQuery provides dynamic filter metadata.
   *
   * We merge both so the Table receives:
   *
   * {
   *   parameterName,
   *   columnName,
   *   width,
   *   type,
   *   isFilter,
   *   filter,
   *   dataTable,
   *   dataField,
   *   ...
   * }
   *
   * For dynamic pages, the API already provides the complete
   * fieldsConfig, so we use it directly.
   */

  const fieldsConfig = useMemo(() => {
    if (!baseConfig) {
      return [];
    }

    if (!isStatic) {
      return baseConfig?.fieldsConfig || [];
    }

    const staticColumns = baseConfig?.fieldsConfig || [];

    const apiFilters = filtersData?.data || [];

    return mergeFieldsWithFilters(staticColumns, apiFilters);
  }, [baseConfig, isStatic, filtersData?.data]);

  /* =======================================================
     FINAL CONFIG
  ======================================================= */

  const config = useMemo(() => {
    if (!baseConfig) {
      return null;
    }

    return {
      ...baseConfig,
      fieldsConfig,
    };
  }, [baseConfig, fieldsConfig]);

  /* =======================================================
     MAIN QUERY
  ======================================================= */

  const queryEnabled =
    !!config?.apiPath && !!activeMenu?.id && isQueryEnabled && shouldFetch;

  const { data, isLoading, isError, error } = useDynamicPageQuery({
    config,
    activeMenu,
    appliedFilters,
    enabled: queryEnabled,
  });
  /* =======================================================
     TABLE DATA
  ======================================================= */

  const tableData = useMemo(() => {
    if (!data) {
      return [];
    }

    return config?.transformResponse
      ? config.transformResponse(data)
      : data?.data || [];
  }, [data, config]);

  const totalCount = data?.dataSize ?? 0;

  /* =======================================================
     STEP MODAL
  ======================================================= */

  const StepOneComponent = COMPONENT_REGISTRY[config?.stepModal?.componentKey];

  /* =======================================================
     QUERY KEYS
  ======================================================= */

  const invalidateKeys = useMemo(
    () => [config?.queryKey || "dynamicPage", activeMenu?.id, appliedFilters],
    [activeMenu?.id, config?.queryKey, appliedFilters],
  );

  const queryKeys = useMemo(
    () => ({
      pageQueryKey: invalidateKeys,

      ...(["no-tabs", "no-tabs-card"].includes(activeMenu?.designType) && {
        editQueryKey: [
          isStatic ? config?.queryKey || "notab-dynamic" : "notab-dynamic",

          details?.id,

          activeMenu?.entityCodeId,
        ],
      }),

      ...(activeMenu?.id === 5293 && {
        notesPageQueryKey: ["notes", entityId],
      }),
    }),
    [
      invalidateKeys,
      activeMenu?.designType,
      activeMenu?.entityCodeId,
      details?.id,
      config?.queryKey,
      isStatic,
      activeMenu?.id,
      entityId,
    ],
  );

  /* =======================================================
     ACTIONS
  ======================================================= */

  const actions = useMemo(() => {
    const permissions = resolvePermissions({
      activeMenu,
      config,
    });

    return {
      ...permissions,

      ...(permissions.canEdit && {
        onEdit: handleRowAction,
      }),

      deleteApiPath: config?.deleteApiPath,

      invalidateKeys: [invalidateKeys],
    };
  }, [activeMenu, config, handleRowAction, invalidateKeys]);

  /* =======================================================
     ADD DATA
  ======================================================= */

  const addData = useCallback(() => {
    /**
     * Master Data / tabs dynamic edit
     */
    if (activeMenu?.designType === "tabs-dynamic-edit") {
      navigate("manage");
      return;
    }

    /**
     * Clear single selection
     */
    if (selectedRows?.length === 1) {
      setSelectedRows([]);
    }

    /**
     * Mass update / selected row
     */
    if (selectedRows?.length > 1) {
      setDetails(selectedRows[0]);
    } else {
      setDetails(null);
    }

    setVisible(true);
  }, [activeMenu?.designType, navigate, selectedRows]);

  /* =======================================================
     HEADER PROPS
  ======================================================= */

  const headerProps = useMemo(
    () => ({
      addData,

      activeMenuId: activeMenu?.id,

      headerName: config?.headerName || activeMenu?.label || "No Table Found",

      designType: activeMenu?.designType,

      setFilters: setAppliedFilters,

      defaultFilters: initialFilters,

      filtersData: filtersData?.data || [],

      actionsConfig: {
        add: activeMenu?.create,

        filter: true,

        export: true,

        back: isFormOpen,

        massUpdate: activeMenu?.massUpdate && selectedRows?.length > 1,
      },

      exportConfig: {
        apiPath: config?.apiPath,

        activeMenu,

        appliedFilters,

        config,
      },
    }),
    [
      addData,
      config,
      activeMenu,
      appliedFilters,
      filtersData,
      isFormOpen,
      initialFilters,
      selectedRows,
    ],
  );

  /* =======================================================
     MASTER ENTITY
  ======================================================= */

  const masterEntity = useMemo(() => {
    if (!isMasterDataModule) {
      return undefined;
    }

    return appliedFilters?.filters?.find(
      (filter) => filter?.parameterName === "4985",
    );
  }, [isMasterDataModule, appliedFilters?.filters]);

  /* =======================================================
     MODAL DETAILS
  ======================================================= */

  const modalDetails = useMemo(
    () => ({
      ...(details || {}),

      defaultValues: {
        ...(masterEntity && {
          Master_Entity: masterEntity,
        }),
      },

      ...(caseData && {
        prefillValues: {
          5072: caseData,
        },
      }),
    }),
    [details, caseData, masterEntity],
  );

  /* =======================================================
     MASS UPDATE
  ======================================================= */

  const massUpdateConfig = useMemo(() => {
    const isMassUpdate = selectedRows.length > 1;

    return {
      selectedMassIds: isMassUpdate ? selectedRows.map((row) => row.id) : [],

      isMassUpdate,

      initialStep: isMassUpdate ? 2 : 1,
    };
  }, [selectedRows]);

  /* =======================================================
     DATA RENDERER
  ======================================================= */

  const DataRenderer =
    activeMenu?.designType === "no-tabs-card" ? MemoCardList : MemoTable;

  const finalLoading = isLoading || isMenuLoading;

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  useEffect(() => {
    if (!activeMenu?.label) {
      return;
    }

    document.title = `${capitalize(activeMenu.label || "")} | Optimust Law`;
  }, [activeMenu?.label]);

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <p className="text-red-500">{error?.message || "Something went wrong"}</p>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className={classNames(
        isFullScreenOutlet ? "block" : "flex",

        "flex-1 overflow-hidden relative h-full",
      )}
    >
      {/* ===================================================
          FLOATING TABLE TOGGLE
      =================================================== */}

      {showTable && isFormOpen && (
        <button
          onClick={toggleTableCollapse}
          style={{
            left: tableCollapsed ? 0 : tableWidth - 10,
          }}
          className={classNames(
            "absolute top-1 z-100",
            "h-7 rounded-full",
            "flex items-center justify-center",
            "transition-all duration-200",
            "hover:scale-105",
          )}
        >
          <i
            className={classNames(
              "pi text-sm transition-all duration-200",

              tableCollapsed
                ? "pi-angle-double-right text-blue-500"
                : "pi-angle-double-left text-slate-500",
            )}
          />
        </button>
      )}

      {/* ===================================================
          TABLE SECTION
      =================================================== */}

      {showTable && (
        <div
          className={classNames(
            "relative shrink-0 overflow-hidden",
            "transition-[width] duration-200 ease-out",
          )}
          style={{
            width: isFormOpen ? (tableCollapsed ? 0 : tableWidth) : "100%",
          }}
        >
          <div
            className={classNames(
              "h-full shadow overflow-hidden",
              "transition-all duration-300",

              tableCollapsed
                ? "opacity-0 -translate-x-full"
                : "opacity-100 translate-x-0",

              tableCollapsed && "pointer-events-none",

              DataRenderer === MemoCardList && "flex flex-col",
            )}
          >
            <DataRenderer
              data={tableData}
              totalRecords={totalCount}
              fieldsConfig={fieldsConfig}
              loading={finalLoading}
              isFiltersLoading={isFiltersLoading}
              filters={appliedFilters}
              scrollHeight={nestedPage ? "calc(100vh - 10rem)" : undefined}
              actions={actions}
              headerProps={headerProps}
              pageLinkSize={isFormOpen ? 3 : 5}
              isOpen={isFormOpen}
              isSelectionMode={activeMenu?.entityCode !== "Report" || false}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              {...(DataRenderer === MemoCardList && {
                cardType: activeMenu?.path,

                entityCodeId: activeMenu?.entityCodeId,

                entityCode: activeMenu?.entityCode,
              })}
            />
          </div>
        </div>
      )}

      {/* ===================================================
          DRAG HANDLE
      =================================================== */}

      {showTable && showOutlet && isFormOpen && !tableCollapsed && (
        <div
          onMouseDown={startDragging}
          className={classNames(
            "relative w-3 shrink-0 cursor-col-resize group",
            "flex items-center justify-center",
            "transition-all duration-150",
            "hover:bg-blue-50",
          )}
        >
          <div
            className={classNames(
              "absolute h-full w-0.5",
              "bg-transparent",
              "group-hover:bg-blue-400",

              isDragging && "bg-blue-500",
            )}
          />
        </div>
      )}

      {/* ===================================================
          OUTLET
      =================================================== */}

      {showOutlet && (
        <Suspense fallback={<div>Loading...</div>}>
          <div
            className={classNames(
              "min-w-0 flex-1 overflow-hidden",
              "transition-all duration-300",

              isFullScreenOutlet && "w-full",
            )}
          >
            <Outlet
              context={{
                invalidateKeys,
              }}
            />
          </div>
        </Suspense>
      )}

      {/* ===================================================
          STEP MODAL
      =================================================== */}

      {!isEditScreen && visible && activeMenu?.create && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={details?.id || 0}
          title={config?.headerName || activeMenu?.label}
          widthConfig={config?.stepModal?.widthConfig}
          entityCode={activeMenu?.entityCode}
          entityCodeId={activeMenu?.entityCodeId}
          moduleId={activeMenu?.id}
          designType={activeMenu?.designType}
          colSize={config?.stepModal?.colSize || ""}
          StepOneComponent={StepOneComponent}
          details={modalDetails}
          selectedMassIds={massUpdateConfig.selectedMassIds}
          isMassUpdate={massUpdateConfig.isMassUpdate}
          initialStep={massUpdateConfig.initialStep}
          queryKeys={queryKeys}
        />
      )}
    </div>
  );
};

/* =========================================================
   NAVIGATION VERSION
========================================================= */

const DynamicPageWithNavigation = () => {
  const { formManager } = useParams();

  const isFormOpen = !!formManager;

  const { activeMenu, isLoading: isMenuLoading } = useCustomNavigation();

  return (
    <DynamicPageContent
      activeMenu={activeMenu}
      isFormOpen={isFormOpen}
      isMenuLoading={isMenuLoading}
    />
  );
};

/* =========================================================
   WRAPPER COMPONENT
========================================================= */

const DynamicPage = ({ entityId, activeMenu: propActiveMenu, caseData }) => {
  const filterPayload = useMemo(() => {
    const parameterName = {
      "/workflows": "5072",

      "/event-211": "4387",
    }[propActiveMenu?.path];

    return parameterName
      ? {
          parameterName,
          value: entityId,
          label: "Case",
        }
      : null;
  }, [propActiveMenu?.path, entityId]);

  if (propActiveMenu) {
    return (
      <DynamicPageContent
        activeMenu={propActiveMenu}
        isMenuLoading={false}
        nestedPage={true}
        filterPayload={filterPayload}
        caseData={caseData}
        entityId={entityId}
      />
    );
  }

  return <DynamicPageWithNavigation />;
};

export default DynamicPage;
