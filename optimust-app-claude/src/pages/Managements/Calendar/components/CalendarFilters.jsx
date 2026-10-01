import React, { memo } from "react";

const TYPE_OPTIONS = [
  {
    key: "all",
    label: "All",
    icon: "🗂",
  },

  {
    key: "task",
    label: "Tasks",
    icon: "📌",
  },

  {
    key: "event",
    label: "Events",
    icon: "📅",
  },
];

const OWNERSHIP_OPTIONS = [
  {
    key: "all",
    label: "All Activities",
  },

  {
    key: "assignedToMe",
    label: "Assigned To Me",
  },

  {
    key: "assignedByMe",
    label: "Assigned By Me",
  },
];

function Pill({
  active,
  children,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function CalendarFilters({
  filters,
  setFilters,
}) {
  return (
    <div className="space-y-5">
      {/* TYPE */}

      <div>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((item) => (
            <Pill
              key={item.key}
              active={
                filters.type === item.key
              }
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  type: item.key,
                }))
              }
            >
              <div className="flex flex-col items-center gap-1">
                <span>{item.icon}</span>

                <span className="text-xs">
                  {item.label}
                </span>
              </div>
            </Pill>
          ))}
        </div>
      </div>

      {/* OWNERSHIP */}

      <div>
        <div className="mb-2 text-sm font-semibold">
          Ownership
        </div>

        <div className="flex flex-col gap-2">
          {OWNERSHIP_OPTIONS.map(
            (item) => (
              <Pill
                key={item.key}
                active={
                  filters.ownership ===
                  item.key
                }
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    ownership:
                      item.key,
                  }))
                }
              >
                {item.label}
              </Pill>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CalendarFilters);