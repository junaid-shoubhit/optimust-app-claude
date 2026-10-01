import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getCascadeOptions } from "../../../services/apiBinding";
import {
  buildDefaultDynamicValues,
  convertToFormData,
  hydrateMultiFields,
  normalizeKey,
} from "../noTabConstant";
import { useMemo } from "react";

const sortByOrder = (a, b) =>
  Number(a?.orderByExpression || 0) - Number(b?.orderByExpression || 0);

export const fetchNoTabFields = async (
  entityCodeId,
  moduleId,
  tabName = "No Tab",
  entityId = 0,
) => {
  return apiRequest({
    apiPath: "/FieldDefinition/tabs/definitions",
    method: "post",
    payload: {
      entityId: tabName === "No Tab" ? 0 : entityId,
      tabName,
      entityCodeId,
      moduleId,
    },
  });
};

export const fetchDynamicValues = async ({
  entityId,
  entityCodeId,
  moduleId,
  isParent,
  tabName = "No Tab",
  workFlowId,
  isImport,
}) => {
  return apiRequest({
    apiPath: "Case/dynamic",
    method: "post",
    payload: {
      entityId,
      tabName,
      entityCodeId,
      isParent,
      moduleId,
      workFlowId,
      isImport,
    },
  });
};

export const useNoTabFields = (
  { entityId, entityCodeId, moduleId, tabName = "No Tab", prefillValues = {} },
  options = {},
  designType,
) => {
  const parentEntityId = tabName === "No Tab" ? 0 : entityId;

  return useQuery({
    queryKey: ["notab-fields", entityCodeId, tabName, parentEntityId],

    queryFn: () => fetchNoTabFields(entityCodeId, moduleId, tabName, entityId),

    enabled: options.enabled ?? true,

    select: (res) => {
      const singleFieldDefinitions = [];
      const multipleFieldDefinitions = [];
      const isSingleFieldMode = designType === "no-tabs-single-field";

      (res?.fieldDefinitions || []).forEach((field) => {
        const fieldId = String(field?.id);

        const prefill = prefillValues?.[fieldId];

        let mapped = field;

        if (prefill) {
          const prefillData = Array.isArray(prefill) ? prefill[0] : prefill;
          mapped = {
            ...mapped,
            defaultValue: prefillData?.value,
            defaultLabel: prefillData?.label,
            readOnly: true,
          };
        }

        if (isSingleFieldMode) {
          if (field?.tabTypeId === 1 || field?.tabTypeId === 2) {
            singleFieldDefinitions.push(mapped);
          }
          return;
        }
        if (field?.tabTypeId === 1) {
          singleFieldDefinitions.push(mapped);
        }

        if (field?.tabTypeId === 2) {
          multipleFieldDefinitions.push(mapped);
        }
      });

      singleFieldDefinitions.sort(sortByOrder);
      multipleFieldDefinitions.sort(sortByOrder);

      return {
        ...res,
        fieldDefinitions: singleFieldDefinitions,
        multipleFieldDefinitions: isSingleFieldMode
          ? []
          : multipleFieldDefinitions,
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useNoTabDynamicValues = (
  {
    entityId,
    entityCodeId,
    moduleId,
    isParent,
    tabName = "No Tab",
    contextId,
    workFlowId,
    isImport,
  },
  fieldData,
  options = {},
  designType,
) => {
  const queryClient = useQueryClient();

  // contextId disambiguates the cache entry when the same parent entityId
  // can host multiple different "definitions" contexts (e.g. switching which
  // automation is selected under the same parent record). Without this the
  // query key never changes across automations and React Query serves stale
  // cached values from whichever automation was fetched first.
  const cacheContext = contextId ?? tabName;
  console.log("queryKey", [
    "notab-dynamic",
    entityId,
    entityCodeId,
    cacheContext,
  ]);
  return useQuery({
    queryKey: ["notab-dynamic", entityId, entityCodeId, cacheContext],

    enabled:
      (options.enabled ?? true) &&
      Boolean(entityId) &&
      Boolean(
        fieldData?.fieldDefinitions?.length ||
        fieldData?.multipleFieldDefinitions?.length,
      ),

    queryFn: async () => {
      const res = await fetchDynamicValues({
        entityId,
        entityCodeId,
        moduleId,
        isParent,
        tabName,
        workFlowId,
        isImport,
      });
      const data = res?.data || [];

      // O(1) lookup instead of data.find() per relation field
      const dataByDefinitionId = new Map(data.map((d) => [d.definitionId, d]));

      const multiDefMap = Object.fromEntries(
        (fieldData?.multipleFieldDefinitions || []).map((f) => [f.id, f]),
      );
      const fieldDefinitionMap = Object.fromEntries(
        (fieldData?.fieldDefinitions || []).map((field) => [field.id, field]),
      );
      const relationMap = Object.fromEntries(
        (fieldData?.relationData || []).map((r) => [r.childFieldId, r]),
      );

      // Split single-tab items from multi-tab rows in one pass (unchanged logic,
      // just pulled out of the async branch below so relation lookups can run
      // independently of it).
      const singleItems = [];
      let multiFields = {};

      // First collect multi-field items by workflow
      const multiItemsByWorkflow = {};

      for (const item of data) {
        if (designType === "no-tabs-single-field" || item.tabTypeId === 1) {
          singleItems.push(item);
          continue;
        }

        if (item.tabTypeId === 2) {
          const def = multiDefMap[item.definitionId];

          if (!def) continue;

          const wfId = def.workFlowId;

          multiItemsByWorkflow[wfId] ??= [];
          multiItemsByWorkflow[wfId].push(item);
        }
      }

      // Normalize rowIndex per workflow
      for (const [wfId, items] of Object.entries(multiItemsByWorkflow)) {
        // Get unique row indexes and sort them
        const uniqueRowIndexes = [
          ...new Set(items.map((item) => Number(item.rowIndex || 1))),
        ].sort((a, b) => a - b);

        // Map original rowIndex -> sequential index
        // Example:
        // 1 -> 0
        // 3 -> 1
        // 7 -> 2
        const rowIndexMap = new Map(
          uniqueRowIndexes.map((rowIndex, index) => [rowIndex, index]),
        );

        multiFields[wfId] = [];

        for (const item of items) {
          const def = multiDefMap[item.definitionId];

          if (!def) continue;

          const fieldKey = normalizeKey(def.name);

          const originalRowIndex = Number(item.rowIndex || 1);

          const normalizedRowIndex = rowIndexMap.get(originalRowIndex) ?? 0;

          multiFields[wfId][normalizedRowIndex] ??= {};

          multiFields[wfId][normalizedRowIndex][fieldKey] = item;
        }
      }

      // Relation-option lookups are independent of each other — run them
      // concurrently instead of one at a time.
      const relationOptions = await Promise.all(
        singleItems.map(async (item) => {
          const fieldMeta = fieldDefinitionMap[item.definitionId];
          if (!fieldMeta?.isRelation) return null;

          const relation = relationMap[item.definitionId];
          const parentItem = relation
            ? dataByDefinitionId.get(relation.parentFieldId)
            : null;

          const { options } = await queryClient.fetchQuery({
            queryKey: ["relation-options", item.definitionId, item.value],
            queryFn: () =>
              getCascadeOptions({
                page: 1,
                pageSize: 999999,
                dataTable: fieldMeta.dropdownTable,
                dataField: fieldMeta.dropdownTableColumn,
                fieldDefinitionId: item.definitionId,
                entityCode: fieldMeta?.entityCode,
                entityId: item?.entityId,
                searchTerm: `${item?.label}`,
                selectedValue: parentItem?.value ?? "",
              }),
            staleTime: 1000 * 60 * 30,
          });

          return options?.[0] ?? null;
        }),
      );

      const singleFormData = {};
      singleItems.forEach((item, i) => {
        const fieldMeta = fieldDefinitionMap[item.definitionId];
        singleFormData[normalizeKey(item.definitionName)] = {
          ...item,
          isRelation: fieldMeta?.isRelation ?? false,
          dropdownTable: fieldMeta?.dropdownTable,
          dropdownTableColumn: fieldMeta?.dropdownTableColumn,
          relationId: fieldMeta?.relationId,
          relationOption: relationOptions[i],
          formatterId: fieldMeta?.formatterId,
          formatterName: fieldMeta?.formatterName,
          validationId: fieldMeta?.validationId,
          validationName: fieldMeta?.validationName,
        };
      });

      const singleFields = convertToFormData(singleFormData);
      multiFields = await hydrateMultiFields(multiFields, queryClient);

      return { ...res, singleFields, multiFields };
    },

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useNoTabFormData = (
  params,
  options = {},
  designType,
  // isCaseWorkflow,
) => {
  const fieldQuery = useNoTabFields(
    params,
    options,
    designType,
    // isCaseWorkflow,
  );

  const dynamicQuery = useNoTabDynamicValues(
    params,
    fieldQuery.data,
    options,
    designType,
  );

  const isCreateMode = !params?.entityId;

  const defaultDynamicValues = useMemo(() => {
    if (!isCreateMode || !fieldQuery.data) return undefined;
    return buildDefaultDynamicValues(fieldQuery.data);
  }, [isCreateMode, fieldQuery.data]);

  // Whether the dynamic query is even expected to run for this fieldData.
  // Needed because during the gap right after fieldQuery resolves but before
  // dynamicQuery has started fetching, both isLoading flags can read false
  // for one tick — which would flash an "everything's ready" render with
  // empty values. isReady tracks intent, not just current fetch status.
  const dynamicShouldRun = Boolean(
    params?.entityId &&
    (fieldQuery.data?.fieldDefinitions?.length ||
      fieldQuery.data?.multipleFieldDefinitions?.length),
  );

  const isReady =
    fieldQuery.isSuccess && (!dynamicShouldRun || dynamicQuery.isSuccess);

  return {
    fieldData: fieldQuery.data,
    dynamicValues: isCreateMode ? defaultDynamicValues : dynamicQuery.data,
    isLoading:
      fieldQuery.isLoading || (dynamicShouldRun && dynamicQuery.isLoading),

    isReady, // <- use this to gate rendering when you want a hard block

    isFieldLoading: fieldQuery.isLoading,
    isDynamicLoading: dynamicQuery.isLoading,
    isDynamicFetching: dynamicQuery.isFetching,

    isError: fieldQuery.isError || dynamicQuery.isError,

    error: fieldQuery.error || dynamicQuery.error,
  };
};
