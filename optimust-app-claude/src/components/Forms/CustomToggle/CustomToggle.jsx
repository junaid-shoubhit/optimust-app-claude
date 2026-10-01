import React from "react";
import { InputSwitch } from "primereact/inputswitch";
import "./CustomToggle.scss";
const CustomToggle = ({ value, ...props }) => {
  return (
    <div style={{ transform: "scale(0.75)", transformOrigin: "left center" }}>
      <InputSwitch
        className="custom-toggle"
        checked={value}
            {...props}
      />
    </div>
  );
};

export default CustomToggle;