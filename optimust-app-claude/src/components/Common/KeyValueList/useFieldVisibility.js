// hooks/useFieldVisibility.js

import { useMemo } from "react";
import {
  compileVisibilityRules,
  buildFieldValueMap,
  evaluateVisibilityRules,
} from "./fieldVisibilityEngine";

export const useFieldVisibility = ({
  fields = [],
  fieldDefinitions = [],
  validations = [],
  dynamicValues,
  mode = "all",
  disabled = false,
}) => {
  // Parse and compile ruleJson only when needed
  const compiledRules = useMemo(() => {
    if (disabled) {
      return {
        showTargetIds: new Set(),
        rules: [],
      };
    }

    return compileVisibilityRules(validations, mode);
  }, [validations, mode, disabled]);

  // Build O(1) lookup only when needed
  const fieldValueMap = useMemo(() => {
    if (disabled) return new Map();

    return buildFieldValueMap(fieldDefinitions, dynamicValues);
  }, [fieldDefinitions, dynamicValues, disabled]);

  // Evaluate only when needed
  const visibleTargetIds = useMemo(() => {
    if (disabled) return new Set();

    return evaluateVisibilityRules(compiledRules, fieldValueMap);
  }, [compiledRules, fieldValueMap, disabled]);

  return useMemo(() => {
    if (disabled) {
      return fields;
    }

    if (!compiledRules.showTargetIds.size) {
      return fields;
    }

    return fields.filter((field) => {
      const fieldId = Number(field.id ?? field.definitionId);

      if (!compiledRules.showTargetIds.has(fieldId)) {
        return true;
      }

      return visibleTargetIds.has(fieldId);
    });
  }, [fields, compiledRules, visibleTargetIds, disabled]);
};
