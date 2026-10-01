import React from "react";
import { X } from "lucide-react";
import "./CrossButton.scss";

const CrossButton = ({
  type = "button",
  size = 16,
  strokeWidth = 2.5,
  className = "",
  ...props
}) => {
  return (
    <button type={type} className={`cross-button ${className}`} {...props}>
      <X size={size} strokeWidth={strokeWidth} />
    </button>
  );
};

export default CrossButton;
