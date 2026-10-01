import React, { memo } from "react";
import { formatDateUI } from "../../../../utils/constant";

function UpcomingEvents({ events, onSelect }) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onSelect(event)}
          className="cursor-pointer rounded-2xl border bg-white p-3 transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="font-medium">{event.title}</div>

            <div>{event.type === "task" ? "📌" : "📅"}</div>
          </div>

          <div className="mt-1 text-xs text-gray-500">
            {formatDateUI(event.start)}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs">👤 {event.assignee}</div>

            <div className="text-xs capitalize">{event.priority}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(UpcomingEvents);
