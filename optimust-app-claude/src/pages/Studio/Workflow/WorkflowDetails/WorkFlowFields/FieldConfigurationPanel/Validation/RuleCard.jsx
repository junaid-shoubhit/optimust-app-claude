import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { FiArrowLeft } from "react-icons/fi";
import SelectField from "../../../../../../../components/Forms/Select/Select";
import ConditionRow from "./ConditionRow";
import ActionRow from "./ActionRow";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";

const RuleCard = ({ ruleIndex, fieldOptions, onBack }) => {
  const { control } = useFormContext();

  const {
    fields: conditions,
    append: addCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: `rules.${ruleIndex}.conditions`,
  });

  const {
    fields: actions,
    append: addAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: `rules.${ruleIndex}.actions`,
  });

  // const rule = watch(`rules.${ruleIndex}`);
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b-[0.5px] border-(--border-inverse)  py-2 px-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <FiArrowLeft size={18} />
          </button>

          <h3 className="font-semibold text-sm">Select Logic</h3>
        </div>

        <div className="w-40">
          <Controller
            control={control}
            name={`rules.${ruleIndex}.applyOn`}
            render={({ field }) => (
              <SelectField
                label="Apply On"
                defaultOptions={[
                  { label: "All", value: "all" },
                  { label: "Create", value: "create" },
                  { label: "Edit", value: "edit" },
                ]}
                value={
                  field.value
                    ? {
                        label: field.value?.toUpperCase(),
                        value: field.value,
                      }
                    : {
                        label: "All",
                        value: "all",
                      }
                }
                isClearable={false}
                onChange={(v) => field.onChange(v?.value)}
                noErrorMessage
              />
            )}
          />
        </div>

        <div className="w-48">
          <Controller
            control={control}
            name={`rules.${ruleIndex}.logic`}
            render={({ field }) => (
              <SelectField
                label="AND / OR"
                defaultOptions={[
                  { label: "AND", value: "AND" },
                  { label: "OR", value: "OR" },
                ]}
                value={{
                  label: field.value,
                  value: field.value,
                }}
                isClearable={false}
                onChange={(v) => field.onChange(v?.value)}
                noErrorMessage
              />
            )}
          />
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* CONDITIONS */}
        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg divide-y-[0.5px]">
          {conditions.map((cond, condIndex) => (
            <ConditionRow
              // selectedField={selectedField}
              key={cond.id}
              conditions={conditions}
              ruleIndex={ruleIndex}
              condIndex={condIndex}
              fieldOptions={fieldOptions}
              removeCondition={removeCondition}
            />
          ))}

          <CustomButton
            className="saveBtn"
            label="+ Add Condition"
            onClick={() =>
              addCondition({
                fieldId: "",
                operator: "",
                value: "",
                message: "",
              })
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg divide-y-[0.5px]">
          {actions.map((act, actionIndex) => (
            <ActionRow
              key={act.id}
              ruleIndex={ruleIndex}
              actionIndex={actionIndex}
              fieldOptions={fieldOptions}
              removeAction={removeAction}
            />
          ))}

          <CustomButton
            className="bg-green-600! hover:bg-green-500! saveBtn "
            label="+ Add Action"
            onClick={() =>
              addAction({
                actionType: "SHOW",
                targetFieldId: "",
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RuleCard;
