import { Calendar } from "primereact/calendar";
import { useMemo } from "react";
import "./Date.scss";

const Date = ({
  isRequired,
  formatterId,
  isChanged,
  noErrorMessage,
  featureName,
  ...props
}) => {
  const dateFormat = useMemo(() => {
    switch (formatterId) {
      case 6: // US Date
      case 7: // US Date UTC
        return "mm/dd/yy";

      default:
        return "mm/dd/yy"; // Local format
    }
  }, [formatterId]);

  return (
    <div className="flex flex-col">
      {props?.label && (
        <label className="text-xs uppercase font-medium">
          {props.label}{" "}
          {isRequired && <span className="required-asterisk">*</span>}
        </label>
      )}

      <Calendar
        {...props}
        invalid={props?.invalid?.message}
        showIcon
        hourFormat="12"
        dateFormat={dateFormat}
        readOnlyInput={false}
        className={`w-full! ${isChanged ? "isdatechanged" : ""} ${featureName || ""}`}
      />
      {!noErrorMessage && (
        <span
          className={`error-message tracking-wider block min-h-0.5 ${
            props?.invalid?.message ? "visible" : "invisible"
          }`}
        >
          {props?.invalid?.message || "placeholder"}
        </span>
      )}
    </div>
  );
};

export default Date;
