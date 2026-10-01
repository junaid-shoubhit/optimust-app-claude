import { memo, useEffect, useMemo } from "react";
import classNames from "classnames";

import SingleMapFields from "./SingleMapFields/SingleMapFields";
import WorkflowFields from "./MultiFields/WorkflowFields";
import RelationFieldsTab from "./RelationFieldsTab/RelationFieldsTab";

import { groupByTab } from "./noTabsFormUtils";
import { useTabScrollNav } from "./hooks/useTabScrollNav";
import { useMultiFieldsDefaults } from "./hooks/useMultifieldsdefaults";

const NoTabsFieldsRenderer = ({
  fieldData,
  control,
  formMethods,
  colSize,
  entityId = 0,
  entityCodeId,
  moduleId,
  onColSizeChange,
  fieldDefinitionsRef,
  dependentFields,
  designType,
  hideParentFields,
}) => {
  const { setValue, getValues } = formMethods;

  const tabs = useMemo(
    () =>
      groupByTab(
        fieldData?.fieldDefinitions || [],
        fieldData?.multipleFieldDefinitions || [],
      ),
    [fieldData],
  );

  const allFields = useMemo(
    () => [
      ...(fieldData?.fieldDefinitions || []),
      ...(fieldData?.multipleFieldDefinitions || []),
    ],
    [fieldData],
  );

  useMultiFieldsDefaults(tabs, getValues, setValue);

  const { scrollContainerRef, registerSectionRef, scrollToTab, activeTab } =
    useTabScrollNav(tabs);

  const calculatedColSize = useMemo(() => {
    const length =
      (fieldData?.fieldDefinitions?.length || 0) +
      (fieldData?.multipleFieldDefinitions?.length || 0);

    return Math.min(3, Math.max(1, Math.ceil(length / 5)));
  }, [fieldData]);

  useEffect(() => {
    if (!onColSizeChange) return;

    onColSizeChange(calculatedColSize);
  }, [calculatedColSize, onColSizeChange]);

  useEffect(() => {
    if (!fieldDefinitionsRef) return;

    const singleFields = fieldData?.fieldDefinitions || [];
    const multipleFields = fieldData?.multipleFieldDefinitions || [];

    const existingSingle = fieldDefinitionsRef.current?.fieldDefinitions || [];

    const existingMultiple =
      fieldDefinitionsRef.current?.multipleFieldDefinitions || [];

    fieldDefinitionsRef.current = {
      fieldDefinitions: [
        ...existingSingle,
        ...singleFields.filter(
          (field) =>
            !existingSingle.some((existing) => existing.id === field.id),
        ),
      ],

      multipleFieldDefinitions: [
        ...existingMultiple,
        ...multipleFields.filter(
          (field) =>
            !existingMultiple.some((existing) => existing.id === field.id),
        ),
      ],
    };
  }, [fieldData, fieldDefinitionsRef]);

  return (
    <>
      {tabs.length > 1 && (
        <div className="sticky top-0 z-10 mb-1 border-b bg-white">
          <div className="flex w-full gap-2 overflow-x-auto whitespace-nowrap px-2 py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.tabName}
                type="button"
                onClick={() => scrollToTab(tab.tabName)}
                className={classNames(
                  "shrink-0 rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors",
                  activeTab === tab.tabName
                    ? "bg-(--background-hover) text-[#D4183D]"
                    : "text-(--foreground-dark) hover:bg-(--background-hover)",
                )}
              >
                {tab.tabName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto flex flex-col gap-1 p-2 scrollbar-thin scrollbar-thumb-(--border-inverse) scrollbar-track-(--background-hover) scrollbar-thumb-rounded-md"
      >
        {!hideParentFields &&
          tabs.map((tab) => (
            <div
              key={tab.tabName}
              ref={registerSectionRef(tab.tabName)}
              className="my-1 bg-(--background-hover) p-2 rounded-md"
            >
              <div className="flex gap-1 items-center">
                <span className="h-3 border-2 border-[#D4183D] rounded-xs" />

                <p className="tracking-wider text-[11px] uppercase font-bold text-(--foreground-dark)">
                  {tab.tabName}
                </p>
              </div>

              {tab.singleFields.length > 0 && (
                <SingleMapFields
                  workflow={{
                    workFlowId: tab.singleFields[0].workFlowId,
                    workFlowName: tab.tabName,
                    fields: tab.singleFields,
                  }}
                  fields={tab.singleFields}
                  allFields={allFields}
                  parentDependentFields={dependentFields}
                  colSize={colSize}
                  validation={fieldData?.validationData || []}
                  relation={fieldData?.relationData || []}
                  control={control}
                  entityId={entityId}
                  formMethods={formMethods}
                  moduleId={moduleId}
                />
              )}

              {tab.workflows.map((workflow) => (
                <WorkflowFields
                  key={workflow.workFlowId}
                  workflow={workflow}
                  control={control}
                  colSize={colSize}
                  entityId={entityId}
                  formMethods={formMethods}
                  validation={fieldData?.validationData || []}
                  relation={fieldData?.relationData || []}
                  allFields={allFields}
                />
              ))}
            </div>
          ))}

        <RelationFieldsTab
          fields={allFields}
          validation={fieldData?.validationData || []}
          relation={fieldData?.relationData || []}
          control={control}
          entityCodeId={entityCodeId}
          moduleId={moduleId}
          entityId={entityId}
          colSize={colSize}
          formMethods={formMethods}
          onColSizeChange={onColSizeChange}
          fieldDefinitionsRef={fieldDefinitionsRef}
          designType={designType}
        />
      </div>
    </>
  );
};

export default memo(NoTabsFieldsRenderer);
