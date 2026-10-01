import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { evaluateRule, getFieldKey, isEqual } from "../tabConstant";

const DEFAULT_EFFECTS = {
  visible: true,
  disabled: false,
  required: false,
};

const getDefaultFieldName = (field) => {
  if (field.name?.startsWith("multiFields.")) {
    return field.name;
  }

  return getFieldKey(field.name);
};

export default function useFieldValidation({
  fields = [],
  dependentFields = [],
  validation = [],
  relation = [],
  control,
  entityId,
  originalValues,
  isMassUpdate = false,

  /**
   * Allows TableFields / SingleFields
   * to provide their own field name.
   */
  getFieldName = getDefaultFieldName,
  trackChanges = true,
}) {
  const isEditMode = Boolean(entityId);

  /**
   * =========================================================
   * RENDER FIELDS
   * =========================================================
   */

  const sortedFields = useMemo(() => {
    return [...fields].sort(
      (a, b) => Number(a.orderByExpression) - Number(b.orderByExpression),
    );
  }, [fields]);

  /**
   * =========================================================
   * WATCH FIELDS
   *
   * Includes:
   * - actual fields
   * - dependent fields
   * - validation fields
   * - relation fields
   * =========================================================
   */

  const watchFields = useMemo(() => {
    const map = new Map();

    [...fields, ...dependentFields].forEach((field) => {
      if (!map.has(field.id)) {
        map.set(field.id, field);
      }
    });

    return [...map.values()];
  }, [fields, dependentFields]);

  /**
   * =========================================================
   * PARSE VALIDATIONS
   * =========================================================
   *
   * Supports:
   *
   * [
   *   {...}
   * ]
   *
   * OR
   *
   * {
   *   create: [],
   *   edit: [],
   *   all: []
   * }
   *
   * OR
   *
   * {
   *   conditions: [],
   *   actions: []
   * }
   */

  const parsedValidations = useMemo(() => {
    if (!validation?.length) {
      return [];
    }

    const normalized = [];
    const seen = new Set();

    validation.forEach((v) => {
      try {
        const parsed = JSON.parse(v.ruleJson);

        /**
         * Array of rules
         */
        if (Array.isArray(parsed)) {
          parsed.forEach((rule) => {
            const key = `${v.fieldDefinitionId}-all-${JSON.stringify(rule)}`;

            if (seen.has(key)) return;

            seen.add(key);

            normalized.push({
              ...v,
              mode: "all",
              rule,
            });
          });

          return;
        }

        /**
         * create / edit / all structure
         */
        const hasModes = parsed?.create || parsed?.edit || parsed?.all;

        if (hasModes) {
          ["create", "edit", "all"].forEach((mode) => {
            parsed?.[mode]?.forEach((rule) => {
              const key = `${v.fieldDefinitionId}-${mode}-${JSON.stringify(rule)}`;

              if (seen.has(key)) return;

              seen.add(key);

              normalized.push({
                ...v,
                mode,
                rule,
              });
            });
          });

          return;
        }

        /**
         * Single rule object
         */
        const key = `${v.fieldDefinitionId}-all-${JSON.stringify(parsed)}`;

        if (seen.has(key)) return;

        seen.add(key);

        normalized.push({
          ...v,
          mode: "all",
          rule: parsed,
        });
      } catch (error) {
        console.error("useFieldValidation: Invalid ruleJson", error);
      }
    });

    return normalized;
  }, [validation]);

  /**
   * =========================================================
   * FIELD MAPS
   * =========================================================
   */

  const fieldMaps = useMemo(() => {
    const idToName = {};
    const nameToId = {};
    const idToField = {};

    watchFields.forEach((field) => {
      const name = getFieldName(field);

      idToName[field.id] = name;
      nameToId[name] = field.id;
      idToField[field.id] = field;
    });

    return {
      idToName,
      nameToId,
      idToField,
    };
  }, [watchFields, getFieldName]);

  /**
   * =========================================================
   * VALIDATION INDEX
   * =========================================================
   */

  const validationIndex = useMemo(() => {
    const map = {};

    parsedValidations.forEach((v) => {
      const shouldApply =
        v.mode === "all" ||
        (!isEditMode && v.mode === "create") ||
        (isEditMode && v.mode === "edit");

      if (!shouldApply) return;

      v.rule?.conditions?.forEach((condition) => {
        if (!map[condition.fieldId]) {
          map[condition.fieldId] = [];
        }

        map[condition.fieldId].push({
          ...v.rule,
          fieldType: v.fieldType,
        });
      });
    });

    return map;
  }, [parsedValidations, isEditMode]);

  /**
   * =========================================================
   * RELATION MAP + LOOKUP
   * =========================================================
   */

  const { relationMap, relationLookup } = useMemo(() => {
    const relationMap = {};
    const relationLookup = {};

    relation.forEach((rel) => {
      /**
       * Cascade relation
       */
      if (rel.relationType?.toLowerCase() === "cascade") {
        relationMap[rel.childFieldId] = {
          parentFieldId: rel.parentFieldId,
          relationId: rel.relationId,
          parentKey: rel.parentKey,
        };
      }

      /**
       * Lookup information
       */
      const childField = fieldMaps.idToField[rel.childFieldId];

      relationLookup[rel.parentFieldId] = {
        ...rel,
        childName: childField ? getFieldName(childField) : "",
      };
    });

    return {
      relationMap,
      relationLookup,
    };
  }, [relation, fieldMaps, getFieldName]);

  /**
   * =========================================================
   * WATCH NAMES
   * =========================================================
   */

  const watchNames = useMemo(() => {
    const ids = new Set();

    /**
     * Editable fields
     */
    watchFields.forEach((field) => {
      if (!field.readOnly && !field.isCalculatedField) {
        ids.add(field.id);
      }
    });

    /**
     * Validation condition fields
     */
    parsedValidations.forEach((v) => {
      const shouldApply =
        v.mode === "all" ||
        (!isEditMode && v.mode === "create") ||
        (isEditMode && v.mode === "edit");

      if (!shouldApply) return;

      v.rule?.conditions?.forEach((condition) => {
        ids.add(condition.fieldId);
      });
    });

    /**
     * Relation parent + child
     */
    relation.forEach((rel) => {
      ids.add(rel.parentFieldId);
      ids.add(rel.childFieldId);
    });

    return [...ids].map((id) => fieldMaps.idToName[id]).filter(Boolean);
  }, [watchFields, parsedValidations, relation, fieldMaps, isEditMode]);

  /**
   * =========================================================
   * WATCH VALUES
   * =========================================================
   */

  const watchedValues = useWatch({
    control,
    name: watchNames,
  });

  /**
   * =========================================================
   * VALUES BY FIELD ID
   * =========================================================
   */

  const valuesByFieldId = useMemo(() => {
    const map = {};

    watchNames.forEach((name, index) => {
      const fieldId = fieldMaps.nameToId[name];

      if (fieldId !== undefined) {
        map[fieldId] = watchedValues?.[index];
      }
    });

    return map;
  }, [watchedValues, watchNames, fieldMaps]);

  /**
   * =========================================================
   * CHANGED MAP
   * =========================================================
   */

  const changedMap = useMemo(() => {
    if (!trackChanges) return {};
    const map = {};

    sortedFields.forEach((field) => {
      if (field.readOnly || field.isCalculatedField) {
        return;
      }

      const name = fieldMaps.idToName[field.id];

      map[field.id] = !isEqual(
        valuesByFieldId[field.id],
        originalValues?.[name],
      );
    });

    return map;
  }, [sortedFields, valuesByFieldId, originalValues, fieldMaps, trackChanges]);

  /**
   * =========================================================
   * FIELD EFFECTS
   * =========================================================
   */

  const fieldEffectsMap = useMemo(() => {
    const map = {};

    /**
     * -------------------------------------------------------
     * VALIDATION EFFECTS
     * -------------------------------------------------------
     */

    parsedValidations.forEach((v) => {
      const shouldApply =
        v.mode === "all" ||
        (!isEditMode && v.mode === "create") ||
        (isEditMode && v.mode === "edit");

      if (!shouldApply) return;

      const passed = evaluateRule(v.rule, valuesByFieldId, v.fieldType);

      v.rule?.actions?.forEach((action) => {
        /**
         * Same behavior as SingleFields:
         * REQUIRED is ignored in Mass Update.
         */
        if (isMassUpdate && action.actionType === "REQUIRED") {
          return;
        }

        const target = action.targetFieldId;

        map[target] ??= {
          ...DEFAULT_EFFECTS,

          // Internal flags
          _hasShowRule: false,
          _showMatched: false,
          _hideMatched: false,
        };

        switch (action.actionType) {
          case "SHOW":
            map[target]._hasShowRule = true;

            if (passed) {
              map[target]._showMatched = true;
            }

            break;

          case "HIDE":
            if (passed) {
              map[target]._hideMatched = true;
            }

            break;

          case "DISABLE":
            map[target].disabled = map[target].disabled || passed;
            break;

          case "REQUIRED":
            map[target].required = map[target].required || passed;
            break;

          case "VALIDATE":
            break;

          default:
            break;
        }
      });
    });

    /**
     * -------------------------------------------------------
     * RESOLVE VISIBILITY
     * -------------------------------------------------------
     */

    Object.values(map).forEach((effect) => {
      /**
       * If there are SHOW rules:
       * visible when ANY SHOW rule passes.
       */
      if (effect._hasShowRule) {
        effect.visible = effect._showMatched;
      }

      /**
       * HIDE takes precedence.
       */
      if (effect._hideMatched) {
        effect.visible = false;
      }

      /**
       * Remove internal properties
       */
      delete effect._hasShowRule;
      delete effect._showMatched;
      delete effect._hideMatched;
    });

    /**
     * -------------------------------------------------------
     * CASCADE RELATION EFFECTS
     * -------------------------------------------------------
     */

    Object.entries(relationMap).forEach(([childId, rel]) => {
      const parentValue = valuesByFieldId[rel.parentFieldId];

      const hasParentValue =
        parentValue !== undefined &&
        parentValue !== null &&
        parentValue !== "" &&
        (!Array.isArray(parentValue) || parentValue.length > 0);

      map[childId] ??= {
        ...DEFAULT_EFFECTS,
      };

      /**
       * Disable child when parent
       * does not have a value.
       */
      map[childId].disabled = map[childId].disabled || !hasParentValue;

      /**
       * Mass Update:
       * parent selected => child required
       */
      if (isMassUpdate) {
        map[childId].required = hasParentValue;
      }

      map[childId].parentValue = parentValue;

      map[childId].relationId = rel.relationId;

      map[childId].parentKey = rel.parentKey || "value";

      map[childId].isRelationChild = true;
    });

    return map;
  }, [
    parsedValidations,
    relationMap,
    valuesByFieldId,
    isEditMode,
    isMassUpdate,
  ]);

  return {
    sortedFields,

    parsedValidations,

    validationIndex,

    fieldEffectsMap,

    changedMap,

    valuesByFieldId,

    relationMap,

    relationLookup,

    watchNames,
  };
}
