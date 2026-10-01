import classNames from "classnames";
import Field from "../Field";

const DynamicFormFields = ({ fields, control, errors, gridCols }) => {
  return (
    <div className={classNames("grid gap-2 my-3", gridCols || "grid-cols-2")}>
      {fields.map(
        ({ name, label, component: Component, rules, props, customRender }) => (
          <Field
            key={name || label}
            controller={{
              name,
              control,
              rules,
              render: ({ field }) =>
                customRender ? (
                  customRender({
                    field,
                    label,
                    invalid: errors?.[name],
                    ...props,
                  })
                ) : (
                  <Component
                    {...field}
                    label={label}
                    invalid={errors?.[name]}
                    {...props}
                  />
                ),
            }}
          />
        ),
      )}
    </div>
  );
};

export default DynamicFormFields;
