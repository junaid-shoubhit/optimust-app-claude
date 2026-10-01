import { useMemo, useEffect, useCallback, useRef, memo, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import TabSidebar from "./TabSidebar.jsx";
import SingleFields from "./SingleFields/SingleFields.jsx";
import TabTable from "./TableFields/TabTable.jsx";
import { toast } from "react-toastify";
import { useTabNavigation } from "./hooks/useTabNavigation.js";
import {
  invalidateCaseOverviewIfNeeded,
  transformValue,
} from "./tabConstant.js";
import { normalizeValue } from "./tabConstant.js";
import { getFieldKey } from "./tabConstant.js";
import { groupTableRows } from "./tabConstant.js";
import { isEqual } from "./tabConstant.js";
import { apiRequest } from "../../services/apiBinding.js";
import CustomButton from "../Forms/Buttons/CustomButton.jsx";
const cloneValue = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  try {
    return structuredClone(value);
  } catch {
    return value;
  }
};

const isValueChanged = (currentValue, originalValue) => {
  return !isEqual(cloneValue(currentValue), cloneValue(originalValue));
};

const TabsForm = ({
  entityId,
  setStep,
  selectedTab,
  tabs,
  entityCode,
  entityCodeId,
  handleClose,
  designType,
  data,
  moduleId,
  isMassUpdate,
  selectedMassIds,
}) => {
  const [isRowEditing, setIsRowEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  // const entityId = data?.data?.id || data?.id;
  const queryClient = useQueryClient();

  /* ------------------ FORM ------------------ */
  const { handleSubmit, clearErrors, control, setValue, getValues } = useForm({
    shouldUnregister: false,
    mode: "onBlur",
    reValidateMode: "onBlur",
  });
  /* ------------------ GLOBAL FIELD MAP ------------------ */
  const prefilledTabsRef = useRef({});
  const fieldDefMapRef = useRef({});

  const originalSnapshotRef = useRef({
    flat: {},
    tables: {},
  });

  const preserveActiveTabRef = useRef(null);
  const previousSelectedTabRef = useRef(null);
  const changedTabsRef = useRef(new Set());

  /* ------------------ TABS ------------------ */
  const {
    data: tabsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tabs", entityId, entityCodeId, isMassUpdate],
    enabled: (isMassUpdate || !!entityId) && !tabs?.length,
    staleTime: Infinity,
    queryFn: () =>
      apiRequest({
        apiPath: `FieldDefinition/tabs/${entityCodeId}/${entityId}/true${isMassUpdate ? "/true" : "/false"}`,
        method: "get",
      }),
    select: (data) =>
      [...(data?.data || [])].sort(
        (a, b) => a.orderExpression - b.orderExpression,
      ),
  });
  const sortedTabs = useMemo(() => {
    if (tabs?.length) return tabs;
    return tabsData || [];
  }, [tabs, tabsData]);

  useEffect(() => {
    if (!isLoading && sortedTabs && sortedTabs.length === 0) {
      handleClose?.();
    }
  }, [sortedTabs, handleClose, isLoading]);
  const { activeIndex, setActiveIndex, goNextTab, goPrevTab } =
    useTabNavigation(sortedTabs, selectedTab, entityId);
  const activeTabName = useMemo(
    () => sortedTabs?.[activeIndex]?.tabName ?? null,
    [sortedTabs, activeIndex],
  );

  /* ------------------ FIELD DEFINITIONS ------------------ */
  const syncAfterMutation = useCallback(
    async (message) => {
      setIsSyncing(true);
      try {
        const tabToRestore = preserveActiveTabRef.current;

        /**
         * IMPORTANT:
         *
         * changedTabsRef contains only tabs that had actual
         * changes.
         *
         * The submit tab is added in onSubmit AFTER a real
         * save/delete operation has happened.
         */
        const tabsToSync = sortedTabs.filter(
          (tab) => tab?.tabName && changedTabsRef.current.has(tab.tabName),
        );

        console.log(
          "Tabs selected for post-save sync:",
          tabsToSync.map((tab) => tab.tabName),
        );

        /**
         * Clear hydration guards ONLY for tabs being synced.
         */
        tabsToSync.forEach((tab) => {
          delete prefilledTabsRef.current[tab.tabName];
        });

        /**
         * Do NOT clear the entire original snapshot.
         *
         * Only the tabs successfully synchronized below
         * will update their snapshots.
         */
        for (const tabToSync of tabsToSync) {
          /**
           * -----------------------------------------------------
           * FIELD DEFINITIONS API
           * -----------------------------------------------------
           */
          const fieldResponse = await apiRequest({
            apiPath: `/FieldDefinition/tabs/definitions`,
            method: "post",
            payload: {
              entityId: 0,
              tabName: tabToSync.tabName,
              entityCodeId,
              workFlowId: tabToSync?.workFlowId ?? null,
            },
          });

          const fieldDefinitions = (fieldResponse?.fieldDefinitions || []).sort(
            (a, b) =>
              Number(a.orderByExpression || 0) -
              Number(b.orderByExpression || 0),
          );

          /**
           * -----------------------------------------------------
           * DYNAMIC API
           * -----------------------------------------------------
           */
          const dynamicResponse = await apiRequest({
            apiPath: "Case/dynamic",
            method: "post",
            payload: {
              userId: 0,
              entityId: isMassUpdate ? 0 : entityId,
              tabName: tabToSync.tabName,
              entityCodeId,
              workFlowId: tabToSync?.workFlowId ?? null,
              moduleId,
            },
          });

          const dyn = dynamicResponse?.data || [];

          /**
           * -----------------------------------------------------
           * UPDATE FIELD QUERY CACHE
           * -----------------------------------------------------
           */
          queryClient.setQueryData(
            ["fields", entityCodeId, tabToSync.tabName, entityId],
            {
              ...fieldResponse,
              fieldDefinitions,
            },
          );

          /**
           * -----------------------------------------------------
           * UPDATE DYNAMIC QUERY CACHE
           * -----------------------------------------------------
           */
          queryClient.setQueryData(
            ["dynamic", entityId, tabToSync.tabName],
            dynamicResponse,
          );

          /**
           * -----------------------------------------------------
           * TABLE TAB
           * -----------------------------------------------------
           */
          if (tabToSync?.tabTypeId === 2) {
            const tableGrouped = groupTableRows(dyn);

            const normalizedRows = Object.keys(tableGrouped)
              .filter(Boolean)
              .sort((a, b) => Number(a) - Number(b));

            const hasBackendRows = normalizedRows.length > 0;

            const rowsToProcess = hasBackendRows ? normalizedRows : ["0"];

            const rowsArray = rowsToProcess.map((backendRowIndex) => {
              const rowData = hasBackendRows
                ? tableGrouped[backendRowIndex] || []
                : [];

              const rowObj = {};

              fieldDefinitions.forEach((def) => {
                const item = rowData.find((i) => i.definitionId === def.id);

                const label = item?.label ?? def.defaultLabel ?? null;

                const normalizedValue = normalizeValue(def, item?.value, label);

                const value = cloneValue(normalizedValue);

                const fieldKey = getFieldKey(def.name);

                rowObj[fieldKey] = value;

                rowObj.workFlowId = tabToSync?.workFlowId ?? null;

                fieldDefMapRef.current[`${tabToSync.tabName}.${fieldKey}`] = {
                  ...def,
                  tabName: tabToSync.tabName,
                  rowIndex: Number(backendRowIndex),
                };
              });

              rowObj.__rowId = Number(backendRowIndex);

              rowObj.__isNew = !hasBackendRows;

              return rowObj;
            });

            const finalRowsArray = rowsArray.filter((row) => row.__rowId !== 0);

            /**
             * Update RHF only for this table.
             */
            setValue(
              `tableRows.${tabToSync.tabName}`,
              cloneValue(finalRowsArray),
              {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false,
              },
            );

            /**
             * Update original snapshot only for
             * this synchronized table.
             */
            originalSnapshotRef.current.tables[tabToSync.tabName] =
              cloneValue(finalRowsArray);
          } else {
            /**
             * ---------------------------------------------------
             * FLAT / NON-TABLE TAB
             * ---------------------------------------------------
             */
            fieldDefinitions.forEach((def) => {
              const match = dyn.find(
                (d) => d.definitionId === def.id && d.rowIndex === 1,
              );

              const label = match?.label ?? def.defaultLabel ?? null;

              const normalizedValue = normalizeValue(
                def,
                match?.value,
                label,
                isMassUpdate,
              );

              const originalValue = cloneValue(normalizedValue);

              const key = getFieldKey(def.name);

              /**
               * Keep the tab name in the field definition map.
               */
              fieldDefMapRef.current[key] = {
                ...def,
                tabName: tabToSync.tabName,
                rowIndex: match?.rowIndex ?? null,
              };

              /**
               * Update RHF with fresh backend value.
               */
              setValue(key, cloneValue(normalizedValue), {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false,
              });

              /**
               * Update flat original snapshot.
               */
              originalSnapshotRef.current.flat[key] = cloneValue(originalValue);
            });
          }

          /**
           * Mark only this tab as freshly hydrated.
           */
          prefilledTabsRef.current[tabToSync.tabName] = true;

          console.log(`Post-save sync completed for tab: ${tabToSync.tabName}`);
        }

        /**
         * Invalidate related UI queries.
         */
        await queryClient.invalidateQueries({
          queryKey: ["overview-tabs", entityCodeId, entityId],
        });

        await queryClient.invalidateQueries({
          queryKey: ["tab-save-progress", entityId],
        });

        queryClient.removeQueries({
          queryKey: ["selectOptions"],
        });

        /**
         * Restore the tab that was active before save.
         */
        if (tabToRestore?.tabName) {
          const restoredIndex = sortedTabs.findIndex(
            (tab) => tab.tabName === tabToRestore.tabName,
          );

          if (restoredIndex !== -1) {
            setActiveIndex(restoredIndex);
          }
        }

        /**
         * IMPORTANT:
         *
         * Save + sync completed successfully.
         * Clear the changed tabs so the next submit
         * does NOT call these APIs again.
         */
        changedTabsRef.current.clear();

        if (message) {
          toast.success(message);
        }
      } catch (e) {
        console.error("Post mutation sync failed", e);
        throw e;
      } finally {
        setIsSyncing(false);
      }
    },
    [
      entityId,
      queryClient,
      entityCodeId,
      setValue,
      isMassUpdate,
      moduleId,
      sortedTabs,
      setActiveIndex,
    ],
  );

  const { data: currentTab, isLoading: isFieldLoading } = useQuery({
    queryKey: ["fields", entityCodeId, activeTabName, entityId],
    enabled: !!activeTabName && activeIndex !== -1,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await apiRequest({
        apiPath: `/FieldDefinition/tabs/definitions`,
        method: "post",
        payload: {
          entityId: 0,
          tabName: activeTabName,
          entityCodeId,
          workFlowId: sortedTabs?.[activeIndex]?.workFlowId ?? null,
        },
      });

      return {
        ...res,
        fieldDefinitions: (res?.fieldDefinitions || []).sort(
          (a, b) =>
            Number(a.orderByExpression || 0) - Number(b.orderByExpression || 0),
        ),
      };
    },
  });

  /* ------------------ DYNAMIC VALUES ------------------ */
  const { data: dynamicValues, isLoading: isDynamicLoading } = useQuery({
    queryKey: ["dynamic", entityId, activeTabName],
    enabled: !!activeTabName && !!entityId && activeIndex !== -1,
    staleTime: Infinity, // 🚀 prevents refetch when revisiting tab
    // keepPreviousData: true, // smoother tab switching
    queryFn: () =>
      apiRequest({
        apiPath: "Case/dynamic",
        method: "post",
        payload: {
          userId: 0,
          entityId: isMassUpdate ? 0 : entityId,
          tabName: activeTabName,
          entityCodeId,
          workFlowId: sortedTabs?.[activeIndex]?.workFlowId ?? null,
          moduleId,
        },
      }),
  });

  /* ------------------ PREFILL WITHOUT RESET ------------------ */

  /* ------------------------------------------------------------------ */
  /* NON TABLE TAB                                                      */
  /* ------------------------------------------------------------------ */
  const hydrateFlatFields = useCallback(
    (dyn) => {
      if (!currentTab?.fieldDefinitions?.length) return;

      currentTab.fieldDefinitions.forEach((def) => {
        const match = dyn.find(
          (d) => d.definitionId === def.id && d.rowIndex === 1,
        );

        const label = match?.label ?? def.defaultLabel ?? null;

        const normalizedValue = normalizeValue(
          def,
          match?.value,
          label,
          isMassUpdate,
        );

        const originalValue = cloneValue(normalizedValue);

        const key = getFieldKey(def.name);

        const snapshot = originalSnapshotRef.current.flat;

        const hasOriginal = Object.prototype.hasOwnProperty.call(snapshot, key);

        /**
         * Only create original snapshot once.
         */
        if (!hasOriginal) {
          snapshot[key] = cloneValue(originalValue);
        }

        /**
         * Store the tab name so onSubmit knows
         * exactly which tab owns this field.
         */
        fieldDefMapRef.current[key] = {
          ...def,
          tabName: activeTabName,
          rowIndex: match?.rowIndex ?? null,
        };

        const existingValue = getValues(key);

        const userChanged =
          hasOriginal && isValueChanged(existingValue, snapshot[key]);

        if (!userChanged && !isEqual(existingValue, normalizedValue)) {
          setValue(key, cloneValue(normalizedValue), {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      });
    },
    [
      currentTab?.fieldDefinitions,
      getValues,
      setValue,
      isMassUpdate,
      activeTabName,
    ],
  );

  /* ------------------------------------------------------------------ */
  /* TABLE TAB                                                          */
  /* ------------------------------------------------------------------ */
  const hydrateTableFields = useCallback(
    (dyn) => {
      if (!currentTab?.fieldDefinitions?.length) return;
      const tableGrouped = groupTableRows(dyn);

      const normalizedRows = Object.keys(tableGrouped)
        .filter(Boolean)
        .sort((a, b) => Number(a) - Number(b));

      const hasBackendRows = normalizedRows.length > 0;
      const rowsToProcess = hasBackendRows ? normalizedRows : ["0"];

      const rowsArray = rowsToProcess.map((backendRowIndex) => {
        const rowData = hasBackendRows
          ? tableGrouped[backendRowIndex] || []
          : [];

        const rowObj = {};
        currentTab.fieldDefinitions.forEach((def) => {
          const item = rowData.find((i) => i.definitionId === def.id);

          const label = item?.label ?? def.defaultLabel ?? null;

          // Backend
          // ↓
          // normalizeValue
          const normalizedValue = normalizeValue(def, item?.value, label);

          // ↓
          // clone
          const value = cloneValue(normalizedValue);

          const fieldKey = getFieldKey(def.name);

          rowObj[fieldKey] = value;
          rowObj.workFlowId = selectedTab?.workFlowId;
          // rowObj.workFlowId =
          //   sortedTabs?.find((tab) => tab.tabName === activeTabName)
          //     ?.workFlowId ?? null;

          fieldDefMapRef.current[`${activeTabName}.${fieldKey}`] = {
            ...def,
            tabName: activeTabName,
            rowIndex: Number(backendRowIndex),
          };
        });

        rowObj.__rowId = Number(backendRowIndex);
        rowObj.__isNew = !hasBackendRows;
        return rowObj;
      });

      const finalRowsArray = rowsArray.filter((row) => row.__rowId !== 0);

      /**
       * RHF gets its own independent copy.
       */
      setValue(`tableRows.${activeTabName}`, cloneValue(finalRowsArray), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });

      /**
       * ORIGINAL SNAPSHOT
       *
       * Completely independent from RHF.
       */
      const hasTableSnapshot = Object.prototype.hasOwnProperty.call(
        originalSnapshotRef.current.tables,
        activeTabName,
      );

      if (!hasTableSnapshot) {
        originalSnapshotRef.current.tables[activeTabName] =
          cloneValue(finalRowsArray);
      }
    },
    [
      currentTab?.fieldDefinitions,
      setValue,
      selectedTab?.workFlowId,
      activeTabName,
    ],
  );

  const hydrateTab = useCallback(() => {
    if (!currentTab?.fieldDefinitions?.length) return;
    // if (!dynamicValues?.data?.length) return;
    if (!dynamicValues?.data) return;

    if (prefilledTabsRef.current[activeTabName]) return;
    const dyn = dynamicValues?.data || [];
    const isTableTab =
      sortedTabs.find((t) => t.tabName === activeTabName)?.tabTypeId === 2;

    if (isTableTab) {
      hydrateTableFields(dyn);
    } else {
      hydrateFlatFields(dyn);
    }

    prefilledTabsRef.current[activeTabName] = true;
  }, [
    dynamicValues?.data,
    currentTab?.fieldDefinitions,
    activeTabName,
    sortedTabs,
    hydrateFlatFields,
    hydrateTableFields,
  ]);

  useEffect(() => {
    prefilledTabsRef.current = {};

    fieldDefMapRef.current = {};
    originalSnapshotRef.current = {
      flat: {},
      tables: {},
    };
    changedTabsRef.current = new Set();
  }, [entityId]);

  useEffect(() => {
    hydrateTab();
  }, [hydrateTab]);

  /* ------------------ SAVE ------------------ */

  const deleteRowMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        method: "delete",
        apiPath: "/Utility/dynamicDelete",
        payload,
      }),
  });

  const saveDynamicFieldsMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: isMassUpdate
          ? "Utility/DynamicFieldsMassUpdate"
          : "Utility/dynamicFields",
        method: "post",
        payload,
      }),
  });

  const isDeleting = deleteRowMutation.isPending;

  const isSaving = saveDynamicFieldsMutation.isPending;

  const isSubmitting = isSaving || isDeleting;

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = useCallback(
    async (values) => {
      console.log("Submitting values:", values);

      if (isSubmitting || isSyncing) return;

      preserveActiveTabRef.current = {
        index: activeIndex,
        tabName: activeTabName,
      };

      const dynamicEntityData = [];

      const fieldDefs = fieldDefMapRef.current;

      const SKIP_FIELDS = ["Created", "Modified"];

      /* ---------------- FLAT FIELDS ---------------- */

      const originalFlat = originalSnapshotRef.current.flat;

      Object.keys(originalFlat).forEach((key) => {
        const def = fieldDefs[key];

        if (!def || def.readOnly || SKIP_FIELDS.includes(key)) {
          return;
        }

        const currentValue = values[key];

        const originalValue = originalFlat[key];

        const changed = isValueChanged(currentValue, originalValue);

        if (!changed) {
          return;
        }

        /**
         * IMPORTANT:
         *
         * Track the exact tab where this changed
         * field belongs.
         */
        if (def?.tabName) {
          changedTabsRef.current.add(def.tabName);
        }

        const value = transformValue(currentValue, def);

        if (value == null) return;

        dynamicEntityData.push({
          fieldDefinitionId: def.id,
          workFlowId: def?.workFlowId,
          value: String(value),
          rowIndex: isMassUpdate ? 1 : def.rowIndex === 0 ? null : def.rowIndex,
          rowNo: 1,
          ...(!isMassUpdate && {
            entityId,
          }),
        });
      });

      /* ---------------- TABLE FIELDS ---------------- */

      const currentTables = values?.tableRows || {};

      const deleteRows = [];

      Object.entries(currentTables).forEach(([tableName, rows]) => {
        const originalRows =
          originalSnapshotRef.current.tables[tableName] || [];

        rows.forEach((row) => {
          if (row.__isDeleted) {
            /**
             * Deleted row = table changed.
             */
            changedTabsRef.current.add(tableName);

            deleteRows.push({
              tabId:
                sortedTabs.find((t) => t.tabName === tableName)?.tabId ?? 0,
              rowIndex: row.__rowId ?? 0,
              workFlowId: row?.workFlowId,
            });

            return;
          }

          const originalRow =
            originalRows.find((r) => r.__rowId === row.__rowId) || {};

          Object.entries(row).forEach(([fieldKey, value]) => {
            if (fieldKey.startsWith("__") || SKIP_FIELDS.includes(fieldKey)) {
              return;
            }

            const mapKey = `${tableName}.${fieldKey}`;

            const def = fieldDefs[mapKey];

            if (!def) return;

            const originalValue = originalRow[fieldKey];

            /**
             * No actual field change.
             */
            if (!isValueChanged(value, originalValue)) {
              return;
            }

            /**
             * tableName is the tab name.
             */
            changedTabsRef.current.add(tableName);

            const finalValue = transformValue(value, def);

            dynamicEntityData.push({
              fieldDefinitionId: def.id,
              workFlowId: def?.workFlowId,
              value: finalValue ?? "",
              rowIndex: row?.__isNew ? null : row?.__rowId,
              rowNo: row?.__rowId,
              ...(!isMassUpdate && {
                entityId,
              }),
            });
          });
        });
      });

      console.log(
        "Changed tabs before save:",
        Array.from(changedTabsRef.current),
      );

      const changedFieldIds = [
        ...new Set(
          dynamicEntityData
            .map((item) => Number(item.fieldDefinitionId))
            .filter(Boolean),
        ),
      ];

      try {
        const promises = [];

        if (deleteRows.length) {
          promises.push(
            deleteRowMutation.mutateAsync({
              entityId,
              entityCodeId,
              deleteRow: deleteRows,
            }),
          );
        }

        if (dynamicEntityData.length) {
          const payload = isMassUpdate
            ? {
                moduleId,
                entityCodeId,
                entityIds: selectedMassIds,
                dynamicEntityData,
                shouldAppend: false,
              }
            : {
                entityId,
                entityCodeId,
                dynamicEntityData,
                shouldAppend: false,
              };

          promises.push(saveDynamicFieldsMutation.mutateAsync(payload));
        }

        /**
         * =====================================================
         * NO CHANGES
         * =====================================================
         *
         * IMPORTANT:
         *
         * DO NOT:
         * - add active tab
         * - call syncAfterMutation
         * - call FieldDefinition API
         * - call Case/dynamic API
         *
         * Just show the message and return.
         */
        if (!promises.length) {
          changedTabsRef.current.clear();

          toast.info("No changes found");

          return;
        }

        /**
         * =====================================================
         * REAL SAVE / DELETE
         * =====================================================
         */
        await Promise.all(promises);

        /**
         * The submit tab is added ONLY AFTER a real
         * save/delete operation happened.
         *
         * Example:
         *
         * Tab 2 changed
         * Tab 3 submitted
         *
         * changedTabsRef:
         * Set { "Tab 2", "Tab 3" }
         */
        if (activeTabName) {
          changedTabsRef.current.add(activeTabName);
        }

        console.log(
          "Tabs to sync after successful save:",
          Array.from(changedTabsRef.current),
        );

        /**
         * INVALIDATE CASE OVERVIEW ONLY IF
         * AN OVERVIEW FIELD CHANGED.
         */
        await invalidateCaseOverviewIfNeeded({
          queryClient,
          entityId,
          changedFieldIds,
        });

        /**
         * Sync ONLY:
         *
         * - tabs with changed data
         * - submit tab
         */
        await syncAfterMutation("Changes saved successfully");
      } catch (e) {
        /**
         * Do not clear changedTabsRef here.
         *
         * This allows retrying the operation.
         */
        toast.error(e);
        console.error("Submit failed", e);
      }
    },
    [
      entityId,
      isSubmitting,
      saveDynamicFieldsMutation,
      deleteRowMutation,
      entityCodeId,
      syncAfterMutation,
      sortedTabs,
      isMassUpdate,
      moduleId,
      selectedMassIds,
      activeIndex,
      activeTabName,
      isSyncing,
      queryClient,
    ],
  );

  /* ------------------ SELECTED TAB EFFECT ------------------ */
  useEffect(() => {
    if (!sortedTabs.length) return;

    if (previousSelectedTabRef.current === (selectedTab?.tabName ?? null)) {
      return;
    }

    previousSelectedTabRef.current = selectedTab?.tabName ?? null;

    if (preserveActiveTabRef.current?.tabName) {
      const index = sortedTabs.findIndex(
        (tab) => tab.tabName === preserveActiveTabRef.current.tabName,
      );

      if (index !== -1) {
        setActiveIndex(index);
        return;
      }
    }

    if (selectedTab?.tabName) {
      const index = sortedTabs.findIndex(
        (tab) => tab.tabName === selectedTab.tabName,
      );
      setActiveIndex(index !== -1 ? index : 0);
    } else {
      setActiveIndex(0);
    }
  }, [selectedTab?.tabName, setActiveIndex, sortedTabs]);

  const getOriginalFlatForTab = useCallback(() => {
    if (!currentTab?.fieldDefinitions?.length) {
      return {};
    }

    const map = {};

    const originalFlat = originalSnapshotRef.current?.flat || {};

    currentTab.fieldDefinitions.forEach((def) => {
      const key = getFieldKey(def.name);
      const value = originalFlat[key];

      if (value !== undefined) {
        map[key] = structuredClone(value);
      }
    });

    return map;
  }, [currentTab?.fieldDefinitions]);

  const originalValues = getOriginalFlatForTab();

  if (isError) return <p>Error loading tabs</p>;
  const isTabLoading =
    activeIndex !== -1 && (isFieldLoading || isDynamicLoading);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        isSubmitting || isSyncing ? "pointer-events-none opacity-70" : ""
      }
    >
      <div className="card grid overflow-hidden">
        {!isMassUpdate && (
          <TabSidebar
            entityId={entityId}
            setStep={setStep}
            entityCode={entityCode}
            entityCodeId={entityCodeId}
            moduleId={moduleId}
            data={designType === "tabs-hybrid-contacts" ? data : null}
            designType={designType}
          />
        )}
        <div className={`min-w-0 w-full flex flex-col`}>
          {sortedTabs.length > 1 ? (
            <TabView
              className="tabsform"
              scrollable
              activeIndex={activeIndex === -1 ? 0 : activeIndex}
              onTabChange={(e) => setActiveIndex(e.index)}
            >
              {sortedTabs.map((tab, index) => {
                const isActive = tab.tabName === activeTabName;
                const tabData = isActive ? currentTab : undefined;

                return (
                  <TabPanel key={index} header={tab.tabName}>
                    <div className="h-[64vh] p-3 overflow-y-auto overflow-x-hidden min-w-0">
                      {tab.tabTypeId === 2 ? (
                        <TabTable
                          fields={tabData?.fieldDefinitions || []}
                          validation={tabData?.validationData || []}
                          relation={tabData?.relationData || []}
                          control={control}
                          tabName={tab.tabName}
                          isLoading={!tabData || isTabLoading}
                          entityId={entityId}
                          handleSubmit={handleSubmit}
                          clearErrors={clearErrors}
                          onModeChange={setIsRowEditing}
                          formMethods={{ setValue, getValues }}
                          isMassUpdate={isMassUpdate}
                          isImport={tab?.isImport}
                          importPayload={{
                            moduleId,
                            entityCodeId,
                            entityId,
                            workFlowId: tab?.workFlowId,
                            tabName: tab?.tabName,
                            isImport: true,
                          }}
                        />
                      ) : (
                        <SingleFields
                          fields={tabData?.fieldDefinitions || []}
                          validation={
                            isMassUpdate
                              ? tabData?.validationData
                              : tabData?.validationData || []
                          }
                          dependentFields={tabData?.fieldDefinitions || []}
                          relation={tabData?.relationData || []}
                          isLoading={!tabData || isTabLoading}
                          control={control}
                          entityId={entityId}
                          originalValues={originalValues}
                          formMethods={{ setValue, getValues }}
                          isMassUpdate={isMassUpdate}
                          isImport={tab?.isImport}
                          importPayload={{
                            moduleId,
                            entityCodeId,
                            entityId,
                            workFlowId: tab?.workFlowId,
                            tabName: tab?.tabName,
                            isImport: true,
                          }}
                        />
                      )}
                    </div>
                  </TabPanel>
                );
              })}
            </TabView>
          ) : (
            <div className="h-[64vh] p-3 overflow-y-auto overflow-x-hidden min-w-0">
              {sortedTabs?.[0]?.tabTypeId === 2 ? (
                <TabTable
                  fields={currentTab?.fieldDefinitions || []}
                  validation={currentTab?.validationData || []}
                  relation={currentTab?.relationData || []}
                  control={control}
                  tabName={sortedTabs[0]?.tabName}
                  isLoading={isTabLoading}
                  entityId={entityId}
                  handleSubmit={handleSubmit}
                  clearErrors={clearErrors}
                  onModeChange={setIsRowEditing}
                  formMethods={{ setValue, getValues }}
                  isMassUpdate={isMassUpdate}
                  isImport={sortedTabs?.[0]?.isImport}
                  importPayload={{
                    moduleId,
                    entityCodeId,
                    entityId,
                    workFlowId: currentTab?.workFlowId,
                    tabName: currentTab?.tabName,
                    isImport: true,
                  }}
                />
              ) : (
                <SingleFields
                  fields={currentTab?.fieldDefinitions || []}
                  validation={currentTab?.validationData || []}
                  relation={currentTab?.relationData || []}
                  isLoading={isTabLoading}
                  control={control}
                  entityId={entityId}
                  originalValues={originalValues}
                  formMethods={{ setValue, getValues }}
                  dependentFields={currentTab?.fieldDefinitions || []}
                  isMassUpdate={isMassUpdate}
                  isImport={sortedTabs?.[0]?.isImport}
                  importPayload={{
                    moduleId,
                    entityCodeId,
                    entityId,
                    workFlowId: currentTab?.workFlowId,
                    tabName: currentTab?.tabName,
                    isImport: true,
                  }}
                />
              )}
            </div>
          )}
          <div className="border-t-[0.5px] border-(--border-inverse) flex justify-end gap-2 py-2 px-3">
            {activeIndex > 0 && (
              <CustomButton
                label="Previous"
                type="button"
                className="outlineBtn"
                onClick={goPrevTab}
                disabled={isSubmitting || isSyncing || isRowEditing}
              />
            )}
            {/* NEXT BUTTON */}
            {activeIndex < sortedTabs.length - 1 && (
              <CustomButton
                label="Next"
                type="button"
                className="outlineBtn"
                onClick={goNextTab}
                disabled={isSubmitting || isSyncing || isRowEditing}
              />
            )}
            <CustomButton
              className="saveBtn"
              label={
                isSubmitting ? "Saving..." : isSyncing ? "Syncing..." : "Submit"
              }
              type="submit"
              disabled={isSubmitting || isSyncing || isRowEditing}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default memo(TabsForm);
