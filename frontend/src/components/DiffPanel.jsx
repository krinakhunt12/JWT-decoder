import { useMemo, useState } from "react";
import { decodeToken } from "../utils/jwt";
import {
  DIFF_TYPES,
  compareTimings,
  diffClaims,
  formatValue,
  highlightRiskyChanges,
  summarizeDiff,
} from "../utils/diffTokens";

const DIFF_STYLE = {
  [DIFF_TYPES.ADDED]: { label: "added", badge: "badge-emerald-outline", cell: "text-emerald-300", icon: "+" },
  [DIFF_TYPES.REMOVED]: { label: "removed", badge: "badge-rose-outline", cell: "text-rose-300", icon: "−" },
  [DIFF_TYPES.CHANGED]: { label: "modified", badge: "badge-amber-outline", cell: "text-amber-300", icon: "~" },
  [DIFF_TYPES.TYPE_CHANGED]: { label: "type changed", badge: "badge-amber-outline", cell: "text-amber-300", icon: "~" },
  [DIFF_TYPES.SAME]: { label: "identical", badge: "border-main", cell: "text-muted-custom", icon: "=" },
};

function Pane({ title, accent, token, decoded, placeholder, onChange, onUseActive, active }) {
  return (
    <div className={`rounded-2xl overflow-hidden border transition-all ${active ? "glow-card" : ""}`}
      style={{ background: "var(--color-card)", borderColor: active ? `${accent}44` : undefined }}>
      <div className="flex items-center justify-between px-4 py-3 panel-header gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
          <span className="text-xs font-bold tracking-wide truncate" style={{ color: accent }}>{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {decoded && (
            <span className="text-[9px] font-mono-custom badge-indigo-outline px-1.5 py-0.5 rounded">
              {decoded.header?.alg}
            </span>
          )}
          {token && (
            <button onClick={() => onUseActive(token)}
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg btn-secondary-custom transition-all cursor-pointer">
              Use active
            </button>
          )}
        </div>
      </div>

      <textarea
        value={token}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full px-4 py-3 text-[11px] font-mono-custom text-primary-color placeholder-slate-600 focus:outline-none resize-none bg-transparent"
        rows={5}
      />

      {decoded ? (
        <div className="px-4 pb-3 space-y-1">
          <div className="text-[10px] text-muted-custom font-mono-custom truncate">
            iss: <span className="text-main">{decoded.payload?.iss || "—"}</span>
          </div>
          <div className="text-[10px] text-muted-custom font-mono-custom truncate">
            sub: <span className="text-main">{decoded.payload?.sub || "—"}</span>
          </div>
        </div>
      ) : (
        token.trim() && (
          <div className="px-4 pb-3 text-[10px] text-danger-custom font-mono-custom">
            Not a decodable JWT (needs 3 Base64url parts)
          </div>
        )
      )}
    </div>
  );
}

function TimingRow({ label, valueA, valueB, deltaText, hasA, hasB }) {
  const fmt = value => (typeof value === "number" ? new Date(value * 1000).toLocaleString() : "—");
  return (
    <div className="grid grid-cols-3 gap-3 text-[10px] font-mono-custom px-4 py-2.5 border-t border-main">
      <div className="text-main font-bold">{label}</div>
      <div className="text-muted-custom truncate">{hasA ? fmt(valueA) : "—"}</div>
      <div className="flex items-center gap-2 truncate">
        <span className="text-muted-custom">{hasB ? fmt(valueB) : "—"}</span>
        <span className="ml-auto text-cyan-custom font-bold whitespace-nowrap">{deltaText}</span>
      </div>
    </div>
  );
}

export default function DiffPanel({ activeToken }) {
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [showIdentical, setShowIdentical] = useState(false);
  const [active, setActive] = useState("A");

  const decodedA = useMemo(() => (tokenA.trim() ? decodeToken(tokenA.trim()) : null), [tokenA]);
  const decodedB = useMemo(() => (tokenB.trim() ? decodeToken(tokenB.trim()) : null), [tokenB]);

  const ready = Boolean(decodedA && decodedB);

  const rows = useMemo(
    () => (ready ? diffClaims(decodedA.payload, decodedB.payload) : []),
    [ready, decodedA, decodedB],
  );
  const counts = useMemo(() => summarizeDiff(rows), [rows]);
  const timings = useMemo(
    () => (ready ? compareTimings(decodedA.payload, decodedB.payload) : null),
    [ready, decodedA, decodedB],
  );
  const risky = useMemo(() => highlightRiskyChanges(rows), [rows]);

  const headerDiff = useMemo(() => {
    if (!ready) return [];
    const a = decodedA.header || {};
    const b = decodedB.header || {};
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    return keys.map(key => ({
      key,
      a: a[key],
      b: b[key],
      changed: JSON.stringify(a[key]) !== JSON.stringify(b[key]),
    }));
  }, [ready, decodedA, decodedB]);

  const visibleRows = showIdentical ? rows : rows.filter(row => row.type !== DIFF_TYPES.SAME);

  const useActive = target => {
    if (active === "A") setTokenA(target);
    else setTokenB(target);
  };

  const swap = () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
  };

  return (
    <div className="space-y-5">
      {/* Dual pane input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Pane
          title="Token A · baseline"
          accent="#7c3aed"
          token={tokenA}
          decoded={decodedA}
          active={active === "A"}
          onFocus={() => setActive("A")}
          onChange={setTokenA}
          onUseActive={useActive}
          placeholder="Paste the baseline token…"
        />
        <Pane
          title="Token B · candidate"
          accent="#00d4ff"
          token={tokenB}
          decoded={decodedB}
          active={active === "B"}
          onFocus={() => setActive("B")}
          onChange={setTokenB}
          onUseActive={useActive}
          placeholder="Paste the token to compare against…"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap px-5 py-3 rounded-2xl glass-panel animate-fade-up">
        <button
          onClick={swap}
          disabled={!tokenA && !tokenB}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M7 8h13a4 4 0 010 8h-1" /></svg>
          Swap A ↔ B
        </button>

        {activeToken && (
          <button
            onClick={() => {
              setTokenA(tokenA || activeToken.trim());
              setTokenB(tokenB || activeToken.trim());
            }}
            className="px-4 py-2 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Seed both from decoder
          </button>
        )}

        <label className="flex items-center gap-2 text-[10px] font-mono-custom text-muted-custom cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showIdentical}
            onChange={event => setShowIdentical(event.target.checked)}
            className="accent-cyan-500"
          />
          show unchanged claims
        </label>

        {ready && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {counts.added > 0 && <span className="px-2.5 py-1 rounded-full badge-emerald-outline text-[10px] font-mono-custom">+{counts.added} added</span>}
            {counts.removed > 0 && <span className="px-2.5 py-1 rounded-full badge-rose-outline text-[10px] font-mono-custom">−{counts.removed} removed</span>}
            {counts.changed + counts.typeChanged > 0 && (
              <span className="px-2.5 py-1 rounded-full badge-amber-outline text-[10px] font-mono-custom">
                ~{counts.changed + counts.typeChanged} modified
              </span>
            )}
            {counts.identical && <span className="px-2.5 py-1 rounded-full badge-emerald-outline text-[10px] font-mono-custom">payloads identical</span>}
          </div>
        )}
      </div>

      {/* Risky highlight */}
      {risky.length > 0 && (
        <div className="rounded-2xl overflow-hidden glass-panel border-amber-500/30 animate-fade-up">
          <div className="px-5 py-3.5 panel-header flex items-center gap-2">
            <span className="cyber-badge text-amber-400">Review</span>
            <span className="text-main text-xs font-bold">Authorization-relevant change</span>
          </div>
          <div className="p-5 bg-secondary-custom/50 space-y-2">
            {risky.map(item => (
              <div key={item.path} className="flex flex-wrap items-center gap-2 text-xs font-mono-custom">
                <span className="badge-amber-outline px-2 py-0.5 rounded font-bold">{item.path}</span>
                <span className="text-muted-custom line-through">{formatValue(item.from)}</span>
                <span className="text-muted-custom">→</span>
                <span className="text-amber-300 font-bold break-all">{formatValue(item.to)}</span>
              </div>
            ))}
            <p className="text-[10px] text-muted-custom leading-relaxed pt-1">
              Role, scope or permission claims changed between these two tokens. If Token B is the one your
              service issued, this is a privilege change — confirm it was intended.
            </p>
          </div>
        </div>
      )}

      {/* Timing comparison */}
      {timings && (
        <div className="rounded-2xl overflow-hidden glass-panel animate-fade-up">
          <div className="flex items-center justify-between px-5 py-3.5 panel-header gap-3">
            <div className="flex items-center gap-3">
              <span className="cyber-badge text-primary-color">Time</span>
              <span className="text-main text-xs font-bold">Lifetime &amp; Expiry Difference</span>
            </div>
            <span className="text-[10px] font-mono-custom text-muted-custom">B relative to A</span>
          </div>
          <div className="bg-secondary-custom/50">
            <div className="grid grid-cols-3 gap-3 text-[10px] font-mono-custom text-muted-custom px-4 py-2.5 uppercase tracking-widest font-bold">
              <div>claim</div>
              <div>token A</div>
              <div className="text-right">token B &nbsp;Δ</div>
            </div>
            {timings.rows.map(row => (
              <TimingRow key={row.claim} label={row.claim} {...row} />
            ))}
            <div className="grid grid-cols-3 gap-3 text-[10px] font-mono-custom px-4 py-2.5 border-t border-main bg-card-custom">
              <div className="text-main font-bold">lifetime</div>
              <div className="text-muted-custom">
                {timings.lifetime.a === null ? "—" : `${timings.lifetime.a}s`}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-custom">{timings.lifetime.b === null ? "—" : `${timings.lifetime.b}s`}</span>
                <span className="ml-auto text-cyan-custom font-bold whitespace-nowrap">{timings.lifetime.deltaText}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[10px] font-mono-custom px-4 py-2.5 border-t border-main bg-card-custom">
              <div className="text-main font-bold">expires in</div>
              <div className={timings.expired.a ? "text-danger-custom" : "text-muted-custom"}>
                {timings.remaining.a === null ? "—" : `${timings.remaining.a}s`}
              </div>
              <div className="flex items-center gap-2">
                <span className={timings.expired.b ? "text-danger-custom" : "text-muted-custom"}>
                  {timings.remaining.b === null ? "—" : `${timings.remaining.b}s`}
                </span>
                <span className="ml-auto text-cyan-custom font-bold whitespace-nowrap">{timings.remaining.deltaText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim diff table */}
      <div className="rounded-2xl overflow-hidden glass-panel animate-fade-up">
        <div className="flex items-center justify-between px-5 py-3.5 panel-header gap-3">
          <div className="flex items-center gap-3">
            <span className="cyber-badge text-primary-color">Diff</span>
            <span className="text-main text-xs font-bold">Claim Comparison</span>
          </div>
          {ready && (
            <span className="text-[10px] font-mono-custom text-muted-custom">{visibleRows.length} of {rows.length} claims</span>
          )}
        </div>

        {!ready ? (
          <div className="p-8 text-center text-xs text-muted-custom space-y-1.5">
            <div className="text-main font-bold">Paste two decodable tokens to compare</div>
            <div>Both panes must contain a 3-part Base64url JWT.</div>
          </div>
        ) : (
          <div className="bg-secondary-custom/50">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)] gap-3 px-4 py-2.5 text-[10px] font-mono-custom text-muted-custom uppercase tracking-widest font-bold">
              <div>claim</div>
              <div>token A</div>
              <div>token B</div>
            </div>
            {visibleRows.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-success-custom font-mono-custom">
                ✓ Every claim matches exactly
              </div>
            ) : (
              visibleRows.map(row => {
                const style = DIFF_STYLE[row.type];
                return (
                  <div
                    key={row.path}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)] gap-3 px-4 py-2.5 text-[11px] font-mono-custom border-t border-main items-start"
                  >
                    <div className="flex items-start gap-1.5 min-w-0">
                      <span className={style.cell}>{style.icon}</span>
                      <span className="text-main break-all">{row.path}</span>
                    </div>
                    <div className="break-all">
                      <span className={row.type === DIFF_TYPES.REMOVED ? "text-rose-300/80 line-through" : "text-muted-custom"}>
                        {formatValue(row.valueA)}
                      </span>
                    </div>
                    <div className="break-all">
                      <span className={row.type === DIFF_TYPES.ADDED ? "text-emerald-300" : style.cell}>
                        {formatValue(row.valueB)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Header diff */}
      {ready && headerDiff.some(item => item.changed) && (
        <div className="rounded-2xl overflow-hidden glass-panel animate-fade-up">
          <div className="px-5 py-3.5 panel-header flex items-center gap-3">
            <span className="cyber-badge text-primary-color">Header</span>
            <span className="text-main text-xs font-bold">JOSE Header Differences</span>
          </div>
          <div className="p-5 bg-secondary-custom/50 space-y-1.5">
            {headerDiff.filter(item => item.changed).map(item => (
              <div key={item.key} className="flex flex-wrap items-center gap-2 text-xs font-mono-custom">
                <span className="badge-amber-outline px-2 py-0.5 rounded font-bold">{item.key}</span>
                <span className="text-muted-custom line-through">{formatValue(item.a)}</span>
                <span className="text-muted-custom">→</span>
                <span className="text-amber-300 font-bold">{formatValue(item.b)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}