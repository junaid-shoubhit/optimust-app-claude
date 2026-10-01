import React, { useRef, useState, useEffect } from "react";

const HeaderWrapper = ({ children }) => {
  const ref = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkOverflow = () => {
      setShowTooltip(
        el.scrollHeight > el.clientHeight ||
        el.scrollWidth > el.clientWidth
      );
    };

    requestAnimationFrame(checkOverflow);

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    return () => observer.disconnect();
  }, [children]);

  const tooltipText =
    typeof children === "string"
      ? children
      : ref.current?.innerText || "";

  return (
    <div
      ref={ref}
      data-pr-tooltip={showTooltip ? tooltipText : null}
      className="header-tooltip"
      style={{
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
        fontSize: "12px",
        lineHeight: "1.2",
        cursor: showTooltip ? "pointer" : "default",
        maxHeight: "3em",
      }}
    >
      {children}
    </div>
  );
};

export default HeaderWrapper;
