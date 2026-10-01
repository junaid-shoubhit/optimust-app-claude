import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CircleDot, FileBarChart2 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { apiRequest } from "../../../services/apiBinding";

/* -------------------------------------------------------------------------- */
/*                                  CARD                                      */
/* -------------------------------------------------------------------------- */

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`
        rounded-[28px]
        border
        border-white/40
        shadow-[0_10px_30px_rgba(0,0,0,0.04)]
        backdrop-blur-xl
        bg-white/60
        ${className}
      `}
    >
      {children}
    </div>
  );
};

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
/*                         INTAKE STATUS COUNT                                */
/* -------------------------------------------------------------------------- */

const IntakeStatusCount = ({ reports = [] }) => {
  const navigate = useNavigate();

  /* ------------------------------------------------------------------------ */
  /*                           EXISTING API                                   */
  /* ------------------------------------------------------------------------ */

  const { data, isLoading } = useQuery({
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
  /*                         EXISTING PIE DATA                                */
  /* ------------------------------------------------------------------------ */

  const intakeStatus = useMemo(() => {
    return Object.entries(INTAKE_STATUS_CONFIG).map(([key, config]) => ({
      name: config.name,
      value: data?.[key] ?? 0,
      color: config.color,
    }));
  }, [data]);

  /* ------------------------------------------------------------------------ */
  /*                            NAVIGATION                                    */
  /* ------------------------------------------------------------------------ */

  const handleReportClick = (reportId) => {
    if (!reportId) return;

    navigate(`/reports/no-tabs/${reportId}`);
  };

  return (
    <div className="xl:col-span-6 flex flex-col h-full">
      {/* ------------------------------------------------------------------ */}
      {/*                     SINGLE INTAKE CARD                              */}
      {/* ------------------------------------------------------------------ */}

      <Card className="p-3 h-full">
        {/* ---------------------------------------------------------------- */}
        {/* GRAPH + STATUS LEGEND                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex justify-around items-center gap-4">
          {/* Pie Chart */}
          <div className="w-80 h-[300px] flex items-center justify-center relative shrink-0">
            {isLoading ? (
              <div className="h-40 w-40 rounded-full border-8 border-gray-200 border-t-gray-500 animate-spin" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip />

                    <Pie
                      data={intakeStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                    >
                      {intakeStatus.map((item, index) => (
                        <Cell key={`${item.name}-${index}`} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className="text-center font-semibold leading-tight"
                    style={{
                      color: "var(--color-fontFour)",
                      fontSize: "14px",
                    }}
                  >
                    Case Intake
                  </span>

                  <span
                    className="text-center font-semibold leading-tight"
                    style={{
                      color: "var(--color-fontFour)",
                      fontSize: "14px",
                    }}
                  >
                    Status
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-3 flex-1 min-w-0">
            {intakeStatus.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CircleDot
                    size={16}
                    color={item.color}
                    className="shrink-0"
                  />

                  <span
                    className="text-sm font-medium truncate"
                    style={{
                      color: "var(--color-fontFour)",
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>

                <div
                  className="font-bold min-w-[40px] text-right shrink-0"
                  style={{
                    color: "var(--color-fontFour)",
                  }}
                >
                  {isLoading ? (
                    <div className="h-4 w-8 rounded bg-gray-200 animate-pulse ml-auto" />
                  ) : (
                    item.value
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* DIVIDER                                                           */}
        {/* ---------------------------------------------------------------- */}

        {reports.length > 0 && (
          <div className="border-t border-gray-200/60 my-2" />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* REPORT CARDS                                                      */}
        {/* ---------------------------------------------------------------- */}

        {reports.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {reports.map((report) => {
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
                  className={`
                    group
                    text-left
                    rounded-2xl
                    border
                    border-white/50
                    bg-white/50
                    backdrop-blur-xl
                    px-3
                    py-2
                    min-h-[110px]
                    transition-all
                    duration-200
                    ${
                      isNavigable
                        ? `
                          cursor-pointer
                          hover:-translate-y-1
                          hover:bg-white/70
                          hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]
                        `
                        : "cursor-default"
                    }
                  `}
                >
                  {/* ICON */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: config.iconBg,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{
                          color: config.iconColor,
                        }}
                      />
                    </div>

                    {isNavigable && (
                      <ArrowUpRight
                        size={17}
                        className="
                          opacity-40
                          group-hover:opacity-100
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                          transition-all
                        "
                        style={{
                          color: "var(--color-fontFour)",
                        }}
                      />
                    )}
                  </div>

                  {/* COUNT */}
                  <div className="mt-2">
                    <h3
                      className="text-2xl font-black leading-none"
                      style={{
                        color: "var(--color-fontFour)",
                      }}
                    >
                      {report.count ?? 0}
                    </h3>

                    {/* REPORT NAME */}
                    <p
                      className="
                        text-xs
                        font-medium
                        mt-1
                        line-clamp-2
                        leading-4
                        min-h-[32px]
                      "
                      style={{
                        color: "var(--color-fontFour)",
                      }}
                      title={report.reportName}
                    >
                      {report.reportName}
                    </p>
                  </div>
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
