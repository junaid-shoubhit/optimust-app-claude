import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  ListTodo,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TruncatedText from "../../../components/Common/KeyValueList/TruncatedText";

/* -------------------------------------------------------------------------- */
/*                         CASE REPORT CONFIG                                 */
/* -------------------------------------------------------------------------- */

const CASE_REPORT_CONFIG = {
  Total: {
    icon: ListTodo,
    color: "var(--color-bgdarkbrown)",
    light: "var(--color-creame)",
  },

  Open: {
    icon: BriefcaseBusiness,
    color: "var(--color-bgdarkbrown)",
    light: "var(--color-creame)",
  },

  Close: {
    icon: CheckCircle2,
    color: "var(--color-bgSix)",
    light: "var(--color-bgEight)",
  },

  Absence: {
    icon: AlertTriangle,
    color: "var(--color-bgSeven)",
    light: "var(--color-bgTwo)",
  },
};

/* -------------------------------------------------------------------------- */
/*                              CASE STATUS                                   */
/* -------------------------------------------------------------------------- */

const CaseStatusCount = ({ reports = [], isLoading = false }) => {
  const navigate = useNavigate();

  const handleReportClick = (report) => {
    if (!report?.reportId) {
      return;
    }

    navigate(`/reports/no-tabs/${report.reportId}`);
  };

  return (
    <div className="xl:col-span-6">
      <div
        className="rounded-[35px] p-7 overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, var(--color-bgFive), var(--color-bgSeven))",
        }}
      >
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-white/10 -translate-y-20 translate-x-20" />

        <div className="relative z-10">
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 font-medium">Active Workflow</p>

              <h2 className="text-3xl font-black text-white mt-3 leading-tight max-w-[600px]">
                AI Powered Legal & Case Management Dashboard
              </h2>
            </div>

            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
              <Activity size={28} className="text-white" />
            </div>
          </div>

          {/* CASE REPORTS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 items-stretch">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl p-4 border border-white/10 backdrop-blur-xl bg-white/10"
                  >
                    <div className="h-6 w-6 rounded bg-white/20 animate-pulse" />

                    <div className="mt-4 h-9 w-16 rounded bg-white/20 animate-pulse" />

                    <div className="mt-2 h-10 w-full rounded bg-white/20 animate-pulse" />
                  </div>
                ))
              : reports.map((report, index) => {
                  const config = CASE_REPORT_CONFIG[report.reportName] ?? {
                    icon: ListTodo,
                    color: "var(--color-bgdarkbrown)",
                    light: "var(--color-creame)",
                  };

                  const Icon = config.icon;

                  const isNavigable = Boolean(report.reportId);

                  return (
                    <button
                      key={`${report.reportName}-${index}`}
                      type="button"
                      disabled={!isNavigable}
                      onClick={() => handleReportClick(report)}
                      className={`
              rounded-2xl
              p-2
              border
              border-white/10
              backdrop-blur-xl
              bg-white/10
              text-left
              transition-all
              duration-200
              h-full
              ${
                isNavigable
                  ? "cursor-pointer hover:bg-white/20 hover:-translate-y-1"
                  : "cursor-default"
              }
            `}
                    >
                      <div className="flex items-center justify-between">
                        <Icon size={20} className="text-white" />

                        {isNavigable && (
                          <ArrowUpRight
                            size={16}
                            className="text-white/50 transition-all group-hover:text-white"
                          />
                        )}
                      </div>

                      <h2 className="text-2xl font-black text-white mt-2 min-h-[36px] flex items-center">
                        {report.count ?? 0}
                      </h2>

                      {/* <p
                        className="text-white/70 text-sm mt-1 leading-5 line-clamp-2 min-h-[40px]"
                        title={report.reportName}
                      >
                        {report.reportName}
                      </p> */}
                      <TruncatedText
                        value={report.reportName}
                        lines={2}
                        className="text-white/70 text-sm mt-1 leading-5 min-h-[40px]"
                      />
                    </button>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStatusCount;
