import React, { useMemo } from "react";
import {
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  UserX,
  Hourglass,
  Layers,
  AlertTriangle,
} from "lucide-react";

const STATUS_STATS = [
  {
    key: "~WIP",
    label: "WIP",
    icon: Clock,
    dot: "bg-sky-500",
    accent: "text-sky-600",
    accentBg: "bg-sky-500/10",
    ring: "hover:border-sky-300",
  },
  {
    key: "~Assigned",
    label: "Assigned",
    icon: UserCheck,
    dot: "bg-indigo-500",
    accent: "text-indigo-600",
    accentBg: "bg-indigo-500/10",
    ring: "hover:border-indigo-300",
  },
  {
    key: "~Completed",
    label: "Completed",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-500/10",
    ring: "hover:border-emerald-300",
  },
  {
    key: "~Canceled",
    label: "Canceled",
    icon: XCircle,
    dot: "bg-rose-400",
    accent: "text-rose-600",
    accentBg: "bg-rose-500/10",
    ring: "hover:border-rose-300",
  },
  {
    key: "~Not Assigned",
    label: "Not Assigned",
    icon: UserX,
    dot: "bg-slate-400",
    accent: "text-slate-500",
    accentBg: "bg-slate-500/10",
    ring: "hover:border-slate-300",
  },
  {
    key: "~Pending",
    label: "Pending",
    icon: Hourglass,
    dot: "bg-amber-500",
    accent: "text-amber-600",
    accentBg: "bg-amber-500/10",
    ring: "hover:border-amber-300",
  },
];

const TOLERANCE_STATS = [
  { key: "~ > Tolerance", label: "> Tol", danger: true },
  { key: "~Today Total", label: "Today" },
  { key: "~ < 30", label: "<30" },
  { key: "~ 30+", label: "30+" },
  { key: "~ 45+", label: "45+" },
  { key: "~ 60+", label: "60+" },
];

const parseCell = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const WFTasksRow = ({ row, onOpenDetails }) => {
  const statusData = useMemo(
    () =>
      STATUS_STATS.map((s) => ({
        ...s,
        parsed: row ? parseCell(row[s.key]) : null,
      })),
    [row],
  );

  const statusTotal = useMemo(
    () => statusData.reduce((sum, s) => sum + (s.parsed?.value ?? 0), 0),
    [statusData],
  );

  if (!row) return null;

  const typeName = row["task Type Name"];
  const subtypeName = row["task Subtype Name"];
  const toleranceDays = row["task Tolerance in Days"];
  const grandTotal = parseCell(row["~Grand Total"]);
  const overTolerance = parseCell(row["~ > Tolerance"]);
  const riskCount = overTolerance?.value ?? 0;
  const hasRisk = riskCount > 0;

  const openPanel = (parsed, label) => {
    if (!parsed) return;
    onOpenDetails?.(parsed, label, typeName, subtypeName);
  };

  return (
    <div
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-white pl-4 pr-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]
        ${hasRisk ? "border-rose-200/80" : "border-[var(--border-primary)]"}
      `}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 rounded-r-full ${
          hasRisk
            ? "bg-gradient-to-b from-rose-400 to-rose-500"
            : "bg-gradient-to-b from-slate-200 to-slate-300"
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
              {typeName || "Untitled"}
            </h3>
            {hasRisk && (
              <span
                className="flex items-center gap-0.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 ring-1 ring-inset ring-rose-200"
                title={`${riskCount} task(s) past tolerance`}
              >
                <AlertTriangle className="h-2.5 w-2.5" />
                {riskCount}
              </span>
            )}
          </div>
          {subtypeName ? (
            <span className="mt-0.5 block truncate text-xs font-medium text-[var(--text-muted)]">
              {subtypeName}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          disabled={!grandTotal?.Link}
          onClick={() => openPanel(grandTotal, "Grand Total")}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--background-box)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors duration-150 enabled:hover:border-slate-300 enabled:hover:bg-[var(--background-table-active)] disabled:cursor-default"
        >
          <Layers className="h-3 w-3 opacity-70" />
          <span className="tabular-nums">{grandTotal?.value ?? 0}</span>
          <span className="hidden font-normal text-[var(--text-muted)] sm:inline">
            total
          </span>
        </button>
      </div>

      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--background-box)]">
        {statusTotal > 0 ? (
          statusData.map(({ key, dot, parsed }) => {
            const value = parsed?.value ?? 0;
            if (!value) return null;
            return (
              <div
                key={key}
                className={`${dot} h-full transition-[width] duration-300 first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${(value / statusTotal) * 100}%` }}
              />
            );
          })
        ) : (
          <div className="h-full w-full rounded-full bg-[var(--background-box)]" />
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {statusData.map(
          ({ key, label, icon: Icon, accent, accentBg, ring, parsed }) => {
            const clickable = Boolean(parsed?.Link);
            const value = parsed?.value ?? 0;
            return (
              <button
                key={key}
                type="button"
                disabled={!clickable}
                onClick={() => openPanel(parsed, label)}
                title={label}
                className={`flex items-center gap-1.5 rounded-lg border border-transparent ${accentBg} px-2 py-1 transition-all duration-150
                ${clickable ? `cursor-pointer ${ring} hover:shadow-sm` : "cursor-default opacity-80"}
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-400
              `}
              >
                <Icon className={`h-3.5 w-3.5 ${accent}`} />
                <span className="text-xs font-semibold tabular-nums text-[var(--text-primary)]">
                  {value}
                </span>
                <span className="text-[10px] font-medium text-[var(--text-muted)]">
                  {label}
                </span>
              </button>
            );
          },
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-dashed border-[var(--border-primary)] pt-2.5">
        <span className="mr-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Tolerance{toleranceDays ? ` · ${toleranceDays}d` : ""}
        </span>
        {TOLERANCE_STATS.map(({ key, label, danger }) => {
          const parsed = parseCell(row[key]);
          const clickable = Boolean(parsed?.Link);
          const value = parsed?.value ?? 0;
          const isDangerActive = danger && value > 0;
          return (
            <button
              key={key}
              type="button"
              disabled={!clickable}
              onClick={() => openPanel(parsed, label)}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors duration-150
                ${isDangerActive ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30" : "bg-[var(--background-table)] text-[var(--text-primary)]"}
                ${clickable ? "cursor-pointer hover:brightness-95" : "cursor-default"}
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-400
              `}
            >
              {isDangerActive && <AlertTriangle className="h-2.5 w-2.5" />}
              {label}{" "}
              <span className="font-semibold tabular-nums">{value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WFTasksRow;
