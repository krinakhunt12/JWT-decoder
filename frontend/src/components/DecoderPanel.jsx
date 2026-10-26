import { useState } from "react";

export default function DecoderPanel({
  token,
  setToken,
  decode,
  loadSample,
  loadSampleJwe,
  clear,
  loading,
  error,
  history = [],
  loadHistoryItem,
  clearHistory,
  removeHistoryItem,
}) {
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const tokenParts = token.trim().split(".");
  const hasThreeParts = tokenParts.length === 3;
  const isJwe = tokenParts.length === 5;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl glow-card animate-fade-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold tracking-widest text-muted-custom uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full dot-indigo glow-pulse" />
              Encoded Token {isJwe && <span className="text-[10px] text-purple-400 font-mono">(JWE)</span>}
            </label>
            <div className="flex items-center gap-2 relative">
              {/* Sample Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg btn-action-custom transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Samples</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showSampleDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-main bg-card-custom/95 backdrop-blur-xl p-1.5 shadow-xl z-50 animate-scale-in text-xs font-mono space-y-1">
                    <button
                      onClick={() => {
                        loadSample();
                        setShowSampleDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary-custom transition-all flex items-center gap-2 text-main cursor-pointer"
                    >
                      <span>📜</span>
                      <div>
                        <div className="font-bold">Standard JWT (JWS)</div>
                        <div className="text-[10px] text-muted-custom">HS256 · 3 parts</div>
                      </div>
                    </button>

                    {loadSampleJwe && (
                      <>
                        <button
                          onClick={() => {
                            loadSampleJwe("direct");
                            setShowSampleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary-custom transition-all flex items-center gap-2 text-main cursor-pointer"
                        >
                          <span>🔏</span>
                          <div>
                            <div className="font-bold text-purple-400">JWE Banking (AES)</div>
                            <div className="text-[10px] text-muted-custom">dir + A256GCM · 5 parts</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            loadSampleJwe("rsa");
                            setShowSampleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary-custom transition-all flex items-center gap-2 text-main cursor-pointer"
                        >
                          <span>🏥</span>
                          <div>
                            <div className="font-bold text-cyan-400">JWE HIPAA (RSA)</div>
                            <div className="text-[10px] text-muted-custom">RSA-OAEP-256 · 5 parts</div>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

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

          {/* ── Standard 3-Part JWS Dot-separated Visual Indicator ── */}
          {token && hasThreeParts && (
            <div className="mb-4 p-4 rounded-xl token-display-box font-mono-custom text-xs leading-relaxed break-all shadow-sm">
              <span className="token-part-header select-all" title="Header (Algorithm & Token Type)">{tokenParts[0]}</span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="token-part-payload select-all" title="Payload (Claims Data)">{tokenParts[1]}</span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="token-part-signature select-all" title="Digital Signature">{tokenParts[2]}</span>
            </div>
          )}

          {/* ── 5-Part JWE (RFC 7516) Dot-separated Visual Indicator ── */}
          {token && isJwe && (
            <div className="mb-4 p-4 rounded-xl token-display-box font-mono-custom text-xs leading-relaxed break-all shadow-sm border border-purple-500/20">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                RFC 7516 JWE (5 Encrypted Segments)
              </div>
              <span className="token-part-header select-all" title="1. Protected Header">{tokenParts[0]}</span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="text-amber-500 font-semibold select-all" title="2. Encrypted Key">
                {tokenParts[1] || "[Direct / Empty]"}
              </span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="text-cyan-400 font-semibold select-all" title="3. Initialization Vector (IV)">{tokenParts[2]}</span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="token-part-payload select-all" title="4. Ciphertext Payload">{tokenParts[3]}</span>
              <span className="text-muted-custom font-bold mx-0.5">.</span>
              <span className="token-part-signature select-all" title="5. Authentication Tag">{tokenParts[4]}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={token}
              onChange={e => {
                setToken(e.target.value);
                const count = e.target.value.trim().split(".").length;
                if (count === 3 || count === 5) {
                  decode(e.target.value);
                }
              }}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && decode()}
              placeholder="Paste your base64url JSON Web Token (JWS 3-part or JWE 5-part) here..."
              className="w-full h-48 input-text-custom rounded-xl px-4 py-3.5 font-mono-custom text-xs resize-none transition-all shadow-sm"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            {/* Segment Identification Badges */}
            {isJwe ? (
              <div className="flex flex-wrap gap-1.5">
                {["1. Header", "2. Enc Key", "3. IV", "4. Ciphertext", "5. Tag"].map((p, i) => (
                  <span
                    key={p}
                    className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase font-mono-custom ${[
                        "badge-rose-outline",
                        "badge-amber-outline",
                        "badge-cyan-outline",
                        "badge-violet-outline",
                        "badge-emerald-outline"
                      ][i]
                      }`}
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
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
            )}

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

          {error && (
            <div className="mt-4 p-4 rounded-xl alert-box-error text-xs flex items-center gap-3">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="font-mono-custom text-xs alert-box-error-desc break-all">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History panel */}
      {history.length > 0 && (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
          <div className="panel-header px-6 py-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-custom flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent History
            </span>
            <button
              onClick={clearHistory}
              className="text-[10px] text-muted-custom hover:text-red-500 transition-colors uppercase font-bold tracking-wider cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="divide-y divide-main max-h-60 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 history-card-item flex items-center justify-between gap-3 group transition-colors"
              >
                <div
                  onClick={() => loadHistoryItem(item.token)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-main truncate">
                      {item.sub}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded badge-indigo-outline">
                      {item.alg}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-custom font-mono-custom truncate">
                    {item.token}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-muted-custom font-mono-custom hidden sm:inline">
                    {item.time}
                  </span>
                  <button
                    onClick={() => removeHistoryItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-custom hover:text-red-500 rounded transition-all cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
