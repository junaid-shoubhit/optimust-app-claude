import { useMemo, useState } from "react";
import KeyValueList from "./KeyValueList";

const normalizeKey = (key = "") => key.replace(/\s+/g, "_");

const EntityMultiList = ({
  fieldData = [],
  dynamicValues = {},
  isLoading,
  isError,
  errorMessage,
  columns = 12,
  variant = "grid",
}) => {
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);

  /* =========================================================
     GROUP FIELDS BY WORKFLOW ID
  ========================================================= */
  const workflowTabs = useMemo(() => {
    if (!fieldData?.length) return [];

    const grouped = new Map();

    fieldData.forEach((field) => {
      const workflowId = field?.workFlowId;

      if (workflowId == null) return;

      if (!grouped.has(workflowId)) {
        grouped.set(workflowId, {
          workflowId,
          workflowName:
            field?.workFlowName || field?.tabName || `Workflow ${workflowId}`,
          fields: [],
        });
      }

      grouped.get(workflowId).fields.push(field);
    });

    return Array.from(grouped.values());
  }, [fieldData]);

  /* =========================================================
     DEFAULT ACTIVE WORKFLOW
  ========================================================= */
  const selectedWorkflowId = useMemo(() => {
    if (!workflowTabs.length) return null;

    const exists = workflowTabs.some(
      (tab) => String(tab.workflowId) === String(activeWorkflowId),
    );

    return exists ? activeWorkflowId : workflowTabs[0].workflowId;
  }, [workflowTabs, activeWorkflowId]);

  /* =========================================================
     ACTIVE TAB
  ========================================================= */
  const activeTab = useMemo(() => {
    return workflowTabs.find(
      (tab) => String(tab.workflowId) === String(selectedWorkflowId),
    );
  }, [workflowTabs, selectedWorkflowId]);

  /* =========================================================
     ACTIVE TAB FIELD CONFIG
  ========================================================= */
  const fieldsConfig = useMemo(() => {
    if (!activeTab?.fields?.length) return [];

    return activeTab.fields.map((field) => ({
      id: field.id,
      label: field.name,
      key: normalizeKey(field.name),
    }));
  }, [activeTab]);

  /* =========================================================
     GET ROWS FOR ACTIVE WORKFLOW
  ========================================================= */
  const activeWorkflowValues = useMemo(() => {
    if (!dynamicValues || selectedWorkflowId == null) {
      return [];
    }

    return (
      dynamicValues[selectedWorkflowId] ||
      dynamicValues[String(selectedWorkflowId)] ||
      []
    );
  }, [dynamicValues, selectedWorkflowId]);

  /* =========================================================
     FORMAT ACTIVE WORKFLOW ROWS
  ========================================================= */
  const formattedRows = useMemo(() => {
    if (!activeWorkflowValues.length) {
      return [];
    }

    return activeWorkflowValues.map((row) => {
      const formatted = {};

      fieldsConfig.forEach(({ key }) => {
        const valueObj = row?.[key];

        formatted[key] =
          valueObj?.label ??
          valueObj?.value ??
          (typeof valueObj === "string" || typeof valueObj === "number"
            ? valueObj
            : "--");
      });

      return formatted;
    });
  }, [activeWorkflowValues, fieldsConfig]);

  /* =========================================================
     GRID CLASS
  ========================================================= */
  const gridClass = useMemo(() => {
    const map = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      6: "grid-cols-6",
      12: "grid-cols-12",
    };

    return map[columns] || "grid-cols-12";
  }, [columns]);

  /* =========================================================
     STATES
  ========================================================= */
  if (isLoading) {
    return <p className="text-sm">Loading...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        {errorMessage || "Failed to load data"}
      </p>
    );
  }

  if (!fieldData.length) {
    return <p className="text-sm text-gray-400">No data available</p>;
  }

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="w-full">
      {/* =====================================================
          WORKFLOW TABS
      ===================================================== */}
      <div className="border-b border-(--border-primary) bg-(--background-heading)">
        <div className="flex gap-2 overflow-x-auto">
          {workflowTabs.map((tab) => {
            const isActive =
              String(tab.workflowId) === String(selectedWorkflowId);

            return (
              <button
                key={tab.workflowId}
                type="button"
                onClick={() => setActiveWorkflowId(tab.workflowId)}
                className={`
            relative
            text-xs
            font-medium
            whitespace-nowrap
            px-2
            py-1
            border-b-2
            transition-all
            duration-200
            ease-out
            ${
              isActive
                ? `
                  bg-(--background-box)
                  border-(--border-secondary)
                  text-(--text-secondary)
                `
                : `
                  border-transparent
                  text-(--text-muted)
                  hover:bg-(--background-hover)
                  hover:text-(--text-primary)
                `
            }
          `}
              >
                {tab.workflowName}

                {isActive && (
                  <span
                    className="
                absolute
                bottom-[-2px]
                left-1/2
                h-0.5
                w-8
                -translate-x-1/2
                rounded-full
                bg-(--border-secondary)
              "
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          ACTIVE WORKFLOW DATA
      ===================================================== */}
      <div className="grid gap-2 pt-2 px-2">
        {formattedRows.length > 0 ? (
          formattedRows.map((row, index) => (
            <KeyValueList
              key={`${selectedWorkflowId}-${index}`}
              data={row}
              fields={fieldsConfig}
              columns={columns}
              variant={variant}
            />
          ))
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */
          <div className={`grid ${gridClass} gap-2`}>
            {fieldsConfig.map(({ label, id }) => (
              <div key={id} className="grid gap-1">
                <p className="text-(--color-fontFour) text-xs">{label}</p>

                <p className="text-(--color-fontFour) text-xs">--</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityMultiList;
