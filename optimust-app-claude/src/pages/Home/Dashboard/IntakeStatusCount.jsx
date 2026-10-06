import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReportNavigation } from "../../../navigation/useReportPath";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ChevronDown,
  FileBarChart2,
  UserPlus,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { apiRequest } from "../../../services/apiBinding";
import { Card, CardHeader, ErrorState } from "./DashboardUI";
import { percentOf } from "./dashboardUtils";

/* -------------------------------------------------------------------------- */
/*                         INTAKE STATUS CONFIG                               */
/* -------------------------------------------------------------------------- */

const INTAKE_STATUS_CONFIG = {
  new_Lead: {
    name: "New Lead",
    color: "var(--color-bgSeven)",
  },

  pending_Contact: {
    name: "Pending Contact",
    color: "var(--color-bgdarkbrown)",
  },

  pending_Info: {
    name: "Pending Info",
    color: "#f59e0b",
  },

  needs_Attorney_Review: {
    name: "Attorney Review",
    color: "#8b5cf6",
  },

  retainer_Sent: {
    name: "Retainer Sent",
    color: "#06b6d4",
  },

  intake: {
    name: "Intake",
    color: "var(--color-bgSix)",
  },

  reject_Lead: {
    name: "Rejected Lead",
    color: "#ef4444",
  },

  pending_Records: {
    name: "Pending Records",
    color: "#84cc16",
  },
};

/* -------------------------------------------------------------------------- */
/*                         REPORT ICON CONFIG                                 */
/* -------------------------------------------------------------------------- */

const REPORT_ICON_CONFIG = {
  1: {
    icon: FileBarChart2,
    iconBg: "var(--color-creame)",
    iconColor: "var(--color-bgdarkbrown)",
  },

  4: {
    icon: FileBarChart2,
    iconBg: "#fef2f2",
    iconColor: "#ef4444",
  },
};

const DEFAULT_REPORT_ICON = {
  icon: FileBarChart2,
  iconBg: "var(--color-creame)",
  iconColor: "var(--color-bgdarkbrown)",
};

/* -------------------------------------------------------------------------- */
/*                              PIE TOOLTIP                                   */
/* -------------------------------------------------------------------------- */

const PieTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-lg border border-gray-100 text-sm">
      <div className="flex items-center gap-2 font-semibold text-gray-700">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        {item.name}
      </div>

      <div className="text-gray-500 mt-0.5">
        {item.value} intakes · {percentOf(item.value, total)}%
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                         INTAKE STATUS COUNT                                */
/* -------------------------------------------------------------------------- */

const IntakeStatusCount = ({ reports = [], isLoading: isReportsLoading }) => {
  const { openReport, prefetchReports } = useReportNavigation();

  const [activeName, setActiveName] = useState(null);

  const legendRef = useRef(null);

  // Shown only while the list overflows and is scrolled to the top.
  const [showScrollHint, setShowScrollHint] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                           EXISTING API                                   */
  /* ------------------------------------------------------------------------ */

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["intake-status-count"],

    queryFn: async ({ signal }) => {
      const response = await apiRequest({
        apiPath: "Utility/GetDashboardData?procedureName=GetintakeStatusCount",
        method: "post",
        signal,
      });

      return response?.data?.[0] || {};
    },
  });

  /* ------------------------------------------------------------------------ */
  /*                              PIE DATA                                    */
  /* ------------------------------------------------------------------------ */

  const intakeStatus = useMemo(() => {
    return Object.entries(INTAKE_STATUS_CONFIG).map(([key, config]) => ({
      name: config.name,
      value: Number(data?.[key] ?? 0),
      color: config.color,
    }));
  }, [data]);

  const total = intakeStatus.reduce((sum, item) => sum + item.value, 0);

  // Zero-value slices render as stray padding gaps, so leave them out of the ring.
  const pieData = intakeStatus.filter((item) => item.value > 0);

  const activeItem = intakeStatus.find((item) => item.name === activeName);

  /* ------------------------------------------------------------------------ */
  /*                          LEGEND SCROLL HINT                              */
  /* ------------------------------------------------------------------------ */

  const updateScrollHint = useCallback(() => {
    const el = legendRef.current;

    if (!el) return;

    const isScrollable = el.scrollHeight > el.clientHeight + 1;

    setShowScrollHint(isScrollable && el.scrollTop <= 4);
  }, []);

  useEffect(() => {
    const el = legendRef.current;

    if (!el) return;

    updateScrollHint();

    const observer = new ResizeObserver(updateScrollHint);

    observer.observe(el);

    return () => observer.disconnect();
  }, [updateScrollHint, isError, isLoading]);

  const handleScrollHintClick = () => {
    const el = legendRef.current;

    el?.scrollBy({ top: el.clientHeight * 0.8, behavior: "smooth" });
  };

  /* ------------------------------------------------------------------------ */
  /*                            NAVIGATION                                    */
  /* ------------------------------------------------------------------------ */

  const handleReportClick = (reportId) => openReport(reportId);

  /* ------------------------------------------------------------------------ */
  /*                               DONUT                                      */
  /* ------------------------------------------------------------------------ */

  const renderDonut = () => {
    if (isLoading) {
      return (
        <div className="h-[200px] w-[200px] rounded-full border-[28px] border-gray-200 animate-pulse" />
      );
    }

    return (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<PieTooltip total={total} />} />

            {pieData.length > 0 ? (
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={100}
                paddingAngle={pieData.length > 1 ? 3 : 0}
                cornerRadius={6}
                stroke="none"
                onMouseEnter={(_, index) => setActiveName(pieData[index]?.name)}
                onMouseLeave={() => setActiveName(null)}
              >
                {pieData.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                    fillOpacity={
                      !activeName || activeName === item.name ? 1 : 0.3
                    }
                    style={{
                      transition: "fill-opacity 150ms",
                      outline: "none",
                    }}
                  />
                ))}
              </Pie>
            ) : (
              // Placeholder ring so the empty state keeps the card's shape.
              <Pie
                data={[{ name: "empty", value: 1 }]}
                dataKey="value"
                innerRadius={72}
                outerRadius={100}
                fill="#e5e7eb"
                stroke="none"
                isAnimationActive={false}
                tooltipType="none"
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-3xl font-black leading-none tabular-nums"
            style={{ color: activeItem?.color ?? "var(--color-fontFour)" }}
          >
            {(activeItem?.value ?? total).toLocaleString()}
          </span>

          <span className="text-xs font-medium text-gray-500 mt-1.5 max-w-[110px] text-center truncate">
            {activeItem?.name ?? "Total Intakes"}
          </span>
        </div>
      </>
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                               LEGEND                                     */
  /* ------------------------------------------------------------------------ */

  const renderLegend = () => (
    <div className="relative flex-1 min-w-0 w-full">
      <ul
        ref={legendRef}
        onScroll={updateScrollHint}
        className="space-y-1 w-full max-h-[240px] overflow-y-auto custom-scroll pr-1"
        aria-label="Intake status breakdown"
      >
        {intakeStatus.map((item) => {
          const percent = percentOf(item.value, total);

          const isDimmed = activeName && activeName !== item.name;

          return (
            <li
              key={item.name}
              onMouseEnter={() => setActiveName(item.name)}
              onMouseLeave={() => setActiveName(null)}
              className={`rounded-xl px-2.5 py-1.5 transition-all ${
                activeName === item.name ? "bg-white/80" : ""
              } ${isDimmed ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />

                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--color-fontFour)" }}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 shrink-0">
                  {isLoading ? (
                    <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
                  ) : (
                    <>
                      <span
                        className={`font-bold tabular-nums ${
                          item.value === 0 ? "text-gray-400" : ""
                        }`}
                        style={
                          item.value === 0
                            ? undefined
                            : { color: "var(--color-fontFour)" }
                        }
                      >
                        {item.value}
                      </span>

                      <span className="text-xs text-gray-400 w-9 text-right tabular-nums">
                        {percent}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Share bar */}
              <div className="mt-1 h-1 rounded-full bg-gray-200/70 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: isLoading ? 0 : `${percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Scroll indicator */}
      {showScrollHint && (
        <button
          type="button"
          onClick={handleScrollHintClick}
          aria-label="Scroll down for more statuses"
          title="More statuses"
          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bgSeven)]"
        >
          <ChevronDown size={14} style={{ color: "var(--color-bgSeven)" }} />
        </button>
      )}
    </div>
  );

  return (
    <div className="xl:col-span-6 flex flex-col h-full">
      <Card className="p-5 h-full">
        <CardHeader
          icon={UserPlus}
          title="Case Intake Status"
          subtitle={
            total > 0
              ? "Hover a status to see its share"
              : "Current pipeline breakdown"
          }
        />

        {/* ---------------------------------------------------------------- */}
        {/* GRAPH + STATUS LEGEND                                            */}
        {/* ---------------------------------------------------------------- */}

        {isError ? (
          <ErrorState onRetry={refetch} className="h-[240px]" />
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-[220px] h-[220px] flex items-center justify-center relative shrink-0">
              {renderDonut()}
            </div>

            {renderLegend()}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* REPORT CARDS                                                      */}
        {/* ---------------------------------------------------------------- */}

        {(isReportsLoading || reports.length > 0) && (
          <div className="border-t border-gray-200/60 mt-5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isReportsLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white/50 px-3 py-3 min-h-[76px] animate-pulse"
                    aria-hidden="true"
                  >
                    <div className="h-6 w-12 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
                  </div>
                ))
              : reports.map((report) => {
                  const config =
                    REPORT_ICON_CONFIG[report.reportId] ?? DEFAULT_REPORT_ICON;

                  const Icon = config.icon;

                  const isNavigable = Boolean(report.reportId);

                  return (
                    <button
                      key={`${report.reportId}-${report.reportName}`}
                      type="button"
                      disabled={!isNavigable}
                      onClick={() => handleReportClick(report.reportId)}
                      onMouseEnter={isNavigable ? prefetchReports : undefined}
                      aria-label={`${report.reportName}: ${report.count ?? 0}${
                        isNavigable ? ", open report" : ""
                      }`}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        text-left
                        rounded-2xl
                        border
                        border-white/50
                        bg-white/50
                        backdrop-blur-xl
                        px-3
                        py-3
                        transition-all
                        duration-200
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[var(--color-bgSeven)]
                        ${
                          isNavigable
                            ? `
                              cursor-pointer
                              hover:-translate-y-0.5
                              hover:bg-white/80
                              hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]
                            `
                            : "cursor-default"
                        }
                      `}
                    >
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: config.iconBg }}
                      >
                        <Icon size={18} style={{ color: config.iconColor }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="text-xl font-black leading-none tabular-nums"
                          style={{ color: "var(--color-fontFour)" }}
                        >
                          {(report.count ?? 0).toLocaleString()}
                        </div>

                        <p
                          className="text-xs font-medium mt-1 line-clamp-2 leading-4 text-gray-500"
                          title={report.reportName}
                        >
                          {report.reportName}
                        </p>
                      </div>

                      {isNavigable && (
                        <ArrowUpRight
                          size={17}
                          className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                          style={{ color: "var(--color-fontFour)" }}
                        />
                      )}
                    </button>
                  );
                })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default IntakeStatusCount;
