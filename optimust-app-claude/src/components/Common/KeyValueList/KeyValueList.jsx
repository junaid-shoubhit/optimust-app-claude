import React, { memo } from "react";
import { formatDateUI } from "../../../utils/constant";
import TruncatedText from "./TruncatedText";

/**
 * Skeleton Loader
 */

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
};

const Skeleton = ({ rows = 6, variant = "list" }) => {
  const isGrid = variant === "grid";

  return (
    <div
      className={`animate-pulse ${
        isGrid ? "grid grid-cols-6 gap-1" : "grid gap-3"
      }`}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid gap-2">
          <div
            className={`${
              isGrid ? "h-2 w-32" : "h-3 w-32"
            } bg-gray-200 rounded`}
          />
          <div
            className={`${
              isGrid ? "h-3 w-40" : "h-4 w-48"
            } bg-gray-300 rounded`}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Value Resolver
 */
const resolveValue = (data, { key, type }) => {
  const raw = data?.[key];
  // Handle all empty values
  if (
    raw == null ||
    (typeof raw === "string" &&
      (raw.trim() === "" || raw.toLowerCase() === "null"))
  ) {
    return "--";
  }
  switch ((type || "").toLowerCase()) {
    case "date":
      return formatDateUI(raw);

    case "datetime":
      return formatDateUI(raw, type);

    case "bit":
    case "boolean":
      return raw === true ||
        raw === 1 ||
        raw === "1" ||
        String(raw).toLowerCase() === "true"
        ? "Yes"
        : "No";

    case "array-label":
      return Array.isArray(raw)
        ? raw
            .map((x) => x?.label)
            .filter(Boolean)
            .join(", ")
        : "--";

    case "array-value":
      return Array.isArray(raw)
        ? raw
            .map((x) => x?.value)
            .filter(Boolean)
            .join(", ")
        : "--";

    case "object-label":
      return raw?.label || "--";

    default:
      return raw;
  }
};

/**
 * Reusable KeyValueList
 */
const KeyValueList = ({
  data,
  fields = [],
  isLoading,
  isError,
  errorMessage,
  variant = "grid", // 🔥 "list" | "grid"
  columns = 12, // for grid layout
}) => {
  if (isLoading)
    return <Skeleton rows={fields.length || 5} variant={variant} />;

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        {errorMessage || "Failed to load data"}
      </p>
    );
  }
  const isList = variant === "list";

  return !isList ? (
    <div className={`grid ${gridCols[columns] || "grid-cols-12"} gap-1`}>
      {fields.map(({ label, key, render, type }, index) => {
        const value = render ? render(data) : resolveValue(data, { key, type });

        return (
          <div className="min-w-0" key={index}>
            <p className="font-semibold text-[10px] uppercase text-[#6B7280]">
              {label}
            </p>
            <TruncatedText
              value={value}
              className="text-(--color-fontFour) font-semibold text-xs"
            />
          </div>
        );
      })}
    </div>
  ) : (
    <>
      {fields.map(({ label, key, render, type }, index) => {
        const value = render ? render(data) : resolveValue(data, { key, type });

        return (
          <div key={index} className="grid gap-1 min-w-0">
            <p className="text-(--color-fontFour) text-xs">{label}</p>
            {/* <p className="text-(--color-fontFour) font-semibold text-xs">
              {value || "--"}
            </p> */}
            {/* <p
              className="text-(--color-fontFour) font-semibold text-xs line-clamp-2 break-words"
              title={String(value || "--")}
            >
              {value || "--"}
            </p> */}
            <TruncatedText
              value={value}
              className="text-(--color-fontFour) font-semibold text-xs"
            />
          </div>
        );
      })}
    </>
  );
};

export default memo(KeyValueList);
