import { useState } from "react";
import CopyButton from "./CopyButton";
import JsonTree from "./JsonTree";
import TimeBadge from "./TimeBadge";
import { JWE_KEY_ALGORITHMS, JWE_ENC_ALGORITHMS } from "../utils/jwe";

export default function JWEDecoderPanel({
  result,
  jweKey,
  setJweKey,
  onDecrypt,
  decryptedData,
  decrypting,
  decryptError,
  onLoadSampleKey,
}) {
  const [activeView, setActiveView] = useState("formatted"); // 'formatted' | 'raw'
  const header = result?.header || {};
  const meta = result?.jwe_meta || {};
  const alg = header.alg || "Unknown";
  const enc = header.enc || "Unknown";

  const algInfo = JWE_KEY_ALGORITHMS[alg] || { name: alg, desc: "Key management algorithm" };
  const encInfo = JWE_ENC_ALGORITHMS[enc] || { name: enc, desc: "Content encryption algorithm" };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─── 1. JWE Cryptographic Suite Overview Card ─── */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-purple-500/30 shadow-md">
        <div className="panel-header px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-purple-950/20 to-cyan-950/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">🔏</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-main font-display-custom">
                  RFC 7516 JSON Web Encryption (JWE)
                </h3>
                <span className="cyber-badge text-purple-400 bg-purple-500/10 border-purple-500/30">
                  5 Segments
                </span>
              </div>
              <p className="text-[11px] text-muted-custom font-mono-custom mt-0.5">
                Authenticated Confidentiality · AEAD Ciphertext Payload
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider badge-violet-outline">
              Key: {alg}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider badge-cyan-outline">
              Enc: {enc}
            </span>
          </div>
        </div>

        {/* Algorithm Architecture Spec */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-main bg-card-custom/40 text-xs">
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Key Management ({alg})
            </div>
            <div className="font-bold text-main">{algInfo.name}</div>
            <p className="text-muted-custom text-[11px] leading-relaxed">{algInfo.desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Content Cipher ({enc})
            </div>
            <div className="font-bold text-main">{encInfo.name}</div>
            <p className="text-muted-custom text-[11px] leading-relaxed">{encInfo.desc}</p>
          </div>
        </div>

        {/* ─── 5-Part Cryptographic Anatomy Visual Bar ─── */}
        <div className="p-6 space-y-3">
          <div className="text-[11px] font-bold text-muted-custom uppercase tracking-wider font-mono-custom flex items-center justify-between">
            <span>5-Segment Structure Breakdown</span>
            <span className="text-[10px] text-purple-400 font-semibold">AEAD Authenticated</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center font-mono-custom text-[10px]">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <div className="font-bold uppercase tracking-wider">1. Header</div>
              <div className="text-[9px] opacity-75 mt-0.5 truncate">{result?.raw_parts?.header?.length || 0} chars</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <div className="font-bold uppercase tracking-wider">2. Enc Key</div>
              <div className="text-[9px] opacity-75 mt-0.5 truncate">{result?.raw_parts?.encrypted_key?.length || 0} chars</div>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <div className="font-bold uppercase tracking-wider">3. IV / Nonce</div>
              <div className="text-[9px] opacity-75 mt-0.5 truncate">{result?.raw_parts?.iv?.length || 0} chars</div>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <div className="font-bold uppercase tracking-wider">4. Ciphertext</div>
              <div className="text-[9px] opacity-75 mt-0.5 truncate">{result?.raw_parts?.ciphertext?.length || 0} chars</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <div className="font-bold uppercase tracking-wider">5. Auth Tag</div>
              <div className="text-[9px] opacity-75 mt-0.5 truncate">{result?.raw_parts?.tag?.length || 0} chars</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. JWE Protected Header Inspector ─── */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-main shadow-xs">
        <div className="panel-header px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-bold text-main uppercase tracking-wider font-mono-custom">
              Protected Header Claims
            </span>
          </div>
          <CopyButton text={JSON.stringify(header, null, 2)} />
        </div>
        <div className="p-6">
          <JsonTree data={header} />
        </div>
      </div>

      {/* ─── 3. Live JWE Decryption Workbench ─── */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-main glow-card shadow-sm">
        <div className="panel-header px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold text-main uppercase tracking-wider font-mono-custom">
              Live JWE Decryption Tool
            </h3>
          </div>

          {onLoadSampleKey && (
            <button
              onClick={onLoadSampleKey}
              className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase btn-action-custom cursor-pointer transition-all hover:scale-[1.02]"
            >
              Load Matching Demo Key ✨
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-main font-mono-custom flex items-center gap-1.5">
                <span>Decryption Key Input</span>
                <span className="text-[10px] text-muted-custom font-normal">
                  ({alg === "dir" ? "32-byte AES Shared Secret" : "Private RSA Key in PEM format"})
                </span>
              </label>

              {jweKey && (
                <button
                  onClick={() => setJweKey("")}
                  className="text-[11px] text-muted-custom hover:text-main cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={jweKey}
              onChange={(e) => setJweKey(e.target.value)}
              placeholder={
                alg === "dir"
                  ? "Enter 32-character AES secret key (e.g. 0123456789abcdef0123456789abcdef)..."
                  : "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD4u0gYsN/r5hJd...\n-----END PRIVATE KEY-----"
              }
              rows={alg === "dir" ? 2 : 5}
              className="w-full input-text-custom rounded-xl p-3.5 font-mono-custom text-xs resize-y transition-all shadow-sm focus:ring-2 focus:ring-cyan-500/20"
              spellCheck={false}
            />
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="text-[11px] text-muted-custom font-mono-custom">
              Engine: <strong className="text-primary-color">SubtleCrypto WebCrypto</strong> + Zero Key Logging
            </div>

            <button
              onClick={() => onDecrypt()}
              disabled={!jweKey?.trim() || decrypting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider btn-primary-custom disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-2 shadow-sm"
            >
              {decrypting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Decrypt JWE Payload</span>
                </>
              )}
            </button>
          </div>

          {/* Decryption Error Alert */}
          {decryptError && (
            <div className="p-4 rounded-xl alert-box-error text-xs space-y-1 animate-fade-up">
              <div className="font-bold alert-box-error-title flex items-center gap-2">
                <span>⚠️</span>
                <span>Decryption / Tag Verification Failed</span>
              </div>
              <p className="alert-box-error-desc font-mono-custom text-[11px]">
                {decryptError}
              </p>
            </div>
          )}

          {/* ─── Decrypted Payload Output ─── */}
          {decryptedData && (
            <div className="mt-6 pt-6 border-t border-main space-y-4 animate-scale-in">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono-custom">
                  <span>✓</span>
                  <span>Payload Decrypted & Authentication Tag Verified (AEAD Pass)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-main p-0.5 bg-card-custom text-[10px] font-mono">
                    <button
                      onClick={() => setActiveView("formatted")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeView === "formatted"
                          ? "bg-primary-color text-white font-bold"
                          : "text-muted-custom hover:text-main"
                        }`}
                    >
                      JSON Tree
                    </button>
                    <button
                      onClick={() => setActiveView("raw")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeView === "raw"
                          ? "bg-primary-color text-white font-bold"
                          : "text-muted-custom hover:text-main"
                        }`}
                    >
                      Raw Text
                    </button>
                  </div>
                  <CopyButton
                    text={
                      typeof decryptedData.payload === "object"
                        ? JSON.stringify(decryptedData.payload, null, 2)
                        : String(decryptedData.raw || decryptedData.payload)
                    }
                  />
                </div>
              </div>

              {/* Timestamp Badges if present in decrypted payload */}
              {decryptedData.payload && typeof decryptedData.payload === "object" && (
                <div className="flex flex-wrap gap-2">
                  {["iat", "exp", "nbf"].map((k) =>
                    decryptedData.payload[k] ? (
                      <TimeBadge key={k} label={k} ts={decryptedData.payload[k]} />
                    ) : null
                  )}
                </div>
              )}

              {/* Display View */}
              <div className="p-4 rounded-xl token-display-box overflow-hidden">
                {activeView === "formatted" && typeof decryptedData.payload === "object" ? (
                  <JsonTree data={decryptedData.payload} />
                ) : (
                  <pre className="font-mono-custom text-xs text-main overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                    {decryptedData.raw || JSON.stringify(decryptedData.payload, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
