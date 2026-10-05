import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import classNames from "classnames";
import Table from "../../../components/Table/Table";
import { apiRequest } from "../../../services/apiBinding";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import { useAppNavigation } from "../../../navigation/NavigationContext";
import { useTableFiltersQuery } from "../../DynamicContent/DynamicPage/useDynamicPageQuery";
const defaultFilters = {
  page: 1,
  pageSize: 50,
  filters: [],
  sortCriteria: [],
  // moduleId: 2055,
};

// --- COMBINED CONFIG FOR COLUMNS AND FILTERS ---
const fieldsConfig = [
  { parameterName: "id", columnName: "Id", width: "70px" },
  { parameterName: "versionNumber", columnName: "Version No", width: "70px" },
  { parameterName: "name", columnName: "Name", width: "210px" },
  {
    parameterName: "entityCode",
    columnName: "Entity Code",
    width: "160px",
  },
  {
    parameterName: "defaultCaseFolder",
    columnName: "Default Case Folder",
    width: "160px",
  },

  { parameterName: "isActive", columnName: "Is Active" },

  { parameterName: "created", type: "date", columnName: "Created" },
  { parameterName: "modified", type: "date", columnName: "Modified" },
];

const Templates = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "templates";

  const navigate = useNavigate();
  const { activeMenu } = useAppNavigation();
  console.log("activeMenu", activeMenu);
  const isDraft = type === "draft" ? 1 : 0;

  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const initialFilters = useMemo(
    () => ({
      ...defaultFilters,
      filters: [],
      sortCriteria: [],
    }),
    [],
  );

  const { data: filtersData, isLoading: isFiltersLoading } =
    useTableFiltersQuery({
      activeMenu,
    });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["templates", type, appliedFilters],
    queryFn: () =>
      apiRequest({
        apiPath: "Utility/GetDynamicPage",
        payload: {
          ...appliedFilters,
          // isDraft,
          moduleId: activeMenu?.id,
          // entityCode: activeMenu?.entityCode,
          entityCodeId: activeMenu?.entityCodeId,
        },
        method: "post",
      }),
    keepPreviousData: true,
  });

  const addData = useCallback(() => {
    searchParams.set("type", type);
    navigate(`add?${searchParams.toString()}`);
  }, [appliedFilters, type]);

  useEffect(() => {
    setAppliedFilters((prev) => ({
      ...prev,
      page: 1,
      filters: [
        // Remove any existing isDraft filter
        ...prev.filters.filter((filter) => filter.parameterName !== "isDraft"),
        // Add the current isDraft filter
        {
          parameterName: "isDraft",
          value: isDraft,
          value2: null,
          label: "",
        },
      ],
    }));
  }, [isDraft]);

  const invalidateKeys = useMemo(
    () => ["templates", type, appliedFilters],
    [type, appliedFilters],
  );

  console.log("activeMenu", activeMenu);
  if (isError) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="flex gap-1">
      <div
        className={classNames(
          params?.formManager ? "w-85" : "w-full",
          "transition-all duration-300",
        )}
      >
        <Table
          data={data?.data || []}
          totalRecords={data?.dataSize || 0}
          booleanFields={["isActive", "clusterExhibits", "updateClusterStatus"]}
          loading={isLoading || isFiltersLoading}
          filters={appliedFilters}
          fieldsConfig={fieldsConfig}
          isActionsVisible
          actions={{
            canView: false,
            canEdit: false,
            canDelete: activeMenu?.delete,
            renderActions: (rowData) => (
              <>
                {/* <CustomButton
                onClick={() =>
                  navigate(
                    `clone?id=${rowData?.id}&versionId=${rowData?.versionId}`,
                  )
                }
                text
                icon="pi pi-clone"
                className="p-0! w-fit! rounded-none! text-(--color-fontFive)!"
                aria-label="Edit"
              /> */}
                {activeMenu.update && (
                  <CustomButton
                    onClick={() => {
                      const params = new URLSearchParams();

                      params.set("id", rowData?.id);
                      params.set("versionId", rowData?.versionId);
                      params.set("type", type);

                      navigate(`edit?${params.toString()}`);
                    }}
                    text
                    icon="pi pi-pencil text-xs!"
                    className="p-0! w-fit! rounded-none! text-(--color-fontFive)!"
                    aria-label="Edit"
                  />
                )}
              </>
            ),
            deleteApiPath: `Utility/DynamicPageDelete?Id=:id&ModuleId=${activeMenu?.id}&EntityCodeId=${activeMenu?.entityCodeId}`,
            invalidateKeys: [["templates", type, appliedFilters]],
            apiClient: "optimust",
          }}
          headerProps={{
            addData,
            headerName:
              type === "draft"
                ? `Drafts ${activeMenu?.label}`
                : `Published ${activeMenu?.label}`,
            extraBtn:
              type === "draft" ? (
                <CustomButton
                  text
                  label="View Templates"
                  icon="pi pi-file text-xs!"
                  iconPos="left"
                  className="outlineBtn"
                  aria-label="View Templates"
                  onClick={() =>
                    navigate("/documents/templates?type=templates")
                  }
                />
              ) : (
                <CustomButton
                  text
                  icon="pi pi-file"
                  label="View Drafts"
                  iconPos="left"
                  className="outlineBtn"
                  aria-label="View Drafts"
                  onClick={() => navigate("/documents/templates?type=draft")}
                />
              ),

            setFilters: setAppliedFilters,
            defaultFilters: initialFilters,
            filtersData: filtersData?.data || [],

            actionsConfig: {
              add: activeMenu?.create,
              filter: true,
              export: true,
              back: !!params?.formManager,
            },

            exportConfig: {
              apiPath: "Utility/GetDynamicPage",
              activeMenu,
              appliedFilters,
              config: {
                apiPath: "template/page",
                transformResponse: (data) => data?.data || [],
              },
            },
          }}
          page={(appliedFilters.page - 1) * appliedFilters.pageSize}
          setAppliedFilters={setAppliedFilters}
          rows={appliedFilters.pageSize}
        />
      </div>
      <Outlet context={{ invalidateKeys }} />
    </div>
  );
};

export default Templates;
