import { memo, useEffect, useRef, useState } from "react";
import { Tooltip } from "primereact/tooltip";

const TruncatedText = ({
  value,
  className = "",
  lines = 2,
  emptyText = "--",
}) => {
  const ref = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const text = value == null || value === "" ? emptyText : String(value);

  useEffect(() => {
    const checkTruncation = () => {
      if (!ref.current) return;

      setIsTruncated(
        ref.current.scrollHeight > ref.current.clientHeight ||
          ref.current.scrollWidth > ref.current.clientWidth,
      );
    };

    checkTruncation();

    window.addEventListener("resize", checkTruncation);

    return () => window.removeEventListener("resize", checkTruncation);
  }, [text]);

  return (
    <>
      {isTruncated && <Tooltip target=".truncate-tooltip" />}

      <p
        ref={ref}
        className={`truncate-tooltip line-clamp-${lines} break-words ${className}`}
        data-pr-tooltip={isTruncated ? text : undefined}
      >
        {text}
      </p>
    </>
  );
};

export default memo(TruncatedText);
