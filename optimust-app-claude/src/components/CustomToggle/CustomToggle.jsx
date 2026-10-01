import React from "react";
import { InputSwitch } from "primereact/inputswitch";
import "./CustomToggle.scss";

const CustomToggle = ({ value, onChange, disabled }) => {
  return (
    <div style={{ transform: "scale(0.75)", transformOrigin: "left center" }}>
      <InputSwitch
        className="p-inputswitch inputswitch-slider"
        checked={value}
        onChange={(e) => onChange(e.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default CustomToggle;
