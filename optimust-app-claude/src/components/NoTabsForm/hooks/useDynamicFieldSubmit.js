import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../../services/apiBinding";
import { buildExistingMap, processFieldsOptimized } from "../noTabsFormUtils";

const buildAutomationPayload = ({
  automationFieldsRef,
  values,
  designType,
  entityId,
  deleteRows,
}) => {
  // Don't process if no ref or nothing is registered
  if (
    !automationFieldsRef?.current ||
    Object.keys(automationFieldsRef.current).length === 0
  ) {
    return [];
  }

  const automationEntries = Object.values(automationFieldsRef?.current || {});

  return automationEntries.flatMap((entry) => {
    const automationExistingMap = buildExistingMap(
      entry.dynamicValues?.data || [],
      designType,
    );

    // Single fields
    const singles = processFieldsOptimized({
      definitions: entry.fieldDefinitions,
      values,
      existingMap: automationExistingMap,
      entityId,
      designType,
    });

    // Group workflow fields
    const workflowGroups = (entry.multipleFieldDefinitions || []).reduce(
      (acc, field) => {
        (acc[field.workFlowId] ||= []).push(field);
        return acc;
      },
      {},
    );

    // Multi fields
    const multis = Object.entries(workflowGroups).flatMap(([wfId, defs]) => {
      const namespacedKey = `${entry.namespace}__${wfId}`;
      const rows = values.multiFields?.[namespacedKey] || [];

      const activeRows = [];

      rows.forEach((row) => {
        if (row.__isDeleted) {
          deleteRows.push({
            workFlowId: Number(wfId),
            rowIndex: row.rowIndex,
            tabId: defs[0]?.tabId ?? 0,
          });
          return;
        }

        activeRows.push(row);
      });

      return processFieldsOptimized({
        definitions: defs,
        values: activeRows,
        existingMap: automationExistingMap,
        entityId,
        isMulti: true,
        designType,
      });
    });

    return [...singles, ...multis].map((item) => ({
      ...item,
      entityCodeId: entry.entityCodeId,
    }));
  });
};

/**
 * Owns the two dynamic-field mutations (save + delete) and the submit
 * handler that builds their payloads from form values. NoTabsForm stays
 * unaware of API shape entirely.
 */
export const useDynamicFieldSubmit = ({
  fieldData,
  dynamicValues,
  entityId,
  entityParentId,
  entityCodeId,
  rowIndex,
  designType,
  queryKeys,
  tabQueryKey,
  handleClose,
  setEntityId,
  setStep,
  automationFieldsRef,
  fieldDefinitionsRef,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({ apiPath: "Utility/dynamicFields", method: "post", payload }),
    onSuccess: async (res) => {
      const newId = res?.entityId || entityId;
      if (
        designType === "tabs-nested-dynamic" ||
        designType.includes("contacts")
      ) {
        if (handleClose && newId && !entityId) {
          handleClose(newId);
        } else if (newId && !entityId) {
          navigate(`/overview?id=${newId}`, { replace: true });
        } else {
          handleClose();
        }
      } else if (designType === "no-tabs" || designType === "no-tabs-card") {
        handleClose();
      } else if (designType === "tabs-dynamic-edit") {
        if (!entityId) {
          searchParams.set("id", newId);
          navigate(
            {
              search: searchParams.toString(),
            },
            { replace: true },
          );
        }
        // no-op: edit flow handled elsewhere
      } else {
        setEntityId(newId);
        if (!entityId) setStep(2);
        else handleClose();
      }
    },
    onError: (err) => {
      toast.error(err?.message || "Something went wrong");
    },
  });

  const deleteRowMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        method: "delete",
        apiPath: "/Utility/dynamicDelete",
        payload,
      }),
  });

  const onSubmit = async (values) => {
    const existingMap = buildExistingMap(dynamicValues?.data || [], designType);
    const deleteRows = [];
    const meta = {
      isTabDataInvalidate: false,
    };
    const submitFieldData = fieldDefinitionsRef?.current || fieldData;

    const singleFieldPayload = processFieldsOptimized({
      definitions: submitFieldData?.fieldDefinitions || [],
      values,
      existingMap,
      entityId,
      rowIndex,
      designType,
      meta,
    });

    const multiFieldPayload = Object.entries(values.multiFields || {}).flatMap(
      ([wfId, rows]) => {
        if (wfId.startsWith("automation__")) return [];
        const activeRows = [];

        rows.forEach((row) => {
          if (row.__isDeleted) {
            deleteRows.push({
              workFlowId: Number(wfId),
              rowIndex: row.rowIndex,
              tabId:
                submitFieldData?.multipleFieldDefinitions?.find(
                  (x) => String(x.workFlowId) === String(wfId),
                )?.tabId ?? 0,
            });
            return;
          }
          activeRows.push(row);
        });

        return processFieldsOptimized({
          definitions: (submitFieldData?.multipleFieldDefinitions || []).filter(
            (f) => String(f.workFlowId) === String(wfId),
          ),
          values: activeRows,
          existingMap,
          entityId,
          isMulti: true,
          designType,
        });
      },
    );

    const automationPayload = automationFieldsRef?.current
      ? buildAutomationPayload({
          automationFieldsRef,
          values,
          designType,
          entityId,
          deleteRows,
        })
      : [];

    const payloadData = [
      ...singleFieldPayload,
      ...multiFieldPayload,
      ...automationPayload,
    ];

    if (!payloadData.length && !deleteRows.length) {
      toast.info("No changes found");
      return;
    }

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

      if (payloadData.length) {
        promises.push(
          saveMutation.mutateAsync({
            entityParentId: entityParentId || null,
            entityCodeId,
            dynamicEntityData: payloadData,
            shouldAppend: false,
          }),
        );
      }

      await Promise.all(promises);

      toast.success("Saved successfully");
      if (meta.isTabDataInvalidate && tabQueryKey?.length) {
        await queryClient.invalidateQueries({
          queryKey: tabQueryKey,
        });
      }
      if (queryKeys)
        await Promise.all(
          Object?.values(queryKeys)
            .filter(Boolean)
            .map((queryKey) =>
              queryClient.invalidateQueries({
                queryKey,
              }),
            ),
        );
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return {
    onSubmit,
    isSaving: saveMutation.isPending || deleteRowMutation.isPending,
  };
};
