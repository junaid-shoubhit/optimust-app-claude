import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  FileBarChart2,
  FileCheck2,
  FileX2,
  FolderOpen,
  FolderSearch,
  Inbox,
  Loader2,
  Send,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../../services/apiBinding";

/* -------------------------------------------------------------------------- */
/*                           REPORT ICON CONFIG                                */
/* -------------------------------------------------------------------------- */

const REPORT_ICON_CONFIG = {
  1: {
    icon: Inbox,
    iconBg: "var(--color-creame)",
    iconColor: "var(--color-bgdarkbrown)",
  },

  2: {
    icon: CalendarDays,
    iconBg: "var(--color-bgTwo)",
    iconColor: "var(--color-bgSeven)",
  },

  3: {
    icon: BriefcaseBusiness,
    iconBg: "var(--color-creame)",
    iconColor: "var(--color-bgdarkbrown)",
  },

  4: {
    icon: FileX2,
    iconBg: "#fef2f2",
    iconColor: "#ef4444",
  },

  7: {
    icon: UserPlus,
    iconBg: "#f5f3ff",
    iconColor: "#8b5cf6",
  },

  10: {
    icon: FolderOpen,
    iconBg: "#fff7ed",
    iconColor: "#f97316",
  },

  11: {
    icon: FileCheck2,
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
  },

  12: {
    icon: Send,
    iconBg: "#ecfeff",
    iconColor: "#0891b2",
  },
};

/* -------------------------------------------------------------------------- */
/*                              DEFAULT ICON                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_REPORT_ICON = {
  icon: FileBarChart2,
  iconBg: "var(--color-creame)",
  iconColor: "var(--color-bgdarkbrown)",
};

/* -------------------------------------------------------------------------- */
/*                         REPORT STATUS COUNT                                 */
/* -------------------------------------------------------------------------- */

const ReportStatusCount = () => {
  const navigate = useNavigate();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["report-status-count"],

    queryFn: async ({ signal }) => {
      const response = await apiRequest({
        apiPath: "Utility/GetDashboardData?procedureName=GetReportStatusCount",
        method: "post",
        signal,
      });

      return response?.data ?? [];
    },
  });

  /* ------------------------------------------------------------------------ */
  /*                              NAVIGATION                                  */
  /* ------------------------------------------------------------------------ */

  const handleReportClick = (reportId) => {
    navigate(`/reports/no-tabs/${reportId}`);
  };

  /* ------------------------------------------------------------------------ */
  /*                              LOADING                                      */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-4 min-h-[125px] animate-pulse"
          >
            <div className="h-9 w-9 rounded-xl bg-gray-200 mb-5" />

            <div className="h-7 w-16 rounded bg-gray-200 mb-2" />

            <div className="h-4 w-full rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                UI                                        */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {reports.map((report) => {
          const config =
            REPORT_ICON_CONFIG[report.reportId] ?? DEFAULT_REPORT_ICON;

          const Icon = config.icon;

          return (
            <button
              key={report.reportId}
              type="button"
              onClick={() => handleReportClick(report.reportId)}
              className="
                group
                text-left
                rounded-2xl
                border
                border-white/40
                bg-white/60
                backdrop-blur-xl
                p-4
                min-h-[125px]
                shadow-[0_10px_30px_rgba(0,0,0,0.04)]
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]
                focus:outline-none
                focus:ring-2
                focus:ring-[var(--color-bgSeven)]
              "
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
              </div>

              {/* COUNT */}
              <div className="mt-4">
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
                    mt-2
                    line-clamp-2
                    leading-4
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
    </div>
  );
};

export default ReportStatusCount;
