import { CalendarDays, RotateCw, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

/** Query keys owned by the dashboard widgets, refreshed together. */
const DASHBOARD_QUERY_KEYS = [
  ["report-status-count"],
  ["intake-status-count"],
  ["calendar-events"],
  ["today-tasks-report"],
];

const isDashboardQuery = (query) =>
  DASHBOARD_QUERY_KEYS.some((key) => key[0] === query.queryKey[0]);

const DashboardHeader = () => {
  const queryClient = useQueryClient();

  const isRefreshing = useIsFetching({ predicate: isDashboardQuery }) > 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";

    return "Good Evening";
  }, []);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  const userName = localStorage.getItem("userName") || "";

  const handleRefresh = () => {
    queryClient.invalidateQueries({ predicate: isDashboardQuery });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
      <div>
        <div
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--color-bgSeven)" }}
        >
          <Sparkles size={16} />
          Smart Dashboard
        </div>

        <h1
          className="text-3xl md:text-4xl font-black mt-2"
          style={{ color: "var(--color-fontFour)" }}
        >
          {greeting}
          {userName && `, ${userName}`} 👋
        </h1>

        <p
          className="mt-2 text-[15px]"
          style={{ color: "var(--color-fontSix)" }}
        >
          Here's what's happening with your cases, intake & tasks today.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div
          className="hidden md:flex items-center gap-2 h-11 px-4 rounded-2xl border bg-white/70 text-sm font-medium"
          style={{
            borderColor: "var(--color-bgTwo)",
            color: "var(--color-fontFour)",
          }}
        >
          <CalendarDays size={16} style={{ color: "var(--color-bgSeven)" }} />
          {today}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
          className="h-11 px-4 rounded-2xl text-white text-sm font-semibold flex items-center gap-2 transition hover:brightness-110 disabled:opacity-80 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-bgSeven)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-bgFive), var(--color-bgSeven))",
          }}
        >
          <RotateCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
