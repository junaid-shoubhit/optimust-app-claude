import {
  useMemo,
  useState,
} from "react";

export const useCalendarFilters = (
  events
) => {
  const [filters, setFilters] = useState({
    type: "all",

    ownership: "all",
  });

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      /* ---------------- TYPE ---------------- */

      if (
        filters.type !== "all" &&
        e.type !== filters.type
      ) {
        return false;
      }

      /* ---------------- OWNERSHIP ---------------- */

      if (
        filters.ownership ===
        "assignedToMe"
      ) {
        if (e.assignee !== "Junaid") {
          return false;
        }
      }

      if (
        filters.ownership ===
        "assignedByMe"
      ) {
        if (e.createdBy !== "Junaid") {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  return {
    filters,

    setFilters,

    filteredEvents,
  };
};