import React from "react";

export default function EventForm({
  form,
  setForm,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-500">
          Title
        </label>

        <input
          className="mt-1 w-full rounded-xl border p-2"
          value={form?.title || ""}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              title: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <label className="text-sm text-gray-500">
          Type
        </label>

        <select
          className="mt-1 w-full rounded-xl border p-2"
          value={form?.type || "task"}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              type: e.target.value,
            }))
          }
        >
          <option value="task">
            Task
          </option>

          <option value="event">
            Event
          </option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-500">
          Priority
        </label>

        <select
          className="mt-1 w-full rounded-xl border p-2"
          value={
            form?.priority || "medium"
          }
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              priority:
                e.target.value,
            }))
          }
        >
          <option value="high">
            High
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="low">
            Low
          </option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-500">
          Status
        </label>

        <select
          className="mt-1 w-full rounded-xl border p-2"
          value={
            form?.status || "pending"
          }
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              status:
                e.target.value,
            }))
          }
        >
          <option value="pending">
            Pending
          </option>

          <option value="done">
            Done
          </option>

          <option value="scheduled">
            Scheduled
          </option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-500">
          Assignee
        </label>

        <input
          className="mt-1 w-full rounded-xl border p-2"
          value={
            form?.assignee || ""
          }
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              assignee:
                e.target.value,
            }))
          }
        />
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="mb-3 font-semibold">
          CRM Data
        </div>

        <div className="space-y-3">
          <input
            placeholder="Lead ID"
            className="w-full rounded-xl border p-2"
            value={
              form?.leadId || ""
            }
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                leadId:
                  e.target.value,
              }))
            }
          />

          <input
            placeholder="Deal ID"
            className="w-full rounded-xl border p-2"
            value={
              form?.dealId || ""
            }
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                dealId:
                  e.target.value,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}