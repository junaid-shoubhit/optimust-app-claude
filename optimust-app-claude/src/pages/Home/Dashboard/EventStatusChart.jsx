import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";

import { apiRequest } from "../../../services/apiBinding";
import { StatusBarChartCard } from "./DashboardUI";
import { groupByStatus } from "./dashboardUtils";

const EventStatusChart = () => {
  const {
    data: eventsData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async ({ signal }) => {
      const response = await apiRequest({
        apiPath: "Utility/GetDashboardData?procedureName=GetTodayEventsReport",
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
    () => groupByStatus(eventsData, (item) => item["event Status"]),
    [eventsData],
  );

  return (
    <StatusBarChartCard
      icon={CalendarDays}
      title="Today's Events"
      subtitle="Event status distribution"
      unit="events"
      emptyTitle="No events today"
      emptyDescription="Events scheduled for today will show up here."
      chartData={chartData}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
};

export default EventStatusChart;
