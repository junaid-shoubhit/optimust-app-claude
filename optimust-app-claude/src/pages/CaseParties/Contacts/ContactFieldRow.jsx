import { memo } from "react";

const ContactFieldRow = memo(({ label, value }) => {
  if (!value) return null;

  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="font-mono text-[9.5px] uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <span className="text-right text-[10px] font-semibold text-(--text-primary)">
        {value}
      </span>
    </div>
  );
});

export default ContactFieldRow;
