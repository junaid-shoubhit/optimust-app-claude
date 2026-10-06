import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  ListTodo,
  ArrowUpRight,
} from "lucide-react";
import { useReportNavigation } from "../../../navigation/useReportPath";
import TruncatedText from "../../../components/Common/KeyValueList/TruncatedText";
import { ErrorState } from "./DashboardUI";

/* -------------------------------------------------------------------------- */
/*                         CASE REPORT CONFIG                                 */
/* -------------------------------------------------------------------------- */

const CASE_REPORT_CONFIG = {
  Total: { icon: ListTodo },
  Open: { icon: BriefcaseBusiness },
  Close: { icon: CheckCircle2 },
  Absence: { icon: AlertTriangle },
};

const DEFAULT_CASE_REPORT = { icon: ListTodo };

/* -------------------------------------------------------------------------- */
/*                              CASE STATUS                                   */
/* -------------------------------------------------------------------------- */

const CaseStatusCount = ({
  reports = [],
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const { openReport, prefetchReports } = useReportNavigation();

  const handleReportClick = (report) => openReport(report?.reportId);

  const renderTiles = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl p-3 border border-white/10 bg-white/10"
          aria-hidden="true"
        >
          <div className="h-8 w-8 rounded-xl bg-white/20 animate-pulse" />
          <div className="mt-4 h-8 w-14 rounded bg-white/20 animate-pulse" />
          <div className="mt-2 h-4 w-3/4 rounded bg-white/20 animate-pulse" />
        </div>
      ));
    }

    return reports.map((report, index) => {
      const config =
        CASE_REPORT_CONFIG[report.reportName] ?? DEFAULT_CASE_REPORT;

      const Icon = config.icon;

      const isNavigable = Boolean(report.reportId);

      return (
        <button
          key={`${report.reportName}-${index}`}
          type="button"
          disabled={!isNavigable}
          onClick={() => handleReportClick(report)}
          onMouseEnter={isNavigable ? prefetchReports : undefined}
          aria-label={`${report.reportName}: ${report.count ?? 0}${
            isNavigable ? ", open report" : ""
          }`}
          className={`
            group
            rounded-2xl
            p-3
            border
            border-white/10
            bg-white/10
            backdrop-blur-xl
            text-left
            transition-all
            duration-200
            h-full
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white/70
            ${
              isNavigable
                ? "cursor-pointer hover:bg-white/20 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                : "cursor-default"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Icon size={16} className="text-white" />
            </div>

            {isNavigable && (
              <ArrowUpRight
                size={14}
                className="text-white/50 transition-all group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
          </div>

          <div className="text-2xl font-black text-white mt-3 leading-none tabular-nums">
            {(report.count ?? 0).toLocaleString()}
          </div>

          <TruncatedText
            value={report.reportName}
            lines={2}
            className="text-white/75 text-xs font-medium mt-1.5 leading-4"
          />
        </button>
      );
    });
  };

  return (
    <div className="xl:col-span-6">
      <div
        className="rounded-[35px] p-6 md:p-7 overflow-hidden relative h-full"
        style={{
          background:
            "linear-gradient(135deg, var(--color-bgFive), var(--color-bgSeven))",
        }}
      >
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-white/10 -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-white/5 translate-y-20" />

        <div className="relative z-10 flex flex-col h-full">
          {/* HEADER */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                Case Overview
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-white mt-2 leading-tight max-w-150">
                AI Powered Legal & Case Management Dashboard
              </h2>

              <p className="text-white/60 text-sm mt-2">
                Select a card to open the full report.
              </p>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center shrink-0">
              <Activity size={26} className="text-white" />
            </div>
          </div>

          {/* CASE REPORTS */}
          {isError ? (
            <ErrorState tone="dark" onRetry={onRetry} className="mt-6 py-6" />
          ) : !isLoading && reports.length === 0 ? (
            <p className="mt-6 text-white/70 text-sm">
              No case reports available yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5  pt-4 items-stretch">
              {renderTiles()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseStatusCount;
