import Field from "../../../components/Forms/Field.jsx";
import DynamicFields from "../DynamicFields.jsx";
import { memo, useMemo } from "react";
import { evaluateOperator } from "../tabConstant.js";
import { BUILT_IN_VALIDATIONS } from "../constants/validationHelper.js";

const FieldRow = ({
  name,
  fieldMeta,
  control,
  validationRules,
  effects,
  isChanged,
  entityId,
  formMethods,
  selectedField,
  relationLookup,
  dependentFields,
  workFlowId,
  moduleId,
  tableFieldPath,
  colSize,
}) => {
  const isRequired = useMemo(() => {
    return Boolean(effects?.required);
  }, [effects?.required]);

  /* =========================================================
   REQUIRED MESSAGE
========================================================= */
  const requiredMessage = useMemo(() => {
    if (!isRequired) return null;

    if (!validationRules?.length) {
      return `${fieldMeta.label || fieldMeta?.name} is required`;
    }

    for (const rule of validationRules) {
      const hasRequiredAction = rule.actions?.some(
        (action) =>
          action.actionType === "REQUIRED" &&
          action.targetFieldId === fieldMeta.id,
      );

      if (!hasRequiredAction) continue;

      const conditionWithMessage = rule.conditions?.find(
        (c) =>
          c.fieldId === fieldMeta.id &&
          c.message &&
          c.message.trim().length > 0,
      );

      if (conditionWithMessage) {
        return conditionWithMessage.message;
      }
    }

    return `${fieldMeta.label || fieldMeta?.name} is required`;
  }, [
    isRequired,
    validationRules,
    fieldMeta.id,
    fieldMeta.name,
    fieldMeta.label,
  ]);

  /* =========================================================
   CUSTOM VALIDATIONS (NON-REQUIRED ONLY)
========================================================= */
  const validationRule = useMemo(() => {
    if (!validationRules?.length) return null;

    const rulesWithMessages = validationRules.filter((rule) => {
      // Skip REQUIRED rules completely.
      // RHF required validation will handle them.
      const isRequiredRule = rule.actions?.some(
        (action) =>
          action.actionType === "REQUIRED" &&
          action.targetFieldId === fieldMeta.id,
      );

      if (isRequiredRule) return false;

      return rule.conditions?.some(
        (c) =>
          c.fieldId === fieldMeta.id &&
          c.message &&
          c.message.trim().length > 0,
      );
    });

    if (!rulesWithMessages.length) return null;

    return (value) => {
      for (let i = 0; i < rulesWithMessages.length; i++) {
        const rule = rulesWithMessages[i];

        const fieldConditions = rule.conditions.filter(
          (c) =>
            c.fieldId === fieldMeta.id &&
            c.message &&
            c.message.trim().length > 0,
        );

        if (!fieldConditions.length) continue;

        const results = fieldConditions.map((cond) => {
          const isValid = evaluateOperator(
            value,
            cond.operator,
            cond.value,
            cond.values,
            rule.fieldType,
          );

          return {
            isValid,
            message: cond.message,
          };
        });

        if (rule.logic === "AND") {
          const failed = results.find((r) => !r.isValid);

          if (failed) {
            return failed.message;
          }
        } else {
          const hasOnePass = results.some((r) => r.isValid);

          if (!hasOnePass) {
            return results[0]?.message;
          }
        }
      }

      return true;
    };
  }, [validationRules, fieldMeta.id]);

  const builtInValidation = useMemo(() => {
    if (!fieldMeta?.validationId) return null;

    return BUILT_IN_VALIDATIONS[fieldMeta.validationId]?.validate ?? null;
  }, [fieldMeta.validationId]);

  const { value: _ignore, ...cleanMeta } = fieldMeta;

  const rules = useMemo(() => {
    const rules = {
      required: isRequired ? requiredMessage : false,
    };

    if (builtInValidation || validationRule) {
      rules.validate = (value) => {
        if (builtInValidation) {
          const result = builtInValidation(value);

          if (result !== true) {
            return result;
          }
        }

        if (validationRule) {
          return validationRule(value);
        }

        return true;
      };
    }

    return rules;
  }, [isRequired, requiredMessage, builtInValidation, validationRule]);

  const controller = useMemo(
    () => (renderFn) => ({
      name,
      control,
      rules,
      render: (ctx) => renderFn(ctx),
    }),
    [
      name,
      control,
      // isRequired,
      // requiredMessage,
      // validationRule,
      // builtInValidation,
      rules,
    ],
  );

  return (
    <Field
      controller={controller(({ field, fieldState }) => {
        return (
          <DynamicFields
            fieldMeta={{
              ...cleanMeta,
              ...field,
              // label: cleanMeta?.name,
              isRequired,
              isChanged,
              entityId,
              invalid: fieldState?.error,
              selectedField,
            }}
            effects={effects}
            formMethods={formMethods}
            relationLookup={relationLookup}
            dependentFields={dependentFields}
            control={control}
            workFlowId={workFlowId}
            moduleId={moduleId}
            tableFieldPath={tableFieldPath}
            colSize={colSize}
          />
        );
      })}
    />
  );
};

export default memo(FieldRow);
