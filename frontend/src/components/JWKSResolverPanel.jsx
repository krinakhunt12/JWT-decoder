import { getAlgorithm, isAsymmetric } from "../constants/algorithms";

function statusClass(result) {
  if (!result) return "badge-indigo-outline";
  if (result.overall_valid) return "badge-emerald-outline";
  if (result.signature_valid || result.token_expired) return "badge-amber-outline";
  return "badge-rose-outline";
}

export default function JWKSResolverPanel({
  token,
  header,
  payload,
  jwksUrl,
  setJwksUrl,
  jwksResult,
  resolving,
  resolve,
  onUseMatchedKey,
  onClear
}) {
  const algorithm = header?.alg || "";
  const issuer = payload?.iss || "";
  const usable = Boolean(token) && isAsymmetric(algorithm);
  const matched = jwksResult?.matched_key || null;

  return (
    <div className="rounded-2xl overflow-hidden glass-panel glow-card animate-fade-up">
      <div className="flex items-center justify-between px-5 py-4 panel-header gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-wider px-2.5 py-0.5 rounded-md uppercase badge-cyan-outline">
            JWKS
          </span>
          <span className="font-semibold text-main text-sm tracking-wide">Remote Key Resolution</span>
        </div>

        {jwksResult && (
          <div className={`text-xs font-bold px-3.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${statusClass(jwksResult)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${jwksResult.overall_valid ? "dot-emerald" : "dot-rose animate-ping"}`} />
            {jwksResult.message}
          </div>
        )}
      </div>

      <div className="p-6 bg-secondary-custom/50 space-y-4">
        <p className="text-xs text-muted-custom leading-relaxed">
          Fetches the issuer's public key set (RFC 7517) and matches the token's
          <span className="text-cyan-custom font-mono-custom"> kid</span>, then verifies the
          signature — no key pasting required. Auth0, Okta, Azure AD, Google, Firebase,
          AWS Cognito, Keycloak and Apple are auto-detected; anything else falls back to
          OIDC discovery.
        </p>

        {/* Issuer detection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-custom tracking-wider uppercase mb-1.5 block">
              Issuer <span className="normal-case tracking-normal font-mono-custom">iss</span>
            </label>
            <div className="input-text-custom rounded-xl px-3 py-2.5 text-xs font-mono-custom text-main break-all">
              {issuer || <span className="text-muted-custom">no iss claim in this token</span>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-custom tracking-wider uppercase mb-1.5 block">
              JWKS URL <span className="normal-case tracking-normal">· optional override</span>
            </label>
            <input
              type="text"
              value={jwksUrl}
              onChange={e => setJwksUrl(e.target.value)}
              placeholder="Auto-discover from issuer"
              spellCheck={false}
              className="w-full input-text-custom text-primary-color rounded-xl px-3 py-2.5 text-xs font-mono-custom placeholder-slate-600 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={resolve}
            disabled={resolving || !usable}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-action-custom text-xs font-bold uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer"
          >
            {resolving ? (
              <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Resolving</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" /></svg>Resolve &amp; Verify</>
            )}
          </button>

          {jwksResult && (
            <button
              onClick={onClear}
              className="px-4 py-2.5 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              Reset
            </button>
          )}

          <span className="text-[10px] text-muted-custom font-mono-custom ml-auto">
            {usable
              ? `${algorithm} · ${getAlgorithm(algorithm)?.family} key · kid ${header?.kid || "absent — all keys tried"}`
              : "Requires an RS* or ES* token"}
          </span>
        </div>

        {/* Non-asymmetric notice */}
        {token && !isAsymmetric(algorithm) && (
          <div className="text-xs alert-box-warning rounded-xl px-4 py-2.5">
            <span className="font-bold uppercase tracking-wide alert-box-warning-title mr-2">Not Applicable</span>
            <span className="alert-box-warning-desc">
              {algorithm
                ? `${algorithm} is symmetric — its key is a shared secret and is never published, so there is no key set to fetch. Use the HMAC secret field below.`
                : "This token's algorithm is unknown or unsupported for JWKS resolution. Use RS256/384/512 or ES256/384/512."}
            </span>
          </div>
        )}

        {/* Results */}
        {jwksResult && (
          <div className="pt-3 border-t border-main space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-custom text-muted-custom">
              <div>
                Signature:{" "}
                <strong className={jwksResult.signature_valid ? "text-success-custom" : "text-danger-custom"}>
                  {jwksResult.signature_valid ? "VALID" : "INVALID"}
                </strong>
              </div>
              <div>
                Claims:{" "}
                <strong className={jwksResult.claims_valid ? "text-success-custom" : "text-warning-custom"}>
                  {jwksResult.claims_valid ? "VALID" : "REJECTED"}
                </strong>
              </div>
              <div>
                Key Source:{" "}
                <strong className="text-cyan-custom">{jwksResult.jwks_provider || "—"}</strong>
              </div>
              <div>
                Keys Tried:{" "}
                <strong className="text-main">
                  {jwksResult.keys_tried ?? 0}/{jwksResult.keys_total ?? "?"}
                </strong>
              </div>
            </div>

            {jwksResult.jwks_url && (
              <div className="text-[10px] text-muted-custom font-mono-custom break-all">
                Resolved from: <span className="text-cyan-custom">{jwksResult.jwks_url}</span>
              </div>
            )}

            {jwksResult.key_id && (
              <div className="text-[10px] text-muted-custom font-mono-custom">
                Key ID (kid): <span className="text-cyan-custom">{jwksResult.key_id}</span>
              </div>
            )}

            {matched && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-custom">
                    Matched Public Key
                  </span>
                  <button
                    onClick={() => onUseMatchedKey(JSON.stringify(matched, null, 2))}
                    className="px-3 py-1.5 rounded-lg btn-secondary-custom text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    Use in Verify Panel
                  </button>
                </div>
                <pre className="font-mono-custom text-[10px] leading-relaxed bg-card-custom p-3 rounded-xl border border-main text-main whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(matched, null, 2)}
                </pre>
                <p className="text-[10px] text-muted-custom leading-relaxed">
                  Private parameters are stripped server-side — a published key set never contains them.
                </p>
              </div>
            )}

            {jwksResult.error && (
              <p className="text-xs text-muted-custom leading-relaxed border-l-2 border-main pl-3">
                {jwksResult.error}
              </p>
            )}

            {Array.isArray(jwksResult.attempts) && jwksResult.attempts.length > 0 && (
              <details className="text-[10px] font-mono-custom">
                <summary className="cursor-pointer text-muted-custom hover:text-main uppercase tracking-widest font-bold">
                  Discovery trace · {jwksResult.attempts.length} endpoint(s) tried
                </summary>
                <ul className="mt-2 space-y-1.5">
                  {jwksResult.attempts.map((attempt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={attempt.ok ? "text-success-custom" : "text-danger-custom"}>
                        {attempt.ok ? "✓" : "✗"}
                      </span>
                      <span className="text-muted-custom leading-relaxed break-all">
                        <span className="text-main">{attempt.provider}</span> — {attempt.url}
                        {attempt.detail ? <span className="block opacity-80">{attempt.detail}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}