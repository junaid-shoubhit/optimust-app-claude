export const WFTasksSkeleton = () => {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--border-primary)] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 rounded bg-[var(--background-box)]" />
        <div className="h-7 w-16 rounded-full bg-[var(--background-box)]" />
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-[var(--background-box)]" />

      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-7 w-20 rounded-lg bg-[var(--background-box)]"
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-dashed border-[var(--border-primary)] pt-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-5 w-14 rounded-full bg-[var(--background-box)]"
          />
        ))}
      </div>
    </div>
  );
};
