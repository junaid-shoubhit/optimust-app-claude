import React, { memo } from "react";

function Card({ title, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="text-xs text-gray-500">
        {title}
      </div>

      <div className="mt-1 text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}

function CalendarStats({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        title="Total"
        value={stats.total}
      />

      <Card
        title="Tasks"
        value={stats.tasks}
      />

      <Card
        title="Meetings"
        value={stats.meetings}
      />

      <Card
        title="Pending"
        value={stats.pending}
      />
    </div>
  );
}

export default memo(CalendarStats);