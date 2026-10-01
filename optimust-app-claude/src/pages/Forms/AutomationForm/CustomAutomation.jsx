import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import SelectField from "../../../components/Forms/Select/Select";
import SingleFields from "../../../components/TabsForm/SingleFields/SingleFields";
import WorkflowFields from "../../../components/NoTabsForm/MultiFields/WorkflowFields";
import { NoTabSkeleton } from "../../../components/NoTabsForm/NoTabSkeleton";
import {
  useNoTabDynamicValues,
  useNoTabFields,
} from "../../../components/NoTabsForm/hooks/useNoTabFormData";

const AUTOMATION_ENTITY_CODE_ID = 15;

const CustomAutomation = ({
  fieldMeta,
  formMethods,
  payload,
  control,
  effects,
  moduleId,
}) => {
  const selectedAutomationId = Number(fieldMeta?.value?.value);
  const registryKey = fieldMeta.name;

  const namespace = useMemo(
    () => `automation__${registryKey.replace(/[.[\]]/g, "_")}`,
    [registryKey],
  );

  // Call 1: field definitions, keyed on the automation itself
  const { data: fieldData, isSuccess: isFieldReady } = useNoTabFields(
    {
      entityId: selectedAutomationId,
      entityCodeId: AUTOMATION_ENTITY_CODE_ID,
      tabName: "Tab",
    },
    { enabled: !!selectedAutomationId },
  );

  // Call 2: dynamic values, keyed on the parent record — only fires once
  // fieldData (call 1) has resolved with definitions to hydrate against.
  // contextId keeps the cache entry unique per selected automation, since
  // fieldMeta?.entityId alone doesn't change when the automation does.
  const { data: dynamicValues, isSuccess: isDynamicReady } =
    useNoTabDynamicValues(
      {
        entityId: fieldMeta?.entityId,
        entityCodeId: AUTOMATION_ENTITY_CODE_ID,
        tabName: fieldMeta?.value?.label,
        contextId: selectedAutomationId,
        workFlowId: fieldData?.multipleFieldDefinitions?.length
          ? fieldData?.multipleFieldDefinitions?.[0]?.workFlowId
          : fieldData?.fieldDefinitions?.[0]?.workFlowId,
        moduleId,
      },
      fieldData,
      { enabled: !!fieldMeta?.entityId },
    );
  // Whether call 2 is even expected to run for the current fieldData.
  // Needed so we don't block forever on a query that's intentionally disabled
  // (e.g. no fieldDefinitions yet, or no parent entityId).
  const dynamicShouldRun = Boolean(
    fieldMeta?.entityId && fieldData?.fieldDefinitions?.length,
  );

  const isReady = isFieldReady && (!dynamicShouldRun || isDynamicReady);

  const allFields = useMemo(
    () => [
      ...(fieldData?.fieldDefinitions || []),
      ...(fieldData?.multipleFieldDefinitions || []),
    ],
    [fieldData],
  );

  const registerAutomationFields = useCallback(
    (key, payload) => {
      if (payload === null) {
        delete formMethods?.automationFieldsRef.current[key];
      } else {
        formMethods.automationFieldsRef.current[key] = payload;
      }
    },
    [formMethods.automationFieldsRef],
  );

  useEffect(() => {
    if (!selectedAutomationId || !fieldData?.fieldDefinitions) {
      registerAutomationFields?.(registryKey, null);
      return;
    }

    registerAutomationFields?.(registryKey, {
      entityId: selectedAutomationId,
      entityCodeId: AUTOMATION_ENTITY_CODE_ID,
      namespace,
      fieldDefinitions: fieldData.fieldDefinitions,
      multipleFieldDefinitions: fieldData.multipleFieldDefinitions || [],
      dynamicValues,
    });

    return () => registerAutomationFields?.(registryKey, null);
  }, [
    selectedAutomationId,
    fieldData,
    formMethods,
    registryKey,
    namespace,
    dynamicValues,
    registerAutomationFields,
  ]);

  const hydratedAutomationRef = useRef(null);

  useEffect(() => {
    if (!selectedAutomationId) {
      hydratedAutomationRef.current = null;
      return;
    }
    if (!isDynamicReady || !dynamicValues) return;
    if (hydratedAutomationRef.current === selectedAutomationId) return; // already hydrated — don't stomp live edits
    hydratedAutomationRef.current = selectedAutomationId;

    Object.entries(dynamicValues.singleFields || {}).forEach(([key, value]) => {
      formMethods.setValue(key, value, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });

    Object.entries(dynamicValues.multiFields || {}).forEach(
      ([workflowId, rows]) => {
        formMethods.setValue(`multiFields.${namespace}__${workflowId}`, rows, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      },
    );
  }, [
    selectedAutomationId,
    dynamicValues,
    isDynamicReady,
    formMethods,
    namespace,
  ]);

  return (
    <>
      <SelectField
        {...fieldMeta}
        payload={payload}
        disabled={effects?.disabled}
        isRelation={
          effects?.isRelationChild || fieldMeta?.is_overwrite_dropdown
        }
      />

      {fieldMeta?.value?.value && !isReady ? (
        <div className="col-span-3">
          <NoTabSkeleton colSize={3} />
        </div>
      ) : (
        <div className="col-span-3 flex flex-col gap-2">
          <SingleFields
            colSize={3}
            fields={fieldData?.fieldDefinitions || []}
            validation={fieldData?.validationData}
            relation={fieldData?.relationData}
            control={control}
            entityId={selectedAutomationId}
            dependentFields={[fieldMeta]}
            formMethods={formMethods}
          />

          {(fieldData?.multipleFieldDefinitions || []).length > 0 &&
            Object.entries(
              (fieldData.multipleFieldDefinitions || []).reduce((acc, f) => {
                (acc[f.workFlowId] ||= []).push(f);
                return acc;
              }, {}),
            ).map(([workFlowId, wfFields]) => (
              <WorkflowFields
                key={workFlowId}
                workflow={{
                  workFlowId: `${namespace}__${workFlowId}`,
                  fields: wfFields,
                }}
                control={control}
                colSize={3}
                entityId={selectedAutomationId}
                formMethods={formMethods}
                validation={fieldData?.validationData}
                relation={fieldData?.relationData}
                allFields={[...allFields, fieldMeta]}
              />
            ))}
        </div>
      )}
    </>
  );
};

export default memo(CustomAutomation);
