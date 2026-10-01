import { useForm, FormProvider } from "react-hook-form";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import RuleCard from "./RuleCard";

const RuleBuilder = ({
  rules,
  fieldOptions,
  onCancel,
  onSave,
  // selectedField,
}) => {
  const isValidDateString = (value) => {
    if (typeof value !== "string") return false;

    // Prevent pure numbers from becoming dates
    if (/^\d+$/.test(value.trim())) return false;

    const date = new Date(value);

    return !isNaN(date.getTime());
  };

  const normalizeRules = (rules) => {
    return rules.map((rule) => ({
      ...rule,
      conditions: rule.conditions.map((cond) => ({
        ...cond,

        value: isValidDateString(cond.value)
          ? new Date(cond.value)
          : cond.value,

        extra: Array.isArray(cond.extra)
          ? cond.extra.map((v) => (isValidDateString(v) ? new Date(v) : v))
          : cond.extra,
      })),
    }));
  };
  const methods = useForm({
    defaultValues: {
      rules: normalizeRules(rules),
    },
    mode: "onBlur",
  });
  const { handleSubmit, watch } = methods;

  const submitForm = (data) => {
    onSave(data.rules);
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-[86vh]">
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2">
          {watch("rules").map((rule, index) => (
            <RuleCard
              key={index}
              ruleIndex={index}
              fieldOptions={fieldOptions}
              onBack={onCancel}
              // selectedField={selectedField}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t-[0.5px] border-(--border-inverse)  p-2 bg-white flex-shrink-0">
          <CustomButton
            className="outlineBtn"
            label="CANCEL"
            onClick={onCancel}
          />

          <CustomButton
            className="saveBtn"
            label="SAVE VALIDATION"
            onClick={handleSubmit(submitForm)}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default RuleBuilder;
