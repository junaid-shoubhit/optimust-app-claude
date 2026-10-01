import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import classNames from "classnames";

import Table from "../../../components/Table/Table";
import {
  useDynamicPageQuery,
  useTableFiltersQuery,
} from "../../DynamicContent/DynamicPage/useDynamicPageQuery";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext";

import { DEFAULT_FILTERS } from "./wfConstants";
import { getWFTasksFields } from "./wfFields";
import TaskDetailsPanel from "./WFTasksView/TaskDetailsPanel";

const TASK_PARAM = "taskdetails";
const TASK_STORAGE_KEY = "wf-selected-task";

/* ============================================================
   HELPERS
============================================================ */

const getStoredTask = () => {
  try {
    const storedTask = sessionStorage.getItem(TASK_STORAGE_KEY);

    return storedTask ? JSON.parse(storedTask) : null;
  } catch {
    sessionStorage.removeItem(TASK_STORAGE_KEY);

    return null;
  }
};

const getTaskId = (data) =>
  data?.id ?? data?.Id ?? data?.TaskId ?? data?.Link ?? null;

/* ============================================================
   COMPONENT
============================================================ */

const WFTasks = ({ entityId, activeMenu: propActiveMenu }) => {
  const { activeMenu: contextActiveMenu } = useCustomNavigation();

  const activeMenu = propActiveMenu ?? contextActiveMenu;

  const [searchParams, setSearchParams] = useSearchParams();

  /* ============================================================
     URL STATE
  ============================================================ */

  const taskId = searchParams.get(TASK_PARAM);

  const isDetailsOpen = Boolean(taskId);

  /* ============================================================
     LOCAL STATE
  ============================================================ */

  const [selectedStat, setSelectedStat] = useState(() =>
    taskId ? getStoredTask() : null,
  );
  console.log("selectedStat", selectedStat);
  const initialFilters = useMemo(
    () =>
      entityId
        ? {
            ...DEFAULT_FILTERS,
            filters: [
              {
                parameterName: "entityId",
                value: entityId,
              },
            ],
            sortCriteria: [],
          }
        : DEFAULT_FILTERS,
    [entityId],
  );

  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  /* ============================================================
     CONFIG
  ============================================================ */

  const config = useMemo(
    () => ({
      headerName: activeMenu?.label,

      apiPath: "/Utility/GetDynamicPage",

      queryKey: "wftasklist",

      actions: {
        canView: activeMenu?.read || activeMenu?.update,

        canDelete: activeMenu?.delete,

        deleteApiPath: `/DynamicWorkflow/:id/${activeMenu?.id}`,

        invalidateKeys: [["workflowList"]],
      },
    }),
    [
      activeMenu?.id,
      activeMenu?.label,
      activeMenu?.read,
      activeMenu?.update,
      activeMenu?.delete,
    ],
  );

  /* ============================================================
     FILTER QUERY
  ============================================================ */

  const { data: filtersData, isLoading: isFiltersLoading } =
    useTableFiltersQuery({
      activeMenu,

      // Table is completely hidden while details are open.
      enabled: !isDetailsOpen || activeMenu?.id,
    });

  /* ============================================================
     TABLE QUERY
  ============================================================ */
  console.log("activeMenu?.id", activeMenu?.entityCodeId);
  const { data, isLoading, isError, error } = useDynamicPageQuery({
    config,
    activeMenu,
    appliedFilters,

    // Wait for the WF Tasks menu to resolve; on navigation from another
    // module the previous menu (without an entityCodeId) is briefly active.
    enabled:
      Boolean(activeMenu?.entityCodeId) && (!isDetailsOpen || activeMenu?.id),
  });

  const invalidateKeys = useMemo(
    () => [config?.queryKey || "dynamicPage", activeMenu?.id, appliedFilters],
    [activeMenu?.id, config?.queryKey, appliedFilters],
  );
  /* ============================================================
     OPEN DETAILS
  ============================================================ */

  const handleStatClick = useCallback(
    (stat) => {
      if (!stat?.Link) return;

      const id = getTaskId(stat);

      if (!id) return;

      setSelectedStat(stat);

      sessionStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(stat));

      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);

          nextParams.set(TASK_PARAM, String(id));

          return nextParams;
        },
        {
          replace: false,
        },
      );
    },
    [setSearchParams],
  );

  /* ============================================================
     CLOSE DETAILS
  ============================================================ */

  const handleCloseDetails = useCallback(() => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        nextParams.delete(TASK_PARAM);

        return nextParams;
      },
      {
        replace: true,
      },
    );

    /*
     * No need for setTimeout or useEffect.
     *
     * Keeping selectedStat in memory does not cause any issue
     * because the details panel becomes invisible.
     *
     * The next stat click simply replaces it.
     */
  }, [setSearchParams]);

  /* ============================================================
     FIELDS
  ============================================================ */

  const fieldsConfig = useMemo(
    () => getWFTasksFields(handleStatClick),
    [handleStatClick],
  );

  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const tableData = data?.data ?? [];

  const totalCount = data?.dataSize ?? 0;

  /* ============================================================
     HEADER
  ============================================================ */

  const headerProps = useMemo(
    () => ({
      activeMenuId: activeMenu?.id,

      headerName: config.headerName,

      setFilters: setAppliedFilters,

      defaultFilters: DEFAULT_FILTERS,

      filtersData: filtersData?.data ?? [],

      actionsConfig: {
        add: false,
        filter: true,
        export: true,
        back: false,
      },

      exportConfig: {
        apiPath: config.apiPath,
        activeMenu,
        appliedFilters,
        config,
      },
    }),
    [activeMenu, appliedFilters, config, filtersData?.data],
  );

  /* ============================================================
     ERROR
  ============================================================ */

  if (isError) {
    return (
      <p className="text-red-500">
        Error: {error?.message || "Something went wrong"}
      </p>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {!isDetailsOpen ? (
        <div
          className={classNames(
            "w-full min-w-0 overflow-hidden rounded-3xl",
            "shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
          )}
        >
          <Table
            data={tableData}
            totalRecords={totalCount}
            fieldsConfig={fieldsConfig}
            loading={isLoading}
            isFiltersLoading={isFiltersLoading}
            filters={appliedFilters}
            setFilters={setAppliedFilters}
            actions={config.actions}
            headerProps={headerProps}
            pageLinkSize={5}
            isOpen={false}
            isActionsVisible={false}
          />
        </div>
      ) : (
        <div className="relative w-full min-w-0 overflow-hidden">
          <button
            type="button"
            onClick={handleCloseDetails}
            aria-label="Back to task list"
            className={classNames(
              "absolute top-3 left-3 z-50",
              "flex h-10 w-10 items-center justify-center",
              "rounded-full bg-white",
              "shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
              "transition hover:scale-105 hover:bg-gray-100",
            )}
          >
            <i className="pi pi-arrow-left text-base text-gray-700" />
          </button>

          {selectedStat && (
            <div className="h-full w-full min-w-0">
              <TaskDetailsPanel
                payload={selectedStat}
                onClose={handleCloseDetails}
                moduleId={activeMenu?.id}
                invalidateKeys={invalidateKeys}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WFTasks;
