import classNames from "classnames";

import { STATUS_THEME, TOLERANCE_THEME } from "./wfConstants";
import { parseStatValue } from "./wfUtils";

export const createStatusTemplate = (field, onStatClick) => {
  return (value) => {
    const { value: count, data } = parseStatValue(value);
    const theme = STATUS_THEME[field];
    if (!theme) return count;
    const Icon = theme.icon;
    const isClickable = Boolean(data?.Link) && Boolean(data?.value);

    return (
      <button
        type="button"
        disabled={!isClickable}
        onClick={(event) => {
          event.stopPropagation();

          if (isClickable) {
            onStatClick(data);
          }
        }}
        className={classNames(
          "inline-flex items-center justify-center",
          "gap-1.5 rounded-lg border px-2.5 py-1.5",
          "text-xs font-semibold transition-all duration-200",
          theme.text,
          theme.bg,
          theme.border,
          theme.hover,
          isClickable ? "cursor-pointer hover:shadow-sm" : "cursor-default",
        )}
      >
        <span>{count}</span>
      </button>
    );
  };
};

export const createToleranceTemplate = (field, onStatClick) => {
  return (value) => {
    const { value: count, data } = parseStatValue(value);
    const theme = TOLERANCE_THEME[field];

    if (!theme) return count;
    const isClickable = Boolean(data?.Link) && Boolean(data?.value);
    return (
      <button
        type="button"
        disabled={!isClickable}
        onClick={(event) => {
          event.stopPropagation();

          if (isClickable) {
            onStatClick(data);
          }
        }}
        className={classNames(
          "inline-flex min-w-[52px] items-center justify-center",
          "rounded-md border px-2.5 py-1",
          "text-xs font-semibold transition-all duration-200",
          theme.text,
          theme.bg,
          theme.border,
          theme.hover,
          isClickable ? "cursor-pointer hover:shadow-sm" : "cursor-default",
        )}
      >
        {count}
      </button>
    );
  };
};

export const createGrandTotalTemplate = (onStatClick) => {
  return (value) => {
    const { value: count, data } = parseStatValue(value);

    const isClickable = Boolean(data?.Link);

    return (
      <button
        type="button"
        disabled={!isClickable}
        onClick={(event) => {
          event.stopPropagation();

          if (isClickable) {
            onStatClick(data);
          }
        }}
        className={classNames(
          "inline-flex min-w-[58px] items-center justify-center",
          "rounded-lg border border-violet-200",
          "bg-violet-50 px-3 py-1.5",
          "text-xs font-bold text-violet-700",
          "transition-all duration-200",
          isClickable
            ? [
                "cursor-pointer",
                "hover:border-violet-300",
                "hover:bg-violet-100",
                "hover:shadow-sm",
              ]
            : "cursor-default",
        )}
      >
        {count}
      </button>
    );
  };
};

export const createColumnHeader = (label, parameterName) => {
  const Icon = STATUS_THEME[parameterName]?.icon;
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Icon && <Icon size={14} strokeWidth={2} />}
      <span>{label}</span>
    </div>
  );
};
