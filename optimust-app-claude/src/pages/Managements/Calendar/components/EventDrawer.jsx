import React, {
  memo,
  useEffect,
  useState,
} from "react";

import EventForm from "./EventForm";
import { EMPTY_EVENT } from "../config/constant";

// import { EMPTY_EVENT } from "../constants/eventSchema";

function EventDrawer({
  event,
  isCreating,
  onClose,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState({
    ...EMPTY_EVENT,
  });

  useEffect(() => {
    if (!event) return;

    setForm({
      ...EMPTY_EVENT,
      ...event,
    });
  }, [event]);

  return (
    <div
      className={`shrink-0 border-l bg-white overflow-hidden transition-all duration-300 ${
        event
          ? "w-[400px]"
          : "w-0 border-0"
      }`}
    >
      {event && (
        <div className="h-full overflow-y-auto p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {isCreating
                ? "Create Event"
                : "Event Details"}
            </h2>

            <button onClick={onClose}>
              ✕
            </button>
          </div>

          <EventForm
            form={form}
            setForm={setForm}
          />

          <div className="mt-5 flex gap-3">
            <button
              className="flex-1 rounded-xl bg-blue-600 py-2 text-white"
              onClick={() => onSave(form)}
            >
              Save
            </button>

            {!isCreating && (
              <button
                className="flex-1 rounded-xl bg-red-500 py-2 text-white"
                onClick={() =>
                  onDelete(event.id)
                }
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(EventDrawer);