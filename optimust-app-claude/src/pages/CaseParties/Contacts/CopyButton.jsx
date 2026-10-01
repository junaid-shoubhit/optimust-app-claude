import { memo, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

const CopyButton = memo(({ value, label }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await navigator.clipboard.writeText(value);
      } catch {}

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1400);
    },
    [value],
  );

  if (!value) return null;

  return (
    <button
      type="button"
      onClick={onCopy}
      title={copied ? "Copied" : `Copy ${label}`}
      className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-500 hover:text-slate-900"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
});

export default CopyButton;
