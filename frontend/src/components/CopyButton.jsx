import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  return (
    <button
      onClick={copy}
      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all uppercase tracking-widest font-mono-custom ${copied
          ? "badge-emerald-outline"
          : "btn-secondary-custom"
        }`}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}
