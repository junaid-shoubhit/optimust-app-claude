import { Suspense, useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useParams } from "react-router-dom";
import classNames from "classnames";

import Table from "../../../components/Table/Table";
import FormModal from "../../../components/Modal/FormModal";

import { apiRequest } from "../../../services/apiBinding";
import { capitalize } from "../../../utils/constant";

import { useTableFiltersQuery } from "../../DynamicContent/DynamicPage/useDynamicPageQuery";

import WorkFlowForm from "./WorkFlowModalForm/WorkFlowForm";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext";

const defaultFilters = {
  page: 1,
  pageSize: 50,
};

const WorkFlow = () => {
  const { activeMenu } = useCustomNavigation();

  const { workflowSlug, formManager } = useParams();

  const isFormOpen = !!formManager;

  const { workflowType, workflowTypeId, workflowTypeKey } = useMemo(() => {
    if (!workflowSlug) return {};

    const [type, id, key] = workflowSlug.split("-");

    return {
      workflowType: capitalize(type),
      workflowTypeId: Number(id),
      workflowTypeKey: capitalize(
        (key || type).replace(/^./, (c) => c.toUpperCase()),
      ),
    };
  }, [workflowSlug]);

  const [visible, setVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const initialFilters = useMemo(
    () => ({
      ...defaultFilters,
      filters: [
        {
          parameterName: "workflowTypeId",
          value: workflowTypeId,
        },
      ],
      sortCriteria: [],
    }),
    [workflowTypeId],
  );
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  /* ================= FILTER API ================= */

  const { data: filtersData, isLoading: isFiltersLoading } =
    useTableFiltersQuery({
      activeMenu,
    });

  /* ================= CONFIG ================= */

  const config = useMemo(
    () => ({
      headerName: `${workflowType} Workflow`,
      apiPath: "/Utility/GetDynamicPage",
      queryKey: ["workflowList", workflowTypeId],
      transformResponse: (data) => data?.data || [],

      buildPayload: (filters) => ({
        ...filters,
        moduleId: activeMenu?.id,
        entityCodeId: activeMenu?.entityCodeId,
      }),

      actions: {
        canView: activeMenu?.read || activeMenu?.update,
        canDelete: activeMenu?.delete,
        deleteApiPath: `/DynamicWorkflow/:id/${activeMenu?.id}`,
        invalidateKeys: [["workflowList", workflowTypeId, appliedFilters]],
      },

      modal: {
        title: `Add ${workflowType?.toUpperCase()} WORKFLOW`,
        width: "43vw",
        Component: WorkFlowForm,
      },
    }),
    [workflowType, workflowTypeId, activeMenu, appliedFilters],
  );

  /* ================= TABLE FIELDS ================= */

  const fieldsConfig = useMemo(() => {
    const columns = [
      {
        parameterName: "formName",
        columnName: "Form Name",
        width: "135px",
      },
      {
        parameterName: "name",
        columnName: "Workflow Name",
        width: "230px",
      },
      {
        parameterName: "tabName",
        columnName: "Tab Name",
        width: "235px",
      },
      {
        parameterName: "tabType",
        columnName: "Tab Type",
        width: "235px",
      },
      {
        parameterName: "mappingType",
        columnName: "Mapping",
        width: "240px",
      },
      {
        parameterName: "created",
        columnName: "Created",
        width: "180px",
        type: "datetime",
      },
      {
        parameterName: "createdBy",
        columnName: "Created By",
      },
      {
        parameterName: "modified",
        columnName: "Modified",
        width: "180px",
        type: "datetime",
      },
      {
        parameterName: "modifiedBy",
        columnName: "Modified By",
      },
    ];

    const filterConfigs = filtersData?.data || [];

    return columns.map((column) => {
      const matchedFilter = filterConfigs.find(
        (filter) =>
          String(filter?.parameterName || "").toLowerCase() ===
          String(column?.parameterName || "").toLowerCase(),
      );
      if (!matchedFilter) {
        return {
          ...column,
          isFilter: false,
        };
      }

      return {
        ...column,
        ...matchedFilter,
      };
    });
  }, [filtersData?.data]);
  console.log("filtersData", filtersData);
  console.log("fieldsConfig13", fieldsConfig);
  /* ================= MAIN QUERY ================= */

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...config.queryKey, appliedFilters],
    enabled: !!workflowTypeId,
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: config.apiPath,
        payload: config.buildPayload(appliedFilters),
        method: "post",
        signal,
      }),
    keepPreviousData: true,
  });

  /* ================= TABLE DATA ================= */

  const tableData = useMemo(
    () => config.transformResponse(data),
    [data, config],
  );

  useEffect(() => {
    if (data?.dataSize !== undefined) {
      setTotalCount(data.dataSize);
    }
  }, [data]);

  useEffect(() => {
    if (workflowTypeId) {
      setAppliedFilters(initialFilters);
    }
  }, [initialFilters, workflowTypeId]);

  /* ================= ACTIONS ================= */

  const addData = useCallback(() => {
    setVisible(true);
  }, []);

  /* ================= HEADER ================= */

  const headerProps = useMemo(
    () => ({
      addData,

      activeMenuId: activeMenu?.id,

      headerName: config.headerName,

      setFilters: setAppliedFilters,

      defaultFilters: initialFilters,

      filtersData: filtersData?.data || [],

      actionsConfig: {
        add: activeMenu?.create,
        filter: true,
        export: true,
        back: isFormOpen,
      },

      exportConfig: {
        apiPath: config.apiPath,

        activeMenu,

        appliedFilters,

        config,
      },
    }),
    [
      addData,
      activeMenu,
      config,
      appliedFilters,
      filtersData?.data,
      isFormOpen,
      initialFilters,
    ],
  );

  if (isError) {
    return (
      <p className="text-red-500">
        Error: {error?.message || "Something went wrong"}
      </p>
    );
  }

  const ModalComponent = config.modal.Component;

  return (
    <div className="flex gap-4 w-full">
      <div
        className={classNames(
          formManager ? "w-84" : "w-full!",
          "rounded-3xl transition-all duration-300 shadow-[0_4px_8px_3px_rgba(0,0,0,0.15)]",
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
          isSelectionMode={false}
          actions={config.actions}
          headerProps={headerProps}
          pageLinkSize={isFormOpen ? 3 : 5}
          isOpen={isFormOpen}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-[calc(100%-290px)]">
          <Outlet />
        </div>
      </Suspense>

      <FormModal
        visible={visible}
        setVisible={setVisible}
        title={config.modal.title}
        width={config.modal.width}
      >
        <ModalComponent
          setVisible={setVisible}
          workflowTypeId={workflowTypeId}
          workflowTypeKey={workflowTypeKey || ""}
          activeMenu={activeMenu}
        />
      </FormModal>
    </div>
  );
};

export default WorkFlow;
