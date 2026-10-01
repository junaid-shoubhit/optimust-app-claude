import { memo } from "react";

export const ContactSkeleton = memo(() => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
      />
    ))}
  </div>
));
