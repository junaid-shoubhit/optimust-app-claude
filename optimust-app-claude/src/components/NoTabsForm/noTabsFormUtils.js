import { transformValue } from "../TabsForm/tabConstant";
import { normalizeKey } from "./noTabConstant";

/* ---------------- GROUPING ---------------- */

// export const groupByTab = (singleFields = [], multipleFields = []) => {
//   console.log("singleFields tabs123", singleFields);
//   console.log("multipleFields tabs123", multipleFields);
//   const tabs = {};

//   const ensureTab = (tabName) => {
//     if (!tabs[tabName]) {
//       tabs[tabName] = { tabName, singleFields: [], workflows: [] };
//     }
//     return tabs[tabName];
//   };

//   singleFields.forEach((field) => {
//     const tabName = field.tabName?.trim() || "Default";
//     ensureTab(tabName).singleFields.push(field);
//   });

//   multipleFields.forEach((field) => {
//     const tabName = field.tabName?.trim() || "Default";
//     const tab = ensureTab(tabName);

//     let workflow = tab.workflows.find((x) => x.workFlowId === field.workFlowId);

//     if (!workflow) {
//       workflow = {
//         workFlowId: field.workFlowId,
//         workFlowName: field.workFlowName,
//         fields: [],
//       };
//       tab.workflows.push(workflow);
//     }

//     workflow.fields.push(field);
//   });

//   Object.values(tabs).forEach((tab) => {
//     tab.singleFields.sort(
//       (a, b) => Number(a.orderByExpression) - Number(b.orderByExpression),
//     );
//     tab.workflows.forEach((workflow) => {
//       workflow.fields.sort(
//         (a, b) => Number(a.orderByExpression) - Number(b.orderByExpression),
//       );
//     });
//   });

//   return Object.values(tabs);
// };

export const groupByTab = (singleFields = [], multipleFields = []) => {
  const tabs = {};

  const ensureTab = (tabName, tabOrder) => {
    if (!tabs[tabName]) {
      tabs[tabName] = {
        tabName,
        tabOrder: Number(tabOrder ?? 0),
        singleFields: [],
        workflows: [],
      };
    } else if (tabOrder != null) {
      // Update tabOrder if it was created earlier without one
      tabs[tabName].tabOrder = Number(tabOrder);
    }

    return tabs[tabName];
  };

  // Group single fields
  singleFields.forEach((field) => {
    const tabName = field.tabName?.trim() || "Default";
    const tab = ensureTab(tabName, field.tabOrder);

    tab.singleFields.push(field);
  });

  // Group multiple fields
  multipleFields.forEach((field) => {
    const tabName = field.tabName?.trim() || "Default";
    const tab = ensureTab(tabName, field.tabOrder);

    let workflow = tab.workflows.find(
      (workflow) => workflow.workFlowId === field.workFlowId,
    );

    if (!workflow) {
      workflow = {
        workFlowId: field.workFlowId,
        workFlowName: field.workFlowName,
        fields: [],
      };

      tab.workflows.push(workflow);
    }

    workflow.fields.push(field);
  });

  // Sort fields inside each tab
  Object.values(tabs).forEach((tab) => {
    tab.singleFields.sort(
      (a, b) =>
        Number(a.orderByExpression ?? 0) - Number(b.orderByExpression ?? 0),
    );

    tab.workflows.forEach((workflow) => {
      workflow.fields.sort(
        (a, b) =>
          Number(a.orderByExpression ?? 0) - Number(b.orderByExpression ?? 0),
      );
    });
  });

  // Sort tabs based on tabOrder
  return Object.values(tabs).sort(
    (a, b) => Number(a.tabOrder ?? 0) - Number(b.tabOrder ?? 0),
  );
};

/* ---------------- VALUE COMPARISON ---------------- */

export const isEqualValue = (oldValue, newValue, field) => {
  if (field.type === "date") return false;
  return String(oldValue ?? "") === String(newValue ?? "");
};

/* ---------------- EXISTING RECORD MAP ---------------- */

export const getFieldKey = ({
  definitionId,
  rowNo,
  workFlowId,
  tabTypeId,
  designType,
}) =>
  designType === "no-tabs-single-field" || Number(tabTypeId) === 1
    ? `${definitionId}_${rowNo}`
    : `${definitionId}_${rowNo}_${workFlowId}`;

export const buildExistingMap = (data = [], designType) => {
  const map = new Map();

  data.forEach((item) => {
    const rowIndex = item.rowIndex ?? item.rowNo ?? 1;

    const key = getFieldKey({
      definitionId: item.definitionId,
      rowNo: rowIndex,
      workFlowId: item.workFlowId,
      tabTypeId: item.tabTypeId,
      designType,
    });

    map.set(key, item);
  });

  return map;
};

/* ---------------- FIELD LOOKUP + PAYLOAD BUILD ---------------- */

const buildFieldLookup = (definitions) => {
  const map = {};
  definitions.forEach((f) => {
    map[normalizeKey(f.name)] = f;
  });
  return map;
};

export const processFieldsOptimized = ({
  definitions,
  values,
  existingMap,
  entityId,
  isMulti = false,
  rowIndex,
  designType,
  isTabDataInvalidate,
  meta,
}) => {
  const fieldLookup = buildFieldLookup(definitions);
  const rows = isMulti ? values : [values];

  const result = [];

  rows.forEach((row, rowIdx) => {
    const rowNo = isMulti ? (row?.rowIndex ?? rowIdx + 1) : (rowIndex ?? 1);

    Object.entries(row).forEach(([key, newValue]) => {
      if (key === "rowIndex") return;

      const field = fieldLookup[key];
      if (!field) return;
      const lookupKey = getFieldKey({
        definitionId: field.id,
        rowNo,
        workFlowId: field.workFlowId,
        tabTypeId: field.tabTypeId,
        designType,
      });

      const existingField = existingMap.get(lookupKey);

      const formattedValue = transformValue(newValue, field);
      const oldValue = existingField?.value ?? existingField?.label ?? "";

      if (isEqualValue(oldValue, formattedValue, field)) return;

      if (field?.relationFieldId) {
        meta.isTabDataInvalidate = true;
      }
      result.push({
        fieldDefinitionId: field.id,
        workFlowId: field.workFlowId,
        entityId,
        value: String(formattedValue ?? ""),
        rowIndex: existingField?.rowIndex ?? rowIndex ?? null,
        rowNo,
      });
    });
  });

  return result;
};
