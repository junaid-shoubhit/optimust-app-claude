import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

import { apiRequest } from "../../../services/apiBinding";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-[28px] border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl bg-white/60 ${className}`}
    >
      {children}
    </div>
  );
};

const COLORS = [
  "var(--color-bgSeven)",
  "var(--color-bgdarkbrown)",
  "var(--color-bgSix)",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#ef4444",
  "#f59e0b",
];

const EventStatusChart = () => {
  const { data: eventsData = [], isLoading } = useQuery({
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

  const chartData = useMemo(() => {
    if (!eventsData.length) return [];

    const grouped = eventsData.reduce((acc, item) => {
      const status = item["event Status"]?.trim() || "Unknown";

      acc[status] = (acc[status] || 0) + 1;

      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [eventsData]);

  const totalEvents = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 min-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl font-bold"
            style={{
              color: "var(--color-fontFour)",
            }}
          >
            Today's Events
          </h2>

          <p className="text-sm text-gray-500">Event Status Distribution</p>
        </div>

        <div className="text-right">
          <div
            className="text-3xl font-bold"
            style={{
              color: "var(--color-fontFour)",
            }}
          >
            {totalEvents}
          </div>

          <div className="text-sm text-gray-500">Total Events</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[350px]">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex justify-center items-center h-[350px]">
          <div className="text-center">
            <p className="font-semibold text-gray-600">No Events Found</p>
            <p className="text-sm text-gray-400 mt-1">
              No event data available
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 10,
                right: 30,
                left: 80,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis type="number" />

              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{
                  fontSize: 12,
                }}
              />

              <Tooltip />

              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default EventStatusChart;
