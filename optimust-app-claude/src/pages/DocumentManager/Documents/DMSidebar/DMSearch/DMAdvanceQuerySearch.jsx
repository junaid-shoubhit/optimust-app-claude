import { useRef, useMemo, useCallback } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import SelectField from "../../../../../components/Forms/Select/Select";
import Input from "../../../../../components/Forms/Input/Input";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../../../services/apiBinding";
import { InputTextarea } from "primereact/inputtextarea";
import DateInput from "../../../../../components/Forms/Date/Date";
import { buildQueryString } from "../../../../../utils/constant";

/* ============================================================
   1️⃣ — Helper Functions (Optimized)
   ============================================================ */

const nodeUpdater = {
  update(nodes, id, change) {
    return nodes.map((node) => {
      if (node.id === id) {
        const next = { ...node, ...change };

        // handle BETWEEN operator transitions
        const isEnteringBetween = change.operatorType === "betweentextbox";
        const isLeavingBetween =
          node.operatorType === "betweentextbox" &&
          change.operatorType !== "betweentextbox";

        if (isEnteringBetween && typeof node.value !== "object") {
          next.value = { from: "", to: "" };
        }

        if (isLeavingBetween) {
          next.value = "";
        }

        // merge BETWEEN values rather than overwrite
        if (node.operatorType === "betweentextbox" && change.value) {
          next.value = { ...node.value, ...change.value };
        }

        return next;
      }

      if (node.type === "group") {
        return {
          ...node,
          children: nodeUpdater.update(node.children, id, change),
        };
      }
      return node;
    });
  },

  addCondition(nodes, id) {
    return nodes.map((node) =>
      node.id === id && node.type === "group"
        ? {
            ...node,
            children: [
              ...node.children,
              {
                id: crypto.randomUUID(),
                type: "condition",
                field: "",
                operator: "",
                operatorType: "",
                value: "",
              },
            ],
          }
        : node.type === "group"
          ? { ...node, children: nodeUpdater.addCondition(node.children, id) }
          : node,
    );
  },

  addGroup(nodes, id) {
    return nodes.map((node) =>
      node.id === id && node.type === "group"
        ? {
            ...node,
            children: [
              ...node.children,
              {
                id: crypto.randomUUID(),
                type: "group",
                logic: "AND",
                children: [
                  {
                    id: crypto.randomUUID(),
                    type: "condition",
                    field: "",
                    operator: "",
                    operatorType: "",
                    value: "",
                  },
                ],
              },
            ],
          }
        : node.type === "group"
          ? { ...node, children: nodeUpdater.addGroup(node.children, id) }
          : node,
    );
  },

  remove(nodes, id) {
    return nodes
      .filter((n) => n.id !== id)
      .map((node) =>
        node.type === "group"
          ? { ...node, children: nodeUpdater.remove(node.children, id) }
          : node,
      );
  },
};

/* ============================================================
   2️⃣ — Main Component
   ============================================================ */

export default function DMAdvanceQuerySearch({
  searchDocuments,
  setVisible,
  query,
  setQuery,
  onSaveQuery,
  onSaveSummary,
}) {
  const opRefs = useRef({});

  /* ---------------------- Fetch Config ---------------------- */
  const { data: configData, isLoading } = useQuery({
    queryKey: ["qbSearchConfig"],
    queryFn: () =>
      apiRequest({
        apiPath: "Document/QbSearchConfiguraton_Get?SearchName=Document",
        apiClient: "dm",
      }),
    staleTime: 5 * 60 * 1000,
  });

  /* ---------------------- Memoized Fields ---------------------- */
  const fields = useMemo(
    () =>
      configData?.search_configuratonFiles?.map((f) => ({
        label: f.fieldName,
        value: f.fieldValue,
        type: f.fieldType,
      })) || [],
    [configData],
  );

  const operators = useMemo(() => {
    if (!configData) return {};
    return configData.search_configuratonOperators.reduce((acc, op) => {
      (acc[op.fieldType] = acc[op.fieldType] || []).push({
        label: op.operatorName,
        value: op.operatorValue,
        operatorType: op.operatorType,
        fieldType: op.fieldType,
      });
      return acc;
    }, {});
  }, [configData]);

  const createPayload = (dataTable, dataField = "name") => ({
    dataTable,
    dataField,
    searchTerm: "",
  });

  const createSelectPayload = (field) => {
    switch (field) {
      case "dcf.Status":
        return createPayload("ctCaseStatuses");

      case "de.id":
        return createPayload("filetype");

      case "dd.created_by":
        return createPayload("usrUsers");

      case "dcf.MatterTypeId":
        return createPayload("ctMatterTypes");

      case "dd.default_folder_id":
        return createPayload("dmDefaultCaseFolders");

      default:
        return null;
    }
  };
  /* ============================================================
     3️⃣ — Node Handlers
     ============================================================ */

  const handleChange = useCallback(
    (id, change) => setQuery((prev) => nodeUpdater.update(prev, id, change)),
    [setQuery],
  );

  const handleAddCondition = useCallback(
    (id) => setQuery((prev) => nodeUpdater.addCondition(prev, id)),
    [setQuery],
  );

  const handleAddGroup = useCallback(
    (id) => setQuery((prev) => nodeUpdater.addGroup(prev, id)),
    [setQuery],
  );

  const handleRemove = useCallback(
    (id) => setQuery((prev) => nodeUpdater.remove(prev, id)),
    [setQuery],
  );

  /* ============================================================
     4️⃣ — Summary Builder
     ============================================================ */
  const buildSummary = useCallback((query) => {
    const parts = [];

    const walk = (nodes) => {
      for (const node of nodes) {
        if (node.type === "group") walk(node.children);
        if (node.type === "condition" && node.field && node.operator) {
          let val = node.value;

          if (typeof val === "object" && val?.from)
            val = `${val.from} → ${val.to}`;
          if (Array.isArray(val)) val = val.map((v) => v.label || v).join(", ");
          if (val?.label) val = val.label;

          parts.push({
            id: node.id,
            text: `${node.fieldName} ${node.operator.replace("#value", val)}`,
          });
        }
      }
    };

    walk(query);
    return parts;
  }, []);

  /* ============================================================
     5️⃣ — Submit Handler
     ============================================================ */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const finalQuery = buildQueryString(query);
      const summary = buildSummary(query);

      searchDocuments({ SearchParm: finalQuery });
      onSaveSummary(summary);
      onSaveQuery(finalQuery);
      setVisible(false);
    },
    [
      query,
      buildSummary,
      searchDocuments,
      onSaveSummary,
      onSaveQuery,
      setVisible,
    ],
  );

  /* ============================================================
     6️⃣ — Render Node Helper
     ============================================================ */

  const renderConditionInput = (node, fieldObj, selectedOp) => {
    const inputType =
      fieldObj?.type === "textarea"
        ? "textarea"
        : selectedOp?.operatorType || "textbox";

    const isBetween = inputType === "betweentextbox";

    if (isBetween) {
      const InputComp = fieldObj?.type === "date" ? DateInput : Input;
      const typeAttr = fieldObj?.type === "number" ? "number" : "text";

      return (
        <div className="grid gap-2">
          <InputComp
            type={typeAttr}
            placeholder="From"
            value={node.value?.from}
            onChange={(e) =>
              handleChange(node.id, {
                value: {
                  from: fieldObj?.type === "date" ? e.value : e.target.value,
                },
              })
            }
          />
          <InputComp
            type={typeAttr}
            placeholder="To"
            value={node.value?.to}
            onChange={(e) =>
              handleChange(node.id, {
                value: {
                  to: fieldObj?.type === "date" ? e.value : e.target.value,
                },
              })
            }
          />
        </div>
      );
    }

    if (["dropdown", "dropdowns"].includes(inputType)) {
      return (
        <SelectField
          isMulti={inputType === "dropdowns"}
          searchFromApi={false}
          placeholder="Select value"
          name={node.field}
          payload={createSelectPayload(node.field)}
          // loadOptionsFunction={selectLoaders[node.field]}
          value={node.value}
          onChange={(val) => handleChange(node.id, { value: val })}
        />
      );
    }

    if (inputType === "textarea") {
      return (
        <InputTextarea
          rows={3}
          value={node.value}
          placeholder="Enter comma separated values"
          onChange={(e) => handleChange(node.id, { value: e.target.value })}
        />
      );
    }

    if (inputType === "NA") {
      return <span className="text-gray-500 text-sm">No input required</span>;
    }

    if (fieldObj?.type === "date") {
      return (
        <DateInput
          value={node.value}
          onChange={(e) => handleChange(node.id, { value: e.value })}
        />
      );
    }

    return (
      <Input
        type={fieldObj?.type === "number" ? "number" : "text"}
        value={node.value}
        onChange={(e) => handleChange(node.id, { value: e.target.value })}
      />
    );
  };

  /* ============================================================
     7️⃣ — Recursive Render
     ============================================================ */

  const renderNode = useCallback(
    (nodes, level = 0) =>
      nodes.map((node, index) => {
        if (node.type === "group") {
          return (
            <div key={node.id} className="my-4 relative">
              {/* Logic Buttons & Group Actions */}
              <div className="flex items-center gap-3 mb-3">
                {/* Logic Selector */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  {["AND", "OR"].map((logic) => (
                    <button
                      key={logic}
                      type="button"
                      className={`px-4 py-1 text-sm ${
                        node.logic === logic
                          ? "bg-indigo-500 text-white"
                          : "bg-white text-gray-600 hover:bg-indigo-50"
                      }`}
                      onClick={() => handleChange(node.id, { logic })}
                    >
                      {logic}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                  <CustomButton
                    type="button"
                    text
                    icon="pi pi-plus"
                    className="!p-0 !w-fit"
                    onClick={(e) => opRefs.current[node.id].toggle(e)}
                  />

                  {level > 0 && (
                    <CustomButton
                      text
                      severity="danger"
                      icon="pi pi-trash"
                      className="!p-0 !w-fit"
                      onClick={() => handleRemove(node.id)}
                    />
                  )}
                </div>

                <OverlayPanel ref={(el) => (opRefs.current[node.id] = el)}>
                  <div className="flex flex-col gap-2 w-40">
                    <CustomButton
                      label="Add Condition"
                      icon="pi pi-filter"
                      outlined
                      onClick={() => {
                        handleAddCondition(node.id);
                        opRefs.current[node.id].hide();
                      }}
                    />

                    <CustomButton
                      label="Add Group"
                      icon="pi pi-sitemap"
                      outlined
                      onClick={() => {
                        handleAddGroup(node.id);
                        opRefs.current[node.id].hide();
                      }}
                    />
                  </div>
                </OverlayPanel>
              </div>

              {/* Children */}
              <div className="pl-3 border-l-2 border-gray-200">
                {renderNode(node.children, level + 1)}
              </div>
            </div>
          );
        }

        /* ------------ CONDITION NODE ------------ */
        const fieldObj = fields.find((f) => f.value === node.field);
        const ops = fieldObj ? operators[fieldObj.type] || [] : [];
        const selectedOp = ops.find((o) => o.value === node.operator);

        return (
          <div
            key={node.id}
            className="grid grid-cols-[minmax(180px,1fr)_minmax(80px,0.6fr)_minmax(200px,1.4fr)_auto]
                       gap-3 bg-white border border-gray-200 rounded-md px-3 py-3 mb-2 shadow-sm"
          >
            {/* Field */}
            <SelectField
              defaultOptions={fields}
              value={fieldObj}
              placeholder="Field"
              onChange={(opt) =>
                handleChange(node.id, {
                  field: opt?.value || "",
                  fieldName: opt?.label || "",
                  operator: "",
                  operatorType: "",
                  value: "",
                })
              }
            />

            {/* Operator */}
            {node.field && (
              <SelectField
                key={`operator-${node.id}`}
                defaultOptions={ops}
                value={selectedOp}
                placeholder="Operator"
                onChange={(opt) =>
                  handleChange(node.id, {
                    operator: opt?.value || "",
                    operatorType: opt?.operatorType || "",
                    value:
                      opt?.operatorType === "betweentextbox"
                        ? { from: "", to: "" }
                        : "",
                  })
                }
              />
            )}

            {/* Value Input */}
            {node.field && renderConditionInput(node, fieldObj, selectedOp)}

            {/* Remove Condition */}
            {level > 0 && index > 0 && (
              <div className="flex items-center justify-end">
                <CustomButton
                  type="button"
                  text
                  severity="danger"
                  icon="pi pi-trash"
                  className="!p-0 !w-fit"
                  onClick={() => handleRemove(node.id)}
                />
              </div>
            )}
          </div>
        );
      }),
    [
      fields,
      operators,
      createSelectPayload,
      handleChange,
      handleAddCondition,
      handleAddGroup,
      handleRemove,
    ],
  );

  /* ============================================================
     8️⃣ — Main Render
     ============================================================ */
  if (isLoading)
    return <div className="p-4 text-gray-500">Loading Query Builder...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-50 min-h-screen overflow-auto"
    >
      <h6>Document Advance Filter</h6>

      {renderNode(query)}

      <div className="mt-6 flex justify-end gap-3">
        <CustomButton
          type="button"
          label="Cancel"
          outlined
          onClick={() => setVisible(false)}
        />

        <CustomButton
          type="submit"
          label="Search"
          icon="pi pi-search"
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        />
      </div>
    </form>
  );
}
