export default function DecoderPanel({
  token,
  setToken,
  decode,
  loadSample,
  clear,
  loading,
  error,
  history = [],
  loadHistoryItem,
  clearHistory,
  removeHistoryItem
}) {
  const tokenParts = token.trim().split(".");
  const hasThreeParts = tokenParts.length === 3;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl glow-card animate-fade-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold tracking-widest text-muted-custom uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full dot-indigo glow-pulse" />
              Encoded Token
            </label>
            <div className="flex gap-2">
              <button
                onClick={loadSample}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg btn-action-custom transition-all cursor-pointer"
              >
                Load Sample
              </button>
              {token && (
                <button
                  onClick={clear}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg btn-secondary-custom transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Dot-separated Token Visual Indicator */}
          {token && hasThreeParts && (
            <div className="mb-4 p-4 rounded-xl token-display-box font-mono-custom text-xs leading-relaxed break-all shadow-sm">
              <span className="token-part-header select-all">{tokenParts[0]}</span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="token-part-payload select-all">{tokenParts[1]}</span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="token-part-signature select-all">{tokenParts[2]}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={token}
              onChange={e => {
                setToken(e.target.value);
                if (e.target.value.trim().split(".").length === 3) {
                  decode(e.target.value);
                }
              }}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && decode()}
              placeholder="Paste your base64url JSON Web Token (JWT) here..."
              className="w-full h-48 input-text-custom rounded-xl px-4 py-3.5 font-mono-custom text-xs resize-none transition-all shadow-sm"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              {["Header", "Payload", "Signature"].map((p, i) => (
                <span
                  key={p}
                  className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase ${[
                      "badge-amber-outline",
                      "badge-violet-outline",
                      "badge-emerald-outline"
                    ][i]
                    }`}
                >
                  {p}
                </span>
              ))}
            </div>

            <button
              onClick={() => decode()}
              disabled={!token.trim() || loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase btn-primary-custom disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md glow-pulse cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Decoding
                </>
              ) : (
                <>
                  Decode
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Box */}
      {error && (
        <div className="flex items-start gap-3.5 px-5 py-4 rounded-2xl alert-box-error text-xs animate-fade-up">
          <span className="text-base leading-none">⚠️</span>
          <div>
            <p className="font-bold alert-box-error-title uppercase tracking-wide text-xs">Decode Fail</p>
            <p className="alert-box-error-desc mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* History Card */}
      {history && history.length > 0 && (
        <div className="glass-panel rounded-2xl glow-card animate-fade-up">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4.5">
              <label className="text-xs font-bold tracking-widest text-main uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full dot-cyan glow-pulse" />
                Recent Decoding Sessions
              </label>
              <button
                onClick={clearHistory}
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg btn-secondary-custom transition-all cursor-pointer shadow-sm"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl history-card-item transition-all group cursor-pointer"
                  onClick={() => loadHistoryItem(item.token)}
                >
                  <div className="flex-1 text-left min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-main truncate max-w-[120px] sm:max-w-[160px]">
                        {item.sub || "Unidentified"}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded badge-indigo-outline font-mono-custom">
                        {item.alg}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-custom font-mono-custom truncate mt-1">
                      {item.token.substring(0, 36)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-muted-custom font-medium whitespace-nowrap">
                      {item.time}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(item.id);
                      }}
                      className="text-muted-custom hover:text-danger-custom opacity-0 group-hover:opacity-100 transition-all font-bold text-xs p-1 cursor-pointer"
                      title="Delete entry"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expiry / Signature Info Footer */}
      <div className="p-5 rounded-2xl panel-footer-note text-xs leading-relaxed shadow-sm">
        ⚡ <strong>Developer Notice</strong>: Base64url decoded payloads are plain-text readable. Never include sensitive credentials, database keys, or passwords inside a JWT unless the token payload is fully encrypted.
      </div>
    </div>
  );
}
