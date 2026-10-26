export default function TimeBadge({ label, ts }) {
  if (!ts) return null;
  const now = Math.floor(Date.now() / 1000);
  const expired = label === "exp" && ts < now;
  const dateObj = new Date(ts * 1000);
  const localStr = dateObj.toLocaleString();
  const utcStr = dateObj.toUTCString();

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-medium w-full border font-mono-custom transition-all ${
        expired
          ? "bg-rose-50 text-rose-700 border-rose-200 shadow-xs"
          : "bg-indigo-50/70 text-indigo-900 border-indigo-200 shadow-xs"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold">
        <span
          className={`w-2 h-2 rounded-full ${
            expired ? "bg-rose-500 animate-pulse" : "bg-indigo-600 animate-pulse"
          }`}
        />
        <span className="uppercase text-slate-700 text-[10px] tracking-widest font-bold">
          {label === "exp"
            ? "exp · Expiration"
            : label === "iat"
            ? "iat · Issued At"
            : "nbf · Not Before"}
        </span>
        {expired && (
          <span className="ml-1 text-[9px] font-bold bg-rose-200/80 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
            expired
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:ml-auto text-xs">
        <span className="text-slate-600">
          Local: <strong className="text-slate-900">{localStr}</strong>
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">
          UTC: <strong className="text-slate-800">{utcStr}</strong>
        </span>
      </div>
    </div>
  );
}
