import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";
import { formatValue } from "./fieldConfigurationConstant";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import DeleteButton from "../../../../../../../components/Forms/Buttons/DeleteButton";

const ValidationList = ({
  validations,
  editValidation,
  deleteValidation,
  deleteRule,
  fieldOptions,
  isLoading,
  onAdd,
}) => {
  const getFieldLabel = (id) =>
    fieldOptions.find((f) => f.value === id)?.label || id;

  const getSummary = (rule) => {
    const conditions = rule.conditions.map((c) => {
      const val = formatValue(c);
      return {
        text:
          val !== "" && val !== null && val !== undefined
            ? `${getFieldLabel(c.fieldId)} ${c.operator} ${val}`
            : `${getFieldLabel(c.fieldId)} ${c.operator}`,
        message: c.message,
      };
    });

    const actions = rule.actions
      .map((a) => `${a.actionType} ${getFieldLabel(a.targetFieldId)}`)
      .join(", ");

    return {
      conditions,
      logic: rule.logic,
      actions,
    };
  };
  return (
    <div className="flex flex-col h-full rounded-lg bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b-[0.5px] border-(--border-inverse)  bg-white sticky top-0">
        <h3 className="text-sm font-semibold text-gray-700">Fields Rules</h3>

        <CustomButton
          iconPos="left"
          icon="pi pi-plus"
          className="saveBtn"
          label="Add Rules"
          onClick={onAdd}
        />
      </div>

      {/* Scrollable List */}
      <div className="flex flex-col gap-3 p-3 overflow-y-auto">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 bg-white animate-pulse flex flex-col gap-2"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        {/* Empty State */}
        {!isLoading && validations.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-6">
            No validations added
          </div>
        )}

        {!isLoading &&
          validations.map((validation, validationIndex) => (
            <div
              key={validationIndex}
              className="border-[0.5px] border-(--border-inverse)  rounded-lg p-3 bg-white"
            >
              <div className=" flex justify-between items-center  mb-2">
                <p className="text-xs text-gray-500 font-semibold">
                  Field: {validation.fieldName}
                </p>

                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteButton
                    id={validation?.id}
                    message="Delete this rule?"
                    apiPath="WorkflowRelation/DataValidation/:id"
                    onDelete={() => deleteValidation(validationIndex)}
                    className="text-red-500! hover:text-red-700! p-0! w-fit!"
                  />
                </div>
              </div>

              {validation.allRules.map((rule, ruleIndex) => {
                const summary = getSummary(rule);

                return (
                  <div
                    key={ruleIndex}
                    className="flex justify-between items-start border-[0.5px] border-(--border-inverse) rounded p-2 bg-gray-50 mb-2"
                  >
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                          {rule.applyOn?.toUpperCase()}
                        </span>
                      </div>
                      {summary.conditions.map((cond, i) => (
                        <div key={i}>
                          <div>
                            {i !== 0 && `${summary.logic} `}
                            {cond.text}
                          </div>

                          {cond.message && (
                            <div className="text-red-500 text-xs">
                              {cond.message}
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="text-gray-600 text-xs mt-1">
                        → {summary.actions}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {validation.allRules.length > 1 && (
                        <DeleteButton
                          message="Delete this rule?"
                          onDelete={() =>
                            deleteRule(validationIndex, ruleIndex)
                          }
                          className="text-red-500! hover:text-red-700! p-0! w-fit!"
                        />
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          editValidation(validationIndex, ruleIndex)
                        }
                        title="Edit Rule"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      {/* <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteRule(validationIndex, ruleIndex)}
                        title="Delete Rule"
                      >
                        <FiTrash2 size={16} />
                      </button> */}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ValidationList;
