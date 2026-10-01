import { memo, useCallback, useEffect } from "react";
import { useTableFields } from "./useTableFields";
import TableFields from "./TableFields";
import TableList from "./TableList";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import { AlertCircle } from "lucide-react";

const TabTable = (props) => {
  const {
    fields,
    validation,
    relation,
    control,
    formMethods,
    tabName,
    isLoading,
    // caseId,
    entityId,
    handleSubmit,
    clearErrors,
    onModeChange,
    isMassUpdate,
    isImport,
    importPayload,
  } = props;

  const table = useTableFields({
    fields,
    tabName,
    control,
    formMethods,
  });
  const controller = useCallback(
    (name, renderFn) => ({
      name,
      control,
      render: ({ field }) => renderFn(field),
    }),
    [control],
  );

  useEffect(() => {
    onModeChange?.(table.mode !== "list");
    return () => onModeChange?.(false); // reset if this tab unmounts mid-edit
  }, [table.mode, onModeChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-between w-full h-full">
      {table.mode !== "list" ? (
        <>
          <div>
            <div className="flex gap-2 justify-end mb-3 px-3 sticky top-0 bg-white z-50">
              <CustomButton
                label="Cancel"
                type="button"
                className="outlineBtn"
                onClick={() => {
                  formMethods?.setValue(`draftRows.${tabName}`, {});
                  clearErrors(`draftRows.${tabName}`);
                  table?.setMode("list");
                  table?.setEditingIndex(null);
                }}
              />
              <CustomButton
                label="Save"
                type="button"
                className="saveBtn"
                onClick={handleSubmit(table?.saveRow)}
              />
            </div>
            <TableFields
              // {...table}
              mode={table?.mode}
              formFields={table?.formFields}
              tabName={tabName}
              control={control}
              controller={controller}
              // caseId={caseId}
              entityId={entityId}
              validation={validation}
              relation={relation}
              formMethods={formMethods}
              isMassUpdate={isMassUpdate}
              isImport={isImport}
              importPayload={importPayload}
            />
          </div>
          <div className="sticky -bottom-2 ml-auto w-fit flex items-center gap-2 px-2 py-1 bg-red-50 border border-red-200 rounded-md text-red-700 font-medium shadow-sm z-50">
            <AlertCircle size={12} />
            <span className="text-[10px]">
              Please save your changes at top before submitting.
            </span>
          </div>
        </>
      ) : (
        <TableList {...table} fields={fields} />
      )}
    </div>
  );
};

export default memo(TabTable);
