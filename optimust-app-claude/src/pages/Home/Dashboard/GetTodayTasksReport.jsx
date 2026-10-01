import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ListChecks } from "lucide-react";

import { apiRequest } from "../../../services/apiBinding";
import { PATH } from "../../../utils/pagePath";
import { StatusBarChartCard } from "./DashboardUI";
import { groupByStatus } from "./dashboardUtils";

const GetTodayTasksReport = () => {
  const {
    data: tasksData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["today-tasks-report"],
    queryFn: async ({ signal }) => {
      const response = await apiRequest({
        apiPath: "Utility/GetDashboardData?procedureName=GetTodayTasksReport",
        method: "post",
        signal,
      });

      const data = response?.data || [];

      if (data?.length && data?.[0]?.message === "No data found") {
        return [];
      }

      return data.filter((item) => item?.id);
    },
  });

  const chartData = useMemo(
    () => groupByStatus(tasksData, (item) => item["status"]),
    [tasksData],
  );

  return (
    <StatusBarChartCard
      icon={ListChecks}
      title="Today's Tasks"
      subtitle="Task status distribution"
      unit="tasks"
      emptyTitle="No tasks today"
      emptyDescription="Tasks due today will show up here."
      viewAllTo={PATH.WFTASK}
      chartData={chartData}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
};

export default GetTodayTasksReport;
