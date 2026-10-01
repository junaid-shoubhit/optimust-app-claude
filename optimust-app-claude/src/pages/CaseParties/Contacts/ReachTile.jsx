import { memo } from "react";
import CopyButton from "./CopyButton";

const ReachTile = memo(({ icon, label, value, href, caption }) => {
  if (!value) return null;

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-2">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex gap-2">
          {icon}

          <span className="font-mono text-[9px] uppercase tracking-wide text-slate-500">
            {label}
          </span>
        </div>

        <CopyButton value={value} label={label} />
      </div>

      {href ? (
        <a
          href={href}
          className="block break-words text-sm font-semibold text-(--text-primary)"
        >
          {value}
        </a>
      ) : (
        <span className="block break-words text-sm font-semibold text-(--text-primary)">
          {value}
        </span>
      )}

      {caption && <div className="text-[10px] text-slate-500">{caption}</div>}
    </div>
  );
});

export default ReachTile;
