import { AlertCircle, ArrowUpRight, Inbox, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { percentOf } from "./dashboardUtils";

/* -------------------------------------------------------------------------- */
/*                                   CARD                                     */
/* -------------------------------------------------------------------------- */

export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-[28px] border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl bg-white/60 ${className}`}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                CARD HEADER                                 */
/* -------------------------------------------------------------------------- */

export const CardHeader = ({
  icon: Icon,
  title,
  subtitle,
  total,
  totalLabel,
  isLoading,
  viewAllTo,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-bgTwo)" }}
          >
            <Icon size={20} style={{ color: "var(--color-bgSeven)" }} />
          </div>
        )}

        <div className="min-w-0">
          <h2
            className="text-lg font-bold leading-tight"
            style={{ color: "var(--color-fontFour)" }}
          >
            {title}
          </h2>

          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}

          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="inline-flex items-center gap-1 text-xs font-semibold mt-1.5 hover:underline focus-visible:outline-none focus-visible:underline"
              style={{ color: "var(--color-bgSeven)" }}
            >
              View all
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {total !== undefined && (
        <div className="text-right shrink-0">
          {isLoading ? (
            <div className="h-8 w-12 rounded bg-gray-200 animate-pulse ml-auto" />
          ) : (
            <div
              className="text-3xl font-black leading-none"
              style={{ color: "var(--color-fontFour)" }}
            >
              {total}
            </div>
          )}

          <div className="text-xs text-gray-500 mt-1.5">{totalLabel}</div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               STATE BLOCKS                                 */
/* -------------------------------------------------------------------------- */

export const EmptyState = ({ title, description, className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className}`}
    >
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: "var(--color-bgThree)" }}
      >
        <Inbox size={24} style={{ color: "var(--color-bgSix)" }} />
      </div>

      <p className="font-semibold text-gray-600">{title}</p>

      {description && (
        <p className="text-sm text-gray-400 mt-1 max-w-[260px]">{description}</p>
      )}
    </div>
  );
};

export const ErrorState = ({ onRetry, className = "", tone = "light" }) => {
  const isDark = tone === "dark";

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center ${className}`}
    >
      <AlertCircle
        size={28}
        className={isDark ? "text-white/80 mb-2" : "text-red-400 mb-2"}
      />

      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-600"}`}>
        Couldn't load this data
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${
            isDark
              ? "bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white/60"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-[var(--color-bgSeven)]"
          }`}
        >
          <RotateCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             STATUS BAR CHART                               */
/* -------------------------------------------------------------------------- */

const ChartTooltip = ({ active, payload, total, unit }) => {
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
        {item.value} {unit} · {percentOf(item.value, total)}%
      </div>
    </div>
  );
};

const ChartSkeleton = () => (
  <div className="space-y-5 py-4" aria-hidden="true">
    {[85, 65, 45, 30].map((width) => (
      <div key={width} className="flex items-center gap-3">
        <div className="h-3 w-24 rounded bg-gray-200 animate-pulse shrink-0" />
        <div
          className="h-5 rounded-lg bg-gray-200 animate-pulse"
          style={{ width: `${width}%` }}
        />
      </div>
    ))}
  </div>
);

export const StatusBarChartCard = ({
  icon,
  title,
  subtitle,
  unit,
  emptyTitle,
  emptyDescription,
  viewAllTo,
  chartData,
  isLoading,
  isError,
  onRetry,
}) => {
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Size the label column to the longest status name instead of a fixed width.
  const longestLabel = Math.max(0, ...chartData.map((item) => item.name.length));
  const labelWidth = Math.min(160, Math.max(70, longestLabel * 7));
  const chartHeight = Math.max(200, chartData.length * 44);

  const renderBody = () => {
    if (isLoading) return <ChartSkeleton />;

    if (isError) return <ErrorState onRetry={onRetry} className="h-[260px]" />;

    if (chartData.length === 0) {
      return (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="h-[260px]"
        />
      );
    }

    return (
      <>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                opacity={0.4}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                dataKey="name"
                type="category"
                width={labelWidth}
                tick={{ fontSize: 12, fill: "var(--color-fontFour)" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={<ChartTooltip total={total} unit={unit} />}
              />

              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}

                <LabelList
                  dataKey="value"
                  position="right"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fill: "var(--color-fontFour)",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Share-of-total summary */}
        <div className="mt-5 pt-4 border-t border-gray-200/60 flex flex-wrap gap-2">
          {chartData.map((item) => (
            <span
              key={item.name}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border border-gray-100 px-2.5 py-1 text-xs font-medium"
              style={{ color: "var(--color-fontFour)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
              <span className="text-gray-400">
                {percentOf(item.value, total)}%
              </span>
            </span>
          ))}
        </div>
      </>
    );
  };

  return (
    <Card className="p-6 h-full">
      <CardHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        total={isError ? "—" : total}
        totalLabel={`Total ${unit}`}
        isLoading={isLoading}
        viewAllTo={viewAllTo}
      />

      {renderBody()}
    </Card>
  );
};
