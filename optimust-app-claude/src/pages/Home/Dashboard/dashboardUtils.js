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
