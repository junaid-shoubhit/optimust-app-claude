// import { useFormContext, Controller } from "react-hook-form";
// import { FiTrash2 } from "react-icons/fi";
// import SelectField from "../../../../../../../components/Forms/Select/Select";
// import Input from "../../../../../../../components/Forms/Input/Input";
// import DateInput from "../../../../../../../components/Forms/Date/Date";
// import {
//   getOperatorOptions,
//   operatorConfig,
// } from "./fieldConfigurationConstant";
// import Field from "../../../../../../../components/Forms/Field";
// import { useWatch } from "react-hook-form";
// const ConditionRow = ({
//   ruleIndex,
//   condIndex,
//   fieldOptions,
//   removeCondition,
// }) => {
//   const {
//     control,
//     setValue,
//     trigger,
//     getValues,
//     formState: { errors },
//   } = useFormContext();
//   const fieldId = useWatch({
//     name: `rules.${ruleIndex}.conditions.${condIndex}.fieldId`,
//     control,
//   });
//   const selectedField = fieldOptions?.find((f) => f.value === fieldId);
//   const operators = getOperatorOptions(selectedField?.type);
//   const operator = useWatch({
//     name: `rules.${ruleIndex}.conditions.${condIndex}.operator`,
//     control,
//   });

//   const isDateField = selectedField?.type === "date";
//   const isNumberField = selectedField?.type === "number";
//   const isCheckboxField = selectedField?.type === "checkbox";
//   const isSelectField = selectedField?.type === "select";

//   const valueConfig = operatorConfig[operator] || { valueCount: 1 };

//   return (
//     <div className="grid grid-cols-12 gap-3 items-center">
//       <div className="col-span-12 flex justify-between">
//         <h4 className="text-sm font-semibold">Condition {condIndex + 1}</h4>

//         {condIndex !== 0 && (
//           <button onClick={() => removeCondition(condIndex)}>
//             <FiTrash2 size={16} />
//           </button>
//         )}
//       </div>

//       <div className="col-span-7">
//         <Field
//           controller={{
//             name: `rules.${ruleIndex}.conditions.${condIndex}.fieldId`,
//             control,
//             rules: { required: "Field is required" },
//             render: ({ field }) => (
//               <SelectField
//                 {...field}
//                 label="Field"
//                 defaultOptions={fieldOptions}
//                 value={
//                   field.value
//                     ? fieldOptions.find((o) => o.value === field.value) || null
//                     : null
//                 }
//                 onChange={(v) => {
//                   const newField = v ? v.value : null;
//                   field.onChange(newField);

//                   const path = `rules.${ruleIndex}.conditions.${condIndex}`;

//                   setValue(`${path}.operator`, null, {
//                     shouldDirty: true,
//                     shouldTouch: true,
//                     // shouldValidate: true,
//                   });
//                   setValue(`${path}.value`, "");
//                   setValue(`${path}.extra`, []);
//                   setValue(`${path}.message`, "");
//                 }}
//                 isRequired
//                 invalid={
//                   errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.fieldId
//                 }
//               />
//             ),
//           }}
//         />
//       </div>

//       <div className="col-span-5">
//         <Field
//           controller={{
//             name: `rules.${ruleIndex}.conditions.${condIndex}.operator`,
//             control,
//             rules: { required: "Operator is required" },
//             render: ({ field }) => (
//               <SelectField
//                 {...field}
//                 label="Operator"
//                 defaultOptions={operators}
//                 value={
//                   field.value
//                     ? operators.find((o) => o.value === field.value) || null
//                     : null
//                 }
//                 onChange={(v) => {
//                   const newOperator = v ? v.value : null;

//                   const path = `rules.${ruleIndex}.conditions.${condIndex}`;
//                   const prevConfig = operatorConfig[operator] || {
//                     valueCount: 1,
//                   };
//                   const newConfig = operatorConfig[newOperator] || {
//                     valueCount: 1,
//                   };

//                   field.onChange(newOperator);

//                   // only reset if value structure changed
//                   if (prevConfig.valueCount !== newConfig.valueCount) {
//                     if (newConfig.valueCount === 0) {
//                       setValue(`${path}.value`, "");
//                       setValue(`${path}.extra`, []);
//                     }

//                     if (newConfig.valueCount === 1) {
//                       setValue(`${path}.extra`, []);
//                     }

//                     if (newConfig.valueCount === 2) {
//                       setValue(`${path}.value`, "");
//                       setValue(`${path}.extra`, ["", ""]);
//                     }
//                   }
//                 }}
//                 isDisabled={!fieldId}
//                 isRequired
//                 invalid={
//                   errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.operator
//                 }
//               />
//             ),
//           }}
//         />
//       </div>
//       <div className="col-span-7">
//         <Field
//           controller={{
//             name: `rules.${ruleIndex}.conditions.${condIndex}.message`,
//             control,
//             rules: { required: "Error Message is required" },
//             render: ({ field }) => (
//               <Input
//                 label="Error Message"
//                 {...field}
//                 isRequired={true}
//                 disabled={!fieldId}
//                 invalid={
//                   errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.message
//                 }
//               />
//             ),
//           }}
//         />
//       </div>

//       {(isCheckboxField || valueConfig.valueCount === 0) && (
//         <div className="col-span-5 text-gray-400 text-sm">
//           No value required
//         </div>
//       )}
//       {!isCheckboxField && valueConfig.valueCount === 1 && (
//         <div className="col-span-5">
//           <Field
//             controller={{
//               name: `rules.${ruleIndex}.conditions.${condIndex}.value`,

//               control,
//               rules: { required: "Value is required" },
//               render: ({ field }) =>
//                 isDateField ? (
//                   <DateInput
//                     {...field}
//                     label="Value"
//                     disabled={!fieldId}
//                     invalid={
//                       errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.value
//                     }
//                   />
//                 ) : (
//                   <Input
//                     label="Value"
//                     {...field}
//                     type={isNumberField ? "number" : "text"}
//                     isRequired
//                     disabled={!fieldId}
//                     invalid={
//                       errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.value
//                     }
//                   />
//                 ),
//             }}
//           />
//         </div>
//       )}
//       {!isCheckboxField && valueConfig.valueCount === 2 && (
//         <div className="col-span-12 flex gap-2">
//           <div className="flex-1">
//             <Field
//               controller={{
//                 name: `rules.${ruleIndex}.conditions.${condIndex}.extra.0`,
//                 control,
//                 rules: {
//                   required: "Start value required",
//                   validate: (v) => {
//                     const toValue = getValues(
//                       `rules.${ruleIndex}.conditions.${condIndex}.extra.1`,
//                     );
//                     if (!v || !toValue) return true;

//                     if (isDateField) {
//                       return (
//                         new Date(v) <= new Date(toValue) ||
//                         "From date must be before To date"
//                       );
//                     }

//                     return (
//                       Number(v) <= Number(toValue) ||
//                       "From must be less than or equal to To"
//                     );
//                   },
//                 },
//                 render: ({ field }) =>
//                   isDateField ? (
//                     <DateInput
//                       label="From"
//                       {...field}
//                       disabled={!fieldId}
//                       onChange={(v) => {
//                         field.onChange(v);
//                         trigger(
//                           `rules.${ruleIndex}.conditions.${condIndex}.extra`,
//                         );
//                       }}
//                     />
//                   ) : (
//                     <Input
//                       type={isNumberField ? "number" : "text"}
//                       label="From"
//                       {...field}
//                       disabled={!fieldId}
//                       invalid={
//                         errors?.rules?.[ruleIndex]?.conditions?.[condIndex]
//                           ?.extra?.[0]
//                       }
//                       onChange={(e) => {
//                         field.onChange(e);
//                         trigger(
//                           `rules.${ruleIndex}.conditions.${condIndex}.extra`,
//                         );
//                       }}
//                     />
//                   ),
//               }}
//             />
//           </div>

//           <div className="flex-1">
//             <Field
//               controller={{
//                 name: `rules.${ruleIndex}.conditions.${condIndex}.extra.1`,
//                 control,
//                 rules: {
//                   required: "End value required",
//                   validate: (v) => {
//                     const fromValue = getValues(
//                       `rules.${ruleIndex}.conditions.${condIndex}.extra.0`,
//                     );
//                     if (!v || !fromValue) return true;

//                     if (isDateField) {
//                       return (
//                         new Date(v) >= new Date(fromValue) ||
//                         "To date must be after From date"
//                       );
//                     }

//                     return (
//                       Number(v) >= Number(fromValue) ||
//                       "To must be greater than or equal to From"
//                     );
//                   },
//                 },
//                 render: ({ field }) =>
//                   isDateField ? (
//                     <DateInput
//                       label="To"
//                       {...field}
//                       disabled={!fieldId}
//                       onChange={(v) => {
//                         field.onChange(v);
//                         trigger(
//                           `rules.${ruleIndex}.conditions.${condIndex}.extra`,
//                         );
//                       }}
//                     />
//                   ) : (
//                     <Input
//                       type={isNumberField ? "number" : "text"}
//                       label="To"
//                       {...field}
//                       disabled={!fieldId}
//                       invalid={
//                         errors?.rules?.[ruleIndex]?.conditions?.[condIndex]
//                           ?.extra?.[1]
//                       }
//                       onChange={(e) => {
//                         field.onChange(e);
//                         trigger(
//                           `rules.${ruleIndex}.conditions.${condIndex}.extra`,
//                         );
//                       }}
//                     />
//                   ),
//               }}
//             />
//           </div>
//         </div>
//       )}
//       {/* {valueConfig.valueCount === 2 && (
//         <div className="col-span-5 flex gap-2">
//           <Field
//             controller={{
//               name: `rules.${ruleIndex}.conditions.${condIndex}.extra.0`,
//               control,
//               rules: { required: "Start value required" },
//               render: ({ field }) => (
//                 <Input label="From" {...field} disabled={!fieldId} />
//               ),
//             }}
//           />

//           <Field
//             controller={{
//               name: `rules.${ruleIndex}.conditions.${condIndex}.extra.1`,
//               control,
//               rules: { required: "End value required" },
//               render: ({ field }) => (
//                 <Input label="To" {...field} disabled={!fieldId} />
//               ),
//             }}
//           />
//         </div>
//       )} */}
//     </div>
//   );
// };

// export default ConditionRow;

import { useFormContext, useWatch } from "react-hook-form";
import { FiTrash2 } from "react-icons/fi";
import { useMemo } from "react";

import SelectField from "../../../../../../../components/Forms/Select/Select";
import Input from "../../../../../../../components/Forms/Input/Input";
import DateInput from "../../../../../../../components/Forms/Date/Date";
import Field from "../../../../../../../components/Forms/Field";

import {
  getOperatorOptions,
  operatorConfig,
} from "./fieldConfigurationConstant";

const ConditionRow = ({
  ruleIndex,
  conditions,
  condIndex,
  fieldOptions,
  removeCondition,
}) => {
  const {
    control,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext();

  const basePath = `rules.${ruleIndex}.conditions.${condIndex}`;

  const fieldId = useWatch({
    name: `${basePath}.fieldId`,
    control,
  });

  const operator = useWatch({
    name: `${basePath}.operator`,
    control,
  });

  const selectedField = useMemo(
    () => fieldOptions?.find((f) => f.value === fieldId),
    [fieldOptions, fieldId],
  );
  const operators = useMemo(
    () => getOperatorOptions(selectedField?.type),
    [selectedField],
  );

  const valueConfig = operatorConfig[operator] || { valueCount: 1 };

  const isCheckboxField = selectedField?.type === "checkbox";

  /* -------------------------
     Universal Field Renderer
  ------------------------- */

  const renderInputByType = ({
    type,
    field,
    label,
    disabled,
    invalid,
    payload,
    onChange,
  }) => {
    switch (type) {
      case "date":
        return (
          <DateInput
            {...field}
            label={label}
            disabled={disabled}
            invalid={invalid}
            onChange={(v) => {
              field.onChange(v);
              onChange?.(v);
            }}
          />
        );

      case "datetime":
        return (
          <DateInput
            {...field}
            label={label}
            disabled={disabled}
            invalid={invalid}
            onChange={(v) => {
              field.onChange(v);
              onChange?.(v);
            }}
          />
        );

      case "number":
        return (
          <Input
            {...field}
            type="number"
            label={label}
            disabled={disabled}
            invalid={invalid}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e);
            }}
          />
        );

      case "select":
      case "multiselect":
        return (
          <SelectField
            {...field}
            label={label}
            payload={payload}
            disabled={disabled}
            invalid={invalid}
            isMulti={type === "multiselect"}
          />
        );

      default:
        return (
          <Input
            {...field}
            type="text"
            label={label}
            disabled={disabled}
            invalid={invalid}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e);
            }}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      {/* Header */}
      <div className="col-span-12 flex justify-between">
        <h4 className="text-sm font-semibold">Condition {condIndex + 1}</h4>

        {condIndex !== 0 && (
          <button onClick={() => removeCondition(condIndex)}>
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      {/* Field */}
      <div className="col-span-7">
        <Field
          controller={{
            name: `${basePath}.fieldId`,
            control,
            rules: { required: "Field is required" },
            render: ({ field }) => (
              <SelectField
                {...field}
                label="Field"
                defaultOptions={fieldOptions}
                value={
                  field.value
                    ? fieldOptions.find((o) => o.value === field.value) || null
                    : null
                }
                onChange={(v) => {
                  const newField = v ? v.value : null;
                  field.onChange(newField);

                  setValue(`${basePath}.operator`, null, {
                    shouldDirty: true,
                    shouldTouch: true,
                  });

                  setValue(`${basePath}.value`, "");
                  setValue(`${basePath}.extra`, []);
                  setValue(`${basePath}.message`, "");
                }}
                isRequired
                invalid={
                  errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.fieldId
                }
              />
            ),
          }}
        />
      </div>

      {/* Operator */}
      <div className="col-span-5">
        <Field
          controller={{
            name: `${basePath}.operator`,
            control,
            rules: { required: "Operator is required" },
            render: ({ field }) => (
              <SelectField
                {...field}
                label="Operator"
                defaultOptions={operators}
                value={
                  field.value
                    ? operators.find((o) => o.value === field.value) || null
                    : null
                }
                onChange={(v) => {
                  const newOperator = v ? v.value : null;

                  const prevConfig = operatorConfig[operator] || {
                    valueCount: 1,
                  };

                  const newConfig = operatorConfig[newOperator] || {
                    valueCount: 1,
                  };

                  field.onChange(newOperator);

                  if (prevConfig.valueCount !== newConfig.valueCount) {
                    if (newConfig.valueCount === 0) {
                      setValue(`${basePath}.value`, "");
                      setValue(`${basePath}.extra`, []);
                    }

                    if (newConfig.valueCount === 1) {
                      setValue(`${basePath}.extra`, []);
                    }

                    if (newConfig.valueCount === 2) {
                      setValue(`${basePath}.value`, "");
                      setValue(`${basePath}.extra`, ["", ""]);
                    }
                  }
                }}
                isDisabled={!fieldId}
                isRequired
                invalid={
                  errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.operator
                }
              />
            ),
          }}
        />
      </div>

      {/* Error Message */}
      <div className="col-span-7">
        <Field
          controller={{
            name: `${basePath}.message`,
            control,
            // rules: { required: "Error Message is required" },
            render: ({ field }) => (
              <Input
                label="Error Message"
                {...field}
                disabled={!fieldId}
                // isRequired
                invalid={
                  errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.message
                }
              />
            ),
          }}
        />
      </div>

      {/* No Value */}
      {(isCheckboxField || valueConfig.valueCount === 0) && (
        <div className="col-span-5 text-gray-400 text-sm">
          No value required
        </div>
      )}

      {/* Single Value */}
      {!isCheckboxField && valueConfig.valueCount === 1 && (
        <div className="col-span-5">
          <Field
            controller={{
              name: `${basePath}.value`,
              control,
              rules: { required: "Value is required" },
              render: ({ field }) =>
                renderInputByType({
                  type: selectedField?.type,
                  field,
                  label: "Value",
                  disabled: !fieldId,
                  payload: {
                    dataTable: selectedField?.dropdownTable,
                    dataField: selectedField?.dropdownTableColumn,
                  },
                  invalid:
                    errors?.rules?.[ruleIndex]?.conditions?.[condIndex]?.value,
                  options: selectedField?.options,
                }),
            }}
          />
        </div>
      )}

      {/* Range */}
      {!isCheckboxField && valueConfig.valueCount === 2 && (
        <div className="col-span-12 flex gap-2">
          {/* From */}
          <div className="flex-1">
            <Field
              controller={{
                name: `${basePath}.extra.0`,
                control,
                rules: {
                  required: "Start value required",
                  validate: (v) => {
                    const toValue = getValues(`${basePath}.extra.1`);

                    if (!v || !toValue) return true;

                    if (selectedField?.type === "date") {
                      return (
                        new Date(v) <= new Date(toValue) ||
                        "From date must be before To date"
                      );
                    }

                    return (
                      Number(v) <= Number(toValue) ||
                      "From must be less than or equal to To"
                    );
                  },
                },
                render: ({ field }) =>
                  renderInputByType({
                    type: selectedField?.type,
                    field,
                    label: "From",
                    disabled: !fieldId,
                    invalid:
                      errors?.rules?.[ruleIndex]?.conditions?.[condIndex]
                        ?.extra?.[0],
                    options: selectedField?.options,
                    onChange: () => trigger(`${basePath}.extra`),
                  }),
              }}
            />
          </div>

          {/* To */}
          <div className="flex-1">
            <Field
              controller={{
                name: `${basePath}.extra.1`,
                control,
                rules: {
                  required: "End value required",
                  validate: (v) => {
                    const fromValue = getValues(`${basePath}.extra.0`);

                    if (!v || !fromValue) return true;

                    if (selectedField?.type === "date") {
                      return (
                        new Date(v) >= new Date(fromValue) ||
                        "To date must be after From date"
                      );
                    }

                    return (
                      Number(v) >= Number(fromValue) ||
                      "To must be greater than or equal to From"
                    );
                  },
                },
                render: ({ field }) =>
                  renderInputByType({
                    type: selectedField?.type,
                    field,
                    label: "To",
                    disabled: !fieldId,
                    invalid:
                      errors?.rules?.[ruleIndex]?.conditions?.[condIndex]
                        ?.extra?.[1],
                    options: selectedField?.options,
                    onChange: () => trigger(`${basePath}.extra`),
                  }),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionRow;
