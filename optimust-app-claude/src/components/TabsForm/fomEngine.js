// import { useMemo, useCallback } from "react";
// import { useWatch } from "react-hook-form";
// import { evaluateRule } from "./tabConstant";

// /* =========================================================
//    🔹 Normalize validations
// ========================================================= */
// export const useParsedValidations = (validation) => {
//   return useMemo(() => {
//     if (!validation?.length) return [];

//     const normalized = [];

//     validation.forEach((v) => {
//       try {
//         const parsed = JSON.parse(v.ruleJson);

//         if (Array.isArray(parsed)) {
//           parsed.forEach((rule) => normalized.push({ ...v, rule }));
//         } else {
//           normalized.push({ ...v, rule: parsed });
//         }
//       } catch (err) {
//         console.error("Invalid ruleJson", err);
//       }
//     });

//     return normalized;
//   }, [validation]);
// };

// /* =========================================================
//    🔹 Build field maps
// ========================================================= */
// export const useFieldMaps = (fields, getName) => {
//   return useMemo(() => {
//     const idToName = {};
//     const nameToId = {};

//     fields?.forEach((f) => {
//       const name = getName(f);
//       idToName[f.id] = name;
//       nameToId[name] = f.id;
//     });

//     return { idToName, nameToId };
//   }, [fields, getName]);
// };

// /* =========================================================
//    🔹 Build rule dependency graph
// ========================================================= */
// export const useRuleDependencyGraph = (parsedValidations) => {
//   return useMemo(() => {
//     const graph = {};

//     parsedValidations.forEach((v, ruleIndex) => {
//       v.rule?.conditions?.forEach((cond) => {
//         if (!graph[cond.fieldId]) graph[cond.fieldId] = [];
//         graph[cond.fieldId].push(ruleIndex);
//       });
//     });

//     return graph;
//   }, [parsedValidations]);
// };

// /* =========================================================
//    🔹 Build relation map
// ========================================================= */
// export const useRelationMap = (relation) => {
//   return useMemo(() => {
//     if (!relation?.length) return {};

//     const map = {};

//     relation.forEach((rel) => {
//       if (rel.relationType?.toLowerCase() === "cascade") {
//         map[rel.childFieldId] = {
//           parentFieldId: rel.parentFieldId,
//           relationId: rel.relationId,
//         };
//       }
//     });

//     return map;
//   }, [relation]);
// };

// /* =========================================================
//    🔹 Main effects engine (REUSABLE 🔥)
// ========================================================= */
// export const useFieldEffectsEngine = ({
//   control,
//   parsedValidations,
//   ruleDependencyGraph,
//   relationMap,
//   fieldMaps,
// }) => {
//   /* ---------- watch names ---------- */
//   const relationWatchNames = useMemo(() => {
//     return Object.values(relationMap)
//       .map((rel) => fieldMaps.idToName[rel.parentFieldId])
//       .filter(Boolean);
//   }, [relationMap, fieldMaps]);

//   const watchNames = useMemo(() => {
//     const ruleWatch = Object.keys(ruleDependencyGraph)
//       .map((fieldId) => fieldMaps.idToName[fieldId])
//       .filter(Boolean);

//     return Array.from(new Set([...ruleWatch, ...relationWatchNames]));
//   }, [ruleDependencyGraph, relationWatchNames, fieldMaps]);

//   /* ---------- watcher ---------- */
//   const watchedValuesArray = useWatch({
//     control,
//     name: watchNames,
//   });

//   /* ---------- values map ---------- */
//   const valuesByFieldId = useMemo(() => {
//     const map = {};

//     watchNames.forEach((name, index) => {
//       const fieldId = fieldMaps.nameToId[name];
//       map[fieldId] = watchedValuesArray?.[index];
//     });

//     return map;
//   }, [watchedValuesArray, watchNames, fieldMaps]);

//   /* ---------- effects ---------- */
//   const fieldEffectsMap = useMemo(() => {
//     const map = {};

//     /* ===== RULE EFFECTS ===== */
//     parsedValidations.forEach((v) => {
//       const passed = evaluateRule(v.rule, valuesByFieldId);

//       v.rule.actions?.forEach((action) => {
//         const targetId = action.targetFieldId;

//         if (!map[targetId]) {
//           map[targetId] = {
//             visible: true,
//             disabled: false,
//             required: false,
//           };
//         }

//         switch (action.actionType) {
//           case "SHOW":
//             map[targetId].visible = passed;
//             break;
//           case "HIDE":
//             map[targetId].visible = !passed;
//             break;
//           case "DISABLE":
//             map[targetId].disabled = passed;
//             break;
//           case "REQUIRED":
//             map[targetId].required = passed;
//             break;
//         }
//       });
//     });

//     /* ===== CASCADE EFFECTS ===== */
//     Object.entries(relationMap).forEach(([childId, rel]) => {
//       const parentValue = valuesByFieldId[rel.parentFieldId];

//       if (!map[childId]) {
//         map[childId] = {
//           visible: true,
//           disabled: false,
//           required: false,
//         };
//       }

//       const isParentEmpty =
//         parentValue === undefined ||
//         parentValue === null ||
//         parentValue === "" ||
//         (Array.isArray(parentValue) && parentValue.length === 0);

//       map[childId].disabled = map[childId].disabled || isParentEmpty;
//       map[childId].parentValue = parentValue;
//       map[childId].relationId = rel.relationId;
//       map[childId].isRelationChild = true;
//     });

//     return map;
//   }, [parsedValidations, valuesByFieldId, relationMap]);

//   const getFieldEffects = useCallback(
//     (fieldId) =>
//       fieldEffectsMap[fieldId] || {
//         visible: true,
//         disabled: false,
//         required: false,
//       },
//     [fieldEffectsMap],
//   );

//   return { getFieldEffects };
// };