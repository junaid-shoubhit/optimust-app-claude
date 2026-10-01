import { useFormContext, useWatch } from "react-hook-form";
import SelectField from "../../../.../../../../../../components/Forms/Select/Select";
import { FiTrash2 } from "react-icons/fi";
import Field from "../../../../../../../components/Forms/Field";
import {
  getAvailableActions,
  getAvailableTargetFields,
} from "./ruleEngineConfig";

const ActionRow = ({ ruleIndex, actionIndex, fieldOptions, removeAction }) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const actions = useWatch({
    control,
    name: `rules.${ruleIndex}.actions`,
  });

  const targetFieldId = useWatch({
    control,
    name: `rules.${ruleIndex}.actions.${actionIndex}.targetFieldId`,
  });

  const availableFields = getAvailableTargetFields(
    fieldOptions,
    actions,
    targetFieldId,
  );

  const availableActions = getAvailableActions(
    targetFieldId,
    actions,
    actionIndex,
  );

  return (
    <div className="grid grid-cols-12 gap-3 items-end">
      <div className="col-span-12 flex justify-between">
        <h4 className="text-sm font-semibold">Action {actionIndex + 1}</h4>

        {actionIndex !== 0 && (
          <button onClick={() => removeAction(actionIndex)}>
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      {/* TARGET FIELD */}
      <div className="col-span-7">
        <Field
          controller={{
            name: `rules.${ruleIndex}.actions.${actionIndex}.targetFieldId`,
            control,
            rules: { required: "Target Field is required" },
            render: ({ field }) => (
              <SelectField
                {...field}
                label="Target Field"
                defaultOptions={availableFields}
                value={
                  field.value
                    ? availableFields.find((o) => o.value === field.value) ||
                      null
                    : null
                }
                onChange={(v) => {
                  const newField = v?.value || null;

                  field.onChange(newField);

                  setValue(
                    `rules.${ruleIndex}.actions.${actionIndex}.actionType`,
                    null,
                  );
                }}
                isRequired
                invalid={
                  errors?.rules?.[ruleIndex]?.actions?.[actionIndex]
                    ?.targetFieldId
                }
              />
            ),
          }}
        />
      </div>

      {/* ACTION */}
      <div className="col-span-5">
        <Field
          controller={{
            name: `rules.${ruleIndex}.actions.${actionIndex}.actionType`,
            control,
            rules: { required: "Action is required" },
            render: ({ field }) => (
              <SelectField
                {...field}
                label="Action"
                defaultOptions={availableActions}
                value={
                  field.value
                    ? availableActions.find((o) => o.value === field.value) ||
                      null
                    : null
                }
                onChange={(v) => field.onChange(v ? v.value : null)}
                isDisabled={!targetFieldId}
                isRequired
                invalid={
                  errors?.rules?.[ruleIndex]?.actions?.[actionIndex]?.actionType
                }
              />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default ActionRow;
