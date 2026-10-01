import { useEffect, useRef } from "react";

/**
 * Seeds a default first row (rowIndex: 1) for every workflow's multiField
 * array if it doesn't already have data. Runs exactly once per mount,
 * after tabs are resolved.
 */
export const useMultiFieldsDefaults = (tabs, getValues, setValue) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!tabs.length || initialized.current) return;

    tabs.forEach((tab) => {
      tab.workflows?.forEach((workflow) => {
        const path = `multiFields.${workflow.workFlowId}`;
        const existing = getValues(path);

        if (!existing || existing.length === 0) {
          setValue(path, [{ rowIndex: 1 }]);
        }
      });
    });

    initialized.current = true;
  }, [tabs, getValues, setValue]);
};
