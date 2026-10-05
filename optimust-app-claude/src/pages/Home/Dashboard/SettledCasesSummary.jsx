import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Banknote,
  Hourglass,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { apiRequest } from "../../../services/apiBinding";
import { Card, EmptyState, ErrorState } from "./DashboardUI";
import { useReportNavigation } from "../../../navigation/useReportPath";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "./dashboardUtils";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const AMOUNT_KEY = "settlement Amount";

const QUERY_KEY = "settled-cases-settled-collected-amount";

/** Reporting periods; each has its own procedure (and report link). */
const PERIODS = [
  {
    key: "all",
    label: "All time",
    title: "Settled Cases",
    procedure: "Dashboards_SettledCases_SettledCollectedAmount",
    summary: "settled across cases",
    emptyHint: "No settlements recorded yet",
  },
  {
    key: "mtd",
    label: "Current month",
    title: "Settled Cases MTD",
    procedure: "Dashboards_SettledCases_SettledCollectedAmountMTD",
    summary: "settled this month",
    emptyHint: "No settlements yet this month",
  },
  {
    key: "previous-month",
    label: "Previous month",
    title: "Settled Cases Previous Month",
    procedure: "Dashboards_SettledCases_SettledCollectedAmountPreviousMonth",
    summary: "settled last month",
    emptyHint: "No settlements last month",
  },
];

const COLLECTED_COLOR = "#16a34a";
const OUTSTANDING_COLOR = "var(--color-bgdarkbrown)";

const COUNT_UP_MS = 900;

const findByLabel = (rows, keyword) =>
  rows.find((row) => row.label.toLowerCase().includes(keyword));

/* -------------------------------------------------------------------------- */
/*                                 COUNT UP                                   */
/* -------------------------------------------------------------------------- */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Eases a number from 0 to `target` once; instant with reduced motion. */
const useCountUp = (target) => {
  const [value, setValue] = useState(() =>
    prefersReducedMotion() ? target : 0,
  );

  useEffect(() => {
    if (prefersReducedMotion() || !target) {
      setValue(target);
      return;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      const eased = 1 - (1 - progress) ** 3;

      setValue(target * eased);

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
};

/* -------------------------------------------------------------------------- */
/*                               HERO (SETTLED)                               */
/* -------------------------------------------------------------------------- */

const SettledHero = ({ label, amount, collectionRate, reportId, period }) => {
  const { openReport, prefetchReports } = useReportNavigation();

  const animated = useCountUp(amount);

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-6 h-full flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, var(--color-bgFive), var(--color-bgSeven))",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-white/75 text-sm font-semibold">
          <Scale size={16} />
          {label}
        </div>

        {reportId && (
          <button
            type="button"
            onClick={() => openReport(reportId)}
            onMouseEnter={prefetchReports}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            View report
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>

      <p
        className="relative z-10 mt-5 text-3xl xl:text-4xl font-black text-white leading-none tabular-nums"
        title={formatCurrency(amount)}
      >
        {formatCurrency(animated)}
      </p>

      <p className="relative z-10 mt-2 text-sm text-white/60">
        {amount > 0
          ? `≈ ${formatCompactCurrency(amount)} ${period.summary}`
          : period.emptyHint}
      </p>

      <div className="relative z-10 mt-auto pt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
          <TrendingUp size={14} />
          {formatPercent(collectionRate)} collected so far
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 STAT TILE                                  */
/* -------------------------------------------------------------------------- */

const StatTile = ({ icon, label, amount, caption, color }) => {
  const Icon = icon;

  const animated = useCountUp(amount);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/60 p-4 min-w-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 10%, white), rgba(255,255,255,0.7))`,
      }}
    >
      {/* Accent edge */}
      <span
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2.5 pl-1">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm">
          <Icon size={18} style={{ color }} />
        </div>

        <p className="text-sm font-medium text-gray-500 truncate" title={label}>
          {label}
        </p>
      </div>

      <p
        className="mt-3 pl-1 text-2xl font-black leading-none tabular-nums truncate"
        style={{ color: "var(--color-fontFour)" }}
        title={formatCurrency(amount)}
      >
        {formatCurrency(animated)}
      </p>

      <p className="mt-1.5 pl-1 text-xs text-gray-400">{caption}</p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            COLLECTION BREAKDOWN                            */
/* -------------------------------------------------------------------------- */

const CollectionBreakdown = ({
  collected,
  outstanding,
  collectionRate,
  hasSettlements,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Grow the bar in on first paint.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  const collectedWidth = Math.min(100, collectionRate);

  const segments = [
    {
      key: "collected",
      label: "Collected",
      amount: collected,
      color: COLLECTED_COLOR,
    },
    {
      key: "outstanding",
      label: "Outstanding",
      amount: outstanding,
      color: OUTSTANDING_COLOR,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/60 bg-white/50 p-4">
      <div className="flex items-center justify-between text-sm mb-3">
        <span
          className="font-semibold"
          style={{ color: "var(--color-fontFour)" }}
        >
          Collection progress
        </span>

        <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-green-50 text-green-700 tabular-nums">
          {formatPercent(collectionRate)}
        </span>
      </div>

      {/* Two-part bar: collected | outstanding, with a 2px gap between.
          Neutral track when nothing was settled, so it doesn't read as
          "all outstanding". */}
      <div
        className="flex h-3.5 gap-0.5 rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Collected share of settled amount"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(collectionRate.toFixed(2))}
      >
        <div
          className="h-full rounded-l-full transition-[width] duration-1000 ease-out"
          style={{
            width: isMounted ? `${collectedWidth}%` : 0,
            // Keep a sliver visible when something was collected.
            minWidth: collected > 0 ? 6 : 0,
            backgroundColor: COLLECTED_COLOR,
          }}
        />

        <div
          className="h-full flex-1 rounded-r-full"
          style={
            hasSettlements
              ? { backgroundColor: OUTSTANDING_COLOR, opacity: 0.85 }
              : { backgroundColor: "#e5e7eb" }
          }
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-500">{segment.label}</span>
            <span
              className="font-semibold tabular-nums"
              style={{ color: "var(--color-fontFour)" }}
            >
              {formatCompactCurrency(segment.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  SKELETON                                  */
/* -------------------------------------------------------------------------- */

const SummarySkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" aria-hidden="true">
    <div className="lg:col-span-5 h-[220px] rounded-[24px] bg-gray-200 animate-pulse" />

    <div className="lg:col-span-7 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-[110px] rounded-2xl bg-gray-200/70 animate-pulse" />
        <div className="h-[110px] rounded-2xl bg-gray-200/70 animate-pulse" />
      </div>

      <div className="h-[94px] rounded-2xl bg-gray-200/70 animate-pulse" />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                           SETTLED CASES SUMMARY                            */
/* -------------------------------------------------------------------------- */

const fetchSettledAmounts = async (procedure, signal) => {
  const response = await apiRequest({
    apiPath: `Utility/GetDashboardData?procedureName=${procedure}`,
    method: "post",
    signal,
  });

  const rows = response?.data || [];

  if (rows?.[0]?.message === "No data found") return [];

  return rows.filter((row) => row?.datasetLabel);
};

const SettledCasesSummary = () => {
  const [periodKey, setPeriodKey] = useState(PERIODS[0].key);

  // Both periods load up front so switching between them is instant.
  const queries = useQueries({
    queries: PERIODS.map((item) => ({
      queryKey: [QUERY_KEY, item.key],
      queryFn: ({ signal }) => fetchSettledAmounts(item.procedure, signal),
    })),
  });

  const periodIndex = PERIODS.findIndex((item) => item.key === periodKey);

  const period = PERIODS[periodIndex];

  const { data = [], isLoading, isError, refetch } = queries[periodIndex];

  /* ------------------------------------------------------------------------ */
  /*                                 DERIVED                                  */
  /* ------------------------------------------------------------------------ */

  const rows = useMemo(
    () =>
      data.map((row) => ({
        label: row.datasetLabel,
        amount: Number(row[AMOUNT_KEY]) || 0,
      })),
    [data],
  );

  const settled = findByLabel(rows, "settled");
  const collected = findByLabel(rows, "collected");

  const settledAmount = settled?.amount ?? 0;
  const collectedAmount = collected?.amount ?? 0;

  const outstanding = Math.max(0, settledAmount - collectedAmount);

  const collectionRate =
    settledAmount > 0 ? (collectedAmount / settledAmount) * 100 : 0;

  const reportId = data.find((row) => row.report_id)?.report_id;

  /* ------------------------------------------------------------------------ */
  /*                                   BODY                                   */
  /* ------------------------------------------------------------------------ */

  const renderBody = () => {
    if (isLoading) return <SummarySkeleton />;

    if (isError) return <ErrorState onRetry={refetch} className="h-[200px]" />;

    if (!settled && !collected) {
      return (
        <EmptyState
          title="No settlement data"
          description="Settled and collected amounts will appear here once recorded."
          className="h-[200px]"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <SettledHero
            label={settled?.label ?? "Total Settled Amount"}
            amount={settledAmount}
            collectionRate={collectionRate}
            reportId={reportId}
            period={period}
          />
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatTile
              icon={Wallet}
              label={collected?.label ?? "Total Collected Amount"}
              amount={collectedAmount}
              caption={`${formatPercent(collectionRate)} of settled amount`}
              color={COLLECTED_COLOR}
            />

            <StatTile
              icon={Hourglass}
              label="Outstanding"
              amount={outstanding}
              caption="Settled but not yet collected"
              color={OUTSTANDING_COLOR}
            />
          </div>

          <CollectionBreakdown
            collected={collectedAmount}
            outstanding={outstanding}
            collectionRate={collectionRate}
            hasSettlements={settledAmount > 0}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-bgTwo)" }}
          >
            <Banknote size={20} style={{ color: "var(--color-bgSeven)" }} />
          </div>

          <div>
            <h2
              className="text-lg font-bold leading-tight"
              style={{ color: "var(--color-fontFour)" }}
            >
              {period.title}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Settled vs collected amount
            </p>
          </div>
        </div>

        {/* PERIOD TOGGLE */}
        <div
          role="group"
          aria-label="Reporting period"
          className="inline-flex rounded-xl bg-white/70 border border-gray-200/70 p-1"
        >
          {PERIODS.map((item) => {
            const isActive = item.key === periodKey;

            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPeriodKey(item.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bgSeven)] ${
                  isActive
                    ? "text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, var(--color-bgFive), var(--color-bgSeven))",
                      }
                    : undefined
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {renderBody()}
    </Card>
  );
};

export default SettledCasesSummary;
