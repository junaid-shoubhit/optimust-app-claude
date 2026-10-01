import React, { useRef, useState, useEffect } from "react";
import { Tooltip } from "primereact/tooltip";

const CellWrapper = ({ children, field, rowIndex }) => {
  const ref = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setShowTooltip(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    }
  }, [children]);

  return (
    <>
      <div
        ref={ref}
        id={`cell-${field}-${rowIndex}`}
        style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3, // limit to 3 lines
          WebkitBoxOrient: "vertical",
          textOverflow: "ellipsis",
          whiteSpace: "normal",
          wordBreak: "break-word",
          maxHeight: "4.5em", // 3 lines × line-height
        }}
      >
        {children}
      </div>
      {showTooltip && (
        <Tooltip target={`#cell-${field}-${rowIndex}`} content={typeof children === "string" ? children : ""} />
      )}
    </>
  );
};

export default CellWrapper;
