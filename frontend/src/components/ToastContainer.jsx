import { useJwtContext } from "../context/JwtContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useJwtContext();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-xl flex items-start gap-3 animate-fade-up font-mono-custom text-xs transition-all ${
            t.type === "success"
              ? "bg-emerald-50/95 text-emerald-900 border-emerald-200 shadow-emerald-500/10"
              : t.type === "error"
              ? "bg-rose-50/95 text-rose-900 border-rose-200 shadow-rose-500/10"
              : t.type === "warning"
              ? "bg-amber-50/95 text-amber-900 border-amber-200 shadow-amber-500/10"
              : "bg-slate-900/90 text-slate-100 border-slate-800 shadow-slate-900/10"
          }`}
        >
          <span className="mt-0.5 font-bold text-sm">
            {t.type === "success" && "✓"}
            {t.type === "error" && "✗"}
            {t.type === "warning" && "⚠"}
            {t.type === "info" && "›"}
          </span>
          <div className="flex-1 font-semibold leading-relaxed break-words">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer text-base leading-none p-0.5"
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
