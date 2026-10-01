import CalendarSidebar from "./components/CalendarSidebar";
import CalendarView from "./components/CalendarView";
import EventDrawer from "./components/EventDrawer";

import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useCalendarFilters } from "./hooks/useCalendarFilters";
import { useCalendarStats } from "./hooks/useCalendarStats";

export default function CRMCalendarPage() {
  const {
    events,

    selectedEvent,

    isCreating,

    openCreate,
    openEdit,

    closeDrawer,

    saveEvent,
    deleteEvent,
  } = useCalendarEvents();

  const {
    filters,
    setFilters,
    filteredEvents,
  } = useCalendarFilters(events);

  const stats =
    useCalendarStats(filteredEvents);

  return (
    <div className="flex h-[calc(100vh-5.425rem)] overflow-hidden bg-gray-50">
      <CalendarSidebar
        stats={stats}
        filters={filters}
        setFilters={setFilters}
        events={filteredEvents}
        onSelect={openEdit}
      />

      <CalendarView
        events={filteredEvents}
        onCreate={openCreate}
        onEdit={openEdit}
      />

      <EventDrawer
        event={selectedEvent}
        isCreating={isCreating}
        onClose={closeDrawer}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />
    </div>
  );
}