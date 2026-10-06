/* -------------------------------------------------------------------------- */
/*                                  PALETTE                                   */
/* -------------------------------------------------------------------------- */

export const STATUS_COLORS = [
  "var(--color-bgSeven)",
  "var(--color-bgdarkbrown)",
  "var(--color-bgSix)",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#ef4444",
  "#f59e0b",
];

export const percentOf = (value, total) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

/**
 * Percentage with precision that scales to its size, so small shares don't
 * collapse to "0%": 0.0025 -> "<0.01%", 0.4 -> "0.4%", 37.25 -> "37.3%".
 */
export const formatPercent = (value) => {
  if (!value) return "0%";

  if (value < 0.01) return "<0.01%";

  const digits = value < 1 ? 2 : 1;

  return `${Number(value.toFixed(digits))}%`;
};

/* -------------------------------------------------------------------------- */
/*                                  CURRENCY                                  */
/* -------------------------------------------------------------------------- */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
  trailingZeroDisplay: "stripIfInteger",
});

/** $36,366,013 */
export const formatCurrency = (value) => currencyFormatter.format(value || 0);

/** $36.4M — for axes and headline totals. */
export const formatCompactCurrency = (value) =>
  compactCurrencyFormatter.format(value || 0);

/** Groups `items` by the value returned from `getStatus` into chart rows. */
export const groupByStatus = (items, getStatus) => {
  const grouped = items.reduce((acc, item) => {
    const status = getStatus(item)?.trim() || "Unknown";

    acc[status] = (acc[status] || 0) + 1;

    return acc;
  }, {});

  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: STATUS_COLORS[index % STATUS_COLORS.length],
    }));
};
