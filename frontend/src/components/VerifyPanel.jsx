import { ALGORITHM_GROUPS, getAlgorithm, isAsymmetric } from "../constants/algorithms";

export default function VerifyPanel({
  verifyAlgorithm,
  setVerifyAlgorithm,
  verifySecret,
  setVerifySecret,
  verifyPublicKey,
  setVerifyPublicKey,
  verifyResult,
  showSecret,
  setShowSecret,
  showPublicKey,
  setShowPublicKey
}) {
  const asymmetric = isAsymmetric(verifyAlgorithm);
  const meta = getAlgorithm(verifyAlgorithm);
  const missingKey = asymmetric ? !verifyPublicKey.trim() : !verifySecret;

  return (
    <div className="rounded-2xl overflow-hidden glass-panel glow-card animate-fade-up">
      <div className="flex items-center justify-between px-5 py-4 panel-header">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-wider px-2.5 py-0.5 rounded-md uppercase badge-emerald-outline">
            Verify
          </span>
          <span className="font-semibold text-main text-sm tracking-wide">Signature Verification</span>
        </div>

        {/* Live feedback pill */}
        {verifyResult && (
          <div className={`text-xs font-bold px-3.5 py-1 rounded-full border transition-all flex items-center gap-1.5
            ${verifyResult.overall_valid
              ? "badge-emerald-outline"
              : "badge-rose-outline"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${verifyResult.overall_valid ? "dot-emerald" : "dot-rose animate-ping"}`} />
            {verifyResult.message}
          </div>
        )}
      </div>

      <div className="p-6 bg-secondary-custom/50 space-y-4">
        {/* Grid settings for cryptographic check */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Algorithm selector */}
          <div>
            <label className="text-xs font-bold text-muted-custom tracking-wider uppercase mb-1.5 block">Algorithm</label>
            <select
              value={verifyAlgorithm}
              onChange={e => setVerifyAlgorithm(e.target.value)}
              className="w-full input-text-custom rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer shadow-sm"
            >
              {ALGORITHM_GROUPS.map(group => (
                <optgroup key={group.family} label={group.label}>
                  {group.algorithms.map(alg => (
                    <option key={alg.value} value={alg.value}>{alg.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Symmetric secret key */}
          {!asymmetric && (
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-custom tracking-wider uppercase mb-1.5 block">HMAC Secret Key</label>
              <div className="relative flex items-center">
                <input
                  type={showSecret ? "text" : "password"}
                  value={verifySecret}
                  onChange={e => setVerifySecret(e.target.value)}
                  placeholder="Enter signature secret key..."
                  className="w-full input-text-custom text-primary-color rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono-custom placeholder-slate-400 focus:outline-none shadow-sm"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 text-muted-custom hover:text-main transition-all cursor-pointer"
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Asymmetric public key */}
          {asymmetric && (
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-muted-custom tracking-wider uppercase">
                  {meta.family} Public Key
                </label>
                <div className="flex items-center gap-3">
                  {meta.curve && (
                    <span className="text-[9px] font-bold uppercase tracking-wider badge-cyan-outline font-mono-custom">
                      curve {meta.curve}
                    </span>
                  )}
                  <button
                    onClick={() => setShowPublicKey(!showPublicKey)}
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg btn-secondary-custom transition-all cursor-pointer shadow-sm"
                  >
                    {showPublicKey ? "Compact" : "Expanded"}
                  </button>
                </div>
              </div>
              <textarea
                value={verifyPublicKey}
                onChange={e => setVerifyPublicKey(e.target.value)}
                rows={showPublicKey ? 10 : 3}
                placeholder={"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----"}
                className={`w-full input-text-custom rounded-xl px-3 py-2.5 text-primary-color text-[11px] font-mono-custom placeholder-slate-600 focus:outline-none resize-none shadow-sm ${missingKey ? "input-error" : ""}`}
                spellCheck={false}
              />
              <p className="text-[10px] text-muted-custom mt-1.5 leading-relaxed">
                Accepts a PEM public key (SPKI or PKCS#1), an X.509 certificate, or a JWK JSON object.
                Only the public half is needed — never paste a private key.
              </p>
            </div>
          )}
        </div>

        {/* Awaiting key material */}
        {missingKey && (
          <div className="text-xs alert-box-warning rounded-xl px-4 py-2.5">
            <span className="font-bold uppercase tracking-wide alert-box-warning-title mr-2">Awaiting Key</span>
            <span className="alert-box-warning-desc">
              {asymmetric
                ? `Paste the issuer's ${meta.family} public key to verify this ${verifyAlgorithm} token.`
                : "Enter the shared secret to verify this token."}
            </span>
          </div>
        )}

        {/* Display live verify feedback details */}
        {verifyResult && (
          <div className="pt-3 border-t border-main space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-custom text-muted-custom">
              <div>
                Signature Integrity:{" "}
                <strong className={verifyResult.signature_valid ? "text-success-custom" : "text-danger-custom"}>
                  {verifyResult.signature_valid ? "VALID" : "INVALID"}
                </strong>
              </div>
              <div>
                Token Expiration:{" "}
                <strong className={verifyResult.token_expired ? "text-danger-custom" : "text-success-custom"}>
                  {verifyResult.token_expired ? "EXPIRED" : "ACTIVE"}
                </strong>
              </div>
              <div>
                Registered Claims:{" "}
                <strong className={verifyResult.claims_valid ? "text-success-custom" : "text-warning-custom"}>
                  {verifyResult.claims_valid ? "VALID" : "REJECTED"}
                </strong>
              </div>
              <div>
                Overall Status:{" "}
                <strong className={verifyResult.overall_valid ? "text-success-custom" : "text-danger-custom"}>
                  {verifyResult.overall_valid ? "VERIFIED ✓" : "UNVERIFIED ✗"}
                </strong>
              </div>
            </div>

            {verifyResult.key_id && (
              <div className="text-[10px] text-muted-custom font-mono-custom">
                Key ID (kid): <span className="text-cyan-custom">{verifyResult.key_id}</span>
              </div>
            )}

            {verifyResult.error && (
              <p className="text-xs text-muted-custom leading-relaxed border-l-2 border-main pl-3">
                {verifyResult.error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
