import { useMemo } from "react";

export const useCalendarStats = (
  events
) => {
  return useMemo(() => {
    return {
      total: events.length,

      tasks: events.filter(
        (e) => e.type === "task"
      ).length,

      meetings: events.filter(
        (e) => e.type === "event"
      ).length,

      pending: events.filter(
        (e) => e.status === "pending"
      ).length,
    };
  }, [events]);
};