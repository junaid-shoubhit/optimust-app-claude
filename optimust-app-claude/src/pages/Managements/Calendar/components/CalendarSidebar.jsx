import React, { memo } from "react";

import CalendarStats from "./CalendarStats";
import CalendarFilters from "./CalendarFilters";
import UpcomingEvents from "./UpcomingEvents";

function CalendarSidebar({ stats, filters, setFilters, events, onSelect }) {
  return (
    <div className="w-72 shrink-0 border-r bg-white p-4 overflow-y-auto">
      <h2 className="mb-5 text-xl font-bold">MY CALENDAR</h2>

      <CalendarFilters filters={filters} setFilters={setFilters} />

      <div className="mt-6">
        <CalendarStats stats={stats} />
      </div>

      <div className="mt-8">
        <div className="mb-3 font-semibold">Upcoming</div>

        <UpcomingEvents events={events} onSelect={onSelect} />
      </div>
    </div>
  );
}

export default memo(CalendarSidebar);
