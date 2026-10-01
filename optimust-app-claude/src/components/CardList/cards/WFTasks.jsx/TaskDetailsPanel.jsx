import React from "react";
import { X, Loader2, AlertCircle } from "lucide-react";

const TaskDetailsPanel = ({
  open,
  onClose,
  title,
  isLoading,
  isError,
  data,
}) => {
  return (
    <div
      className={`flex h-full min-h-[24rem] flex-col rounded-2xl border border-[var(--border-primary)] bg-[var(--background-box)] shadow-sm
        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-4 py-3">
        <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {title || "Task Details"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--background-hover)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading details…
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-rose-600">
            <AlertCircle className="h-5 w-5" />
            Failed to load task details.
          </div>
        )}

        {!isLoading && !isError && Array.isArray(data) && data.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.map((item, i) => (
              <div
                key={item.id ?? i}
                className="animate-[fadeIn_0.4s_ease-out] rounded-lg border border-[var(--border-primary)] bg-[var(--background-heading)] p-3 text-xs text-[var(--text-primary)]"
                style={{
                  animationDelay: `${i * 40}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        {!isLoading &&
          !isError &&
          (!data || (Array.isArray(data) && data.length === 0)) && (
            <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
              No details found.
            </div>
          )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TaskDetailsPanel;
