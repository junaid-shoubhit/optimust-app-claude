import React from "react";
import { Check } from "lucide-react";
import "./CheckMarkButton.scss";

const CheckMarkButton = ({
  type = "button",
  size = 16,
  strokeWidth = 2.5,
  className = "",
  ...props
}) => {
  return (
    <button type={type} className={`checkmark-button ${className}`} {...props}>
      <Check size={size} strokeWidth={strokeWidth} />
    </button>
  );
};

export default CheckMarkButton;
