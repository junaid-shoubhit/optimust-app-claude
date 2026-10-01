import { Checkbox } from "primereact/checkbox";
import "./CustomCheckBox.scss";

const CustomCheckBox = ({ value, name, label, ...props }) => {
  return (
    <div className="flex gap-2 items-center">
      <Checkbox
        inputId={props?.name}
        checked={!!value}
        className="p-checkbox-sm"
        {...props}
        // label={props?.name}
      />
      <label title={name} className="text-xs uppercase font-medium">
        {label} {props?.required && "*"}
      </label>
    </div>
  );
};

export default CustomCheckBox;
