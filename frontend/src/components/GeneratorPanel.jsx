import CopyButton from "./CopyButton";
import SectionCard from "./SectionCard";

const PRESET_PAYLOADS = {
  user_session: {
    iss: "auth-service.codesmiths.io",
    sub: "usr_92837",
    aud: "web-client-gateway",
    name: "Krina",
    role: "senior_developer",
    tenant: "codesmiths",
    scopes: ["profile:read", "code:write", "workspace:manage"],
    nbf: Math.floor(Date.now() / 1000) - 10,
  },
  admin_session: {
    iss: "auth-service.codesmiths.io",
    sub: "admin_49201",
    aud: "management-console-api",
    role: "super_administrator",
    admin: true,
    name: "Krina Admin",
    department: "Platform Engineering",
    mfa_verified: true,
    scopes: ["users:manage", "settings:write", "system:config", "billing:read", "audit_logs:read"],
  },
  service_token: {
    iss: "api-gateway.internal",
    sub: "svc:nexus-core-service",
    aud: "internal-api-mesh",
    service: true,
    environment: "production",
    ip_whitelist: ["10.0.4.82", "10.0.4.83"],
    rate_limit_per_min: 10000,
    scopes: ["events:publish", "metrics:write", "health:read"],
  },
  oauth_token: {
    iss: "oauth.codesmiths.io",
    sub: "oauth_client:nexus_dashboard",
    aud: "api-gateway",
    client_id: "nexus_dashboard_v2",
    grant_type: "authorization_code",
    oauth_scopes: ["repo:read", "deploy:trigger", "logs:read", "user:email"],
  },
};

const PRESET_LABELS = {
  user_session: "User Session",
  admin_session: "Admin Session",
  service_token: "Service Token",
  oauth_token: "OAuth Client",
};

export default function GeneratorPanel({
  genHeaderAlg, setGenHeaderAlg,
  genPayloadStr, setGenPayloadStr,
  genSecret, setGenSecret,
  genExpiresIn, setGenExpiresIn,
  generatedToken, genResult, genError,
  showGenSecret, setShowGenSecret,
  openInDecoder,
}) {
  const isJsonValid = (() => {
    try { JSON.parse(genPayloadStr); return true; } catch { return false; }
  })();

  const loadPreset = (key) => {
    const p = { ...PRESET_PAYLOADS[key], iat: Math.floor(Date.now() / 1000) };
    setGenPayloadStr(JSON.stringify(p, null, 2));
  };

  const tokenParts = generatedToken.split(".");
  const hasThreeParts = tokenParts.length === 3;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: inputs */}
        <div className="space-y-5">
          {/* Preset selector */}
          <div className="glass-panel rounded-2xl p-5 glow-card">
            <label className="text-[10px] font-bold tracking-widest text-muted-custom uppercase flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full dot-violet" />
              Payload Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRESET_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className="px-3 py-2 rounded-xl text-xs font-bold btn-violet-action transition-all cursor-pointer text-left"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Algorithm + expiry */}
          <div className="glass-panel rounded-2xl p-5 glow-card space-y-4">
            <label className="text-[10px] font-bold tracking-widest text-muted-custom uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full dot-cyan" />
              Token Settings
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted-custom tracking-widest uppercase mb-1.5 block">Algorithm</label>
                <select
                  value={genHeaderAlg}
                  onChange={e => setGenHeaderAlg(e.target.value)}
                  className="w-full input-text-custom rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer font-mono-custom shadow-sm"
                >
                  <option value="HS256">HS256 — SHA-256</option>
                  <option value="HS384">HS384 — SHA-384</option>
                  <option value="HS512">HS512 — SHA-512</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-custom tracking-widest uppercase mb-1.5 block">Expires In (s)</label>
                <input
                  type="number"
                  value={genExpiresIn}
                  onChange={e => setGenExpiresIn(e.target.value)}
                  placeholder="86400"
                  className="w-full input-text-custom rounded-xl px-3 py-2.5 text-xs placeholder-slate-400 focus:outline-none font-mono-custom shadow-sm"
                />
              </div>
            </div>

            {/* Quick TTL buttons */}
            <div className="flex flex-wrap gap-2">
              {[["15m", 900], ["1h", 3600], ["1d", 86400], ["7d", 604800], ["∞", null]].map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => setGenExpiresIn(val === null ? "" : String(val))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all border
                    ${(genExpiresIn === String(val) || (val === null && genExpiresIn === ""))
                      ? "badge-indigo-outline"
                      : "btn-secondary-custom"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Secret key */}
            <div>
              <label className="text-[10px] font-bold text-muted-custom tracking-widest uppercase mb-1.5 block">HMAC Secret Key</label>
              <div className="relative">
                <input
                  type={showGenSecret ? "text" : "password"}
                  value={genSecret}
                  onChange={e => setGenSecret(e.target.value)}
                  placeholder="Enter signing secret..."
                  className="w-full input-text-custom rounded-xl pl-3 pr-10 py-2.5 text-xs text-primary-color placeholder-slate-400 focus:outline-none font-mono-custom shadow-sm"
                />
                <button
                  onClick={() => setShowGenSecret(!showGenSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-main cursor-pointer"
                >
                  {showGenSecret ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: payload editor */}
        <div className="glass-panel rounded-2xl glow-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-bold tracking-widest text-muted-custom uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full dot-violet" />
              Payload JSON Editor
            </label>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${isJsonValid
                ? "badge-indigo-outline"
                : "badge-rose-outline"
              }`}>
              {isJsonValid ? "valid json" : "invalid json"}
            </span>
          </div>
          <textarea
            value={genPayloadStr}
            onChange={e => setGenPayloadStr(e.target.value)}
            className={`flex-1 min-h-[240px] input-text-custom rounded-xl px-4 py-3 font-mono-custom text-xs placeholder-slate-400 resize-none focus:outline-none transition-all shadow-sm
              ${isJsonValid ? "" : "input-error"}`}
            spellCheck={false}
            placeholder='{"sub": "user_123", "name": "Developer"}'
          />
          {genError && !genError.includes("JSON") && (
            <div className="mt-3 text-xs font-mono-custom alert-box-error rounded-xl px-4 py-2.5">
              ✗ {genError}
            </div>
          )}
        </div>
      </div>

      {/* Generated token output */}
      {generatedToken && (
        <div className="space-y-5 animate-fade-up">
          {/* Token display */}
          <div className="glass-panel rounded-2xl overflow-hidden glow-card">
            <div className="flex items-center justify-between px-5 py-3.5 panel-header">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full dot-cyan glow-pulse" />
                <span className="text-xs font-bold text-main tracking-wide uppercase font-mono-custom">Generated JWT</span>
              </div>
              <CopyButton text={generatedToken} label="Copy Token" />
            </div>

            <div className="p-5">
              {hasThreeParts && (
                <div className="p-4 rounded-xl token-display-box font-mono-custom text-xs leading-relaxed break-all mb-4 shadow-sm">
                  <span className="token-part-header">{tokenParts[0]}</span>
                  <span className="text-muted-custom font-bold mx-0.5">.</span>
                  <span className="token-part-payload">{tokenParts[1]}</span>
                  <span className="text-muted-custom font-bold mx-0.5">.</span>
                  <span className="token-part-signature">{tokenParts[2]}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => openInDecoder(generatedToken)}
                  className="flex-1 px-4 py-2.5 rounded-xl btn-action-custom text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shadow-sm"
                >
                  Open in Decoder →
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown cards */}
          {genResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SectionCard title="Generated Header" badge="Header" badgeColor="#e11d48" data={genResult.header} />
              <SectionCard title="Generated Payload" badge="Payload" badgeColor="#7c3aed" data={genResult.payload} />
            </div>
          )}
        </div>
      )}

      {/* Notice */}
      <div className="p-4 rounded-2xl panel-footer-note text-xs leading-relaxed font-mono-custom shadow-sm">
        ⚠ <strong>Security Notice</strong>: This panel signs with symmetric HMAC only (HS256/384/512) because the server never holds a private key. Tokens signed with RS*/ES* are verified in the Decoder with a public key.
      </div>
    </div>
  );
}
