import { useCallback, useEffect, useRef, useState } from "react";
import { getAlgorithm, isAsymmetric } from "../constants/algorithms";
import { decodeToken, forgeConfusionToken, forgeUnsignedToken, webCryptoAvailable } from "../utils/jwt";
import { SEED_GROUPS, TOTAL_CANDIDATES } from "../constants/weakSecrets";

const API = "http://localhost:8000";

const CLAIM_GUIDANCE = {
  exp: { severity: "critical", text: "No expiration — the token stays valid forever once leaked." },
  nbf: { severity: "info", text: "No not-before — fine for most systems, but it allows pre-emptive replay." },
  iat: { severity: "warning", text: "No issued-at — you cannot reason about token age or detect replays." },
  aud: { severity: "critical", text: "No audience — any service holding a trusted key will accept this token." },
  iss: { severity: "critical", text: "No issuer — token origin cannot be validated." },
  sub: { severity: "warning", text: "No subject — the token identifies nobody." },
  jti: { severity: "info", text: "No token id — enables replay before expiry without detection." },
};

function severityBadge(severity) {
  return {
    critical: "badge-rose-outline",
    warning: "badge-amber-outline",
    info: "badge-indigo-outline",
    pass: "badge-emerald-outline",
  }[severity];
}

function Row({ tone, icon, label, children }) {
  const toneClass = {
    critical: "badge-rose-outline",
    warning: "badge-amber-outline",
    info: "badge-indigo-outline",
    pass: "badge-emerald-outline",
    busy: "badge-cyan-outline",
  }[tone];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-xs ${toneClass}`}>
      <span className="font-bold mt-0.5">{icon}</span>
      <div className="min-w-0">
        <span className="font-bold block font-mono-custom">{label}</span>
        <div className="text-xs opacity-80 mt-0.5 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function AuditPanel({ token, result, verifyPublicKey }) {
  const [crackState, setCrackState] = useState({ status: "idle" });
  const [probe, setProbe] = useState({ status: "idle", results: [] });
  const [probeBusy, setProbeBusy] = useState(false);
  const workerRef = useRef(null);

  const header = result?.header;
  const payload = result?.payload;
  const alg = header?.alg || "";
  const symmetric = getAlgorithm(alg)?.family === "HMAC";
  const decoded = token ? decodeToken(token) : null;

  useEffect(() => {
    const worker = new Worker(new URL("../workers/secretCracker.worker.js", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = event => {
      const message = event.data;
      if (message.type === "progress") {
        setCrackState(prev => ({ ...prev, status: "running", tested: message.tested, total: message.total, percent: message.percent }));
      } else if (message.type === "cracked") {
        setCrackState({ status: "cracked", secret: message.secret, index: message.index, total: message.total, elapsedMs: message.elapsedMs });
      } else if (message.type === "exhausted") {
        setCrackState({ status: "exhausted", total: message.total, elapsedMs: message.elapsedMs });
      } else if (message.type === "error") {
        setCrackState({ status: "error", error: message.error });
      }
    };
    return () => worker.terminate();
  }, []);

  // Reset results during render when the token changes. Doing this in an effect
  // would set state synchronously and trigger a cascading render.
  const [lastToken, setLastToken] = useState(token);
  if (token !== lastToken) {
    setLastToken(token);
    setCrackState({ status: "idle" });
    setProbe({ status: "idle", results: [] });
  }

  const startCrack = useCallback(() => {
    if (!workerRef.current || !token) return;
    setCrackState({ status: "running", tested: 0, total: TOTAL_CANDIDATES, percent: 0 });
    workerRef.current.postMessage({ type: "crack", token: token.trim(), alg });
  }, [token, alg]);

  const runProbes = useCallback(async () => {
    if (!decoded) return;
    setProbeBusy(true);
    setProbe({ status: "running", results: [] });
    const findings = [];

    // Probe 1 — would a verifier accept alg:none (an unsigned token)?
    try {
      const unsigned = forgeUnsignedToken(decoded.payload);
      const response = await fetch(`${API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: unsigned, algorithm: "none", secret: "" }),
      });
      const data = await response.json();
      const accepted = Boolean(data.overall_valid);
      findings.push({
        id: "alg-none",
        name: "alg: none acceptance",
        passed: !accepted,
        detail: accepted
          ? `The API accepted an unsigned token (${data.message}).`
          : `Unsigned token rejected — ${data.message || data.error || "verifier refused"}.`,
      });
    } catch (error) {
      findings.push({ id: "alg-none", name: "alg: none acceptance", passed: false, detail: `Probe failed: ${error.message}` });
    }

    // Probe 2 — algorithm confusion: forge HS256 using the RSA/EC public key.
    if (verifyPublicKey.trim() && isAsymmetric(alg)) {
      try {
        const forged = await forgeConfusionToken(
          { ...decoded.payload, sub: "attacker", role: "admin" },
          verifyPublicKey.trim(),
          "HS256",
        );
        if (!forged) {
          findings.push({ id: "confusion", name: "Algorithm confusion (RS/ES key as HMAC secret)", passed: false, detail: "Could not forge a token — WebCrypto unavailable." });
        } else {
          const response = await fetch(`${API}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: forged, algorithm: "HS256", secret: verifyPublicKey.trim() }),
          });
          const data = await response.json();
          const accepted = Boolean(data.overall_valid);
          findings.push({
            id: "confusion",
            name: "Algorithm confusion (RS/ES key as HMAC secret)",
            passed: !accepted,
            detail: accepted
              ? `CRITICAL — a token forged with the public key as the HMAC secret was accepted (${data.message}).`
              : `Forged token rejected — ${data.error || data.message}.`,
          });
        }
      } catch (error) {
        findings.push({ id: "confusion", name: "Algorithm confusion (RS/ES key as HMAC secret)", passed: false, detail: `Probe failed: ${error.message}` });
      }
    }

    setProbe({ status: "done", results: findings });
    setProbeBusy(false);
  }, [decoded, verifyPublicKey, alg]);

  const claimFindings = ["exp", "iss", "aud", "sub", "iat", "nbf", "jti"].map(claim => ({
    claim,
    present: payload ? Object.prototype.hasOwnProperty.call(payload, claim) : false,
    ...(payload ? {} : CLAIM_GUIDANCE[claim]),
    guidance: CLAIM_GUIDANCE[claim],
  }));

  return (
    <div className="space-y-5">
      {/* ── Weak secret cracker ─────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden glass-panel glow-card animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 panel-header gap-3">
          <div className="flex items-center gap-3">
            <span className="cyber-badge text-primary-color">Crack</span>
            <span className="font-semibold text-main text-sm tracking-wide">Weak Secret Dictionary Attack</span>
          </div>
          <span className="text-[10px] font-mono-custom text-muted-custom">{TOTAL_CANDIDATES.toLocaleString()} candidates</span>
        </div>

        <div className="p-6 bg-secondary-custom/50 space-y-4">
          <p className="text-xs text-muted-custom leading-relaxed">
            Tests this HMAC token against {TOTAL_CANDIDATES.toLocaleString()} predictable secrets — framework
            defaults, leaked-password top lists, service names and their common mutations. A hit means
            anyone who guesses it can mint valid tokens for your API.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={startCrack}
              disabled={crackState.status === "running" || !symmetric || !token}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-action-custom text-xs font-bold uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer"
            >
              {crackState.status === "running" ? (
                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{crackState.percent || 0}%</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 11-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>Run Dictionary Attack</>
              )}
            </button>
            <span className="text-[10px] text-muted-custom font-mono-custom">
              {symmetric
                ? `${alg} · Web Worker · nothing leaves this browser`
                : !token
                  ? "Paste a token first"
                  : `${alg} is asymmetric — there is no shared secret to guess`}
            </span>
          </div>

          {crackState.status === "running" && (
            <div className="w-full h-1.5 rounded-full bg-main overflow-hidden">
              <div className="h-full bg-primary-color transition-all duration-200" style={{ width: `${crackState.percent || 0}%` }} />
            </div>
          )}

          <div className="space-y-2.5">
            {!webCryptoAvailable() && (
              <Row tone="warning" icon="⚠" label="WebCrypto unavailable">
                Browsers expose <code className="font-mono-custom">crypto.subtle</code> only on secure origins.
                Use <code className="font-mono-custom">http://localhost</code> or HTTPS.
              </Row>
            )}

            {crackState.status === "cracked" && (
              <Row tone="critical" icon="✗" label="Weak secret recovered — CRITICAL">
                <div className="mt-1.5 px-3 py-2 rounded-lg bg-card-custom border border-main font-mono-custom text-success-custom break-all">
                  {crackState.secret}
                </div>
                <div className="mt-1.5 opacity-80">
                  Found at candidate #{crackState.index + 1} of {crackState.total.toLocaleString()} in {crackState.elapsedMs} ms.
                  Rotate this secret now — anyone can reproduce the signature with it.
                </div>
              </Row>
            )}

            {crackState.status === "exhausted" && (
              <Row tone="pass" icon="✓" label="No weak secret in dictionary">
                All {crackState.total.toLocaleString()} candidates failed in {crackState.elapsedMs} ms. Not proof of
                strength — an unusual secret can still be brute-forced — but it rules out the common cases.
              </Row>
            )}

            {crackState.status === "error" && (
              <Row tone="warning" icon="⚠" label="Cracker error">{crackState.error}</Row>
            )}
          </div>

          <details className="text-[10px] text-muted-custom font-mono-custom">
            <summary className="cursor-pointer hover:text-main uppercase tracking-widest font-bold">
              Dictionary composition
            </summary>
            <p className="mt-2 leading-relaxed">
              Seed groups: {SEED_GROUPS.join(", ")} — each expanded with common numeric, separator and year
              mutations plus prefix/capitalisation variants. Candidate secrets are compared in constant time
              against the token signature; the sweep runs in a Web Worker and no candidate leaves the browser.
            </p>
          </details>
        </div>
      </div>

      {/* ── Algorithm misconfiguration probes ───────────────────────────── */}
      <div className="rounded-2xl overflow-hidden glass-panel glow-card animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 panel-header gap-3">
          <div className="flex items-center gap-3">
            <span className="cyber-badge text-primary-color">Probe</span>
            <span className="font-semibold text-main text-sm tracking-wide">Algorithm Misconfiguration</span>
          </div>
        </div>

        <div className="p-6 bg-secondary-custom/50 space-y-4">
          <p className="text-xs text-muted-custom leading-relaxed">
            Actively attacks the running verifier. Each probe crafts a malicious token and submits it to
            <code className="font-mono-custom text-cyan-custom"> POST /verify</code> — a pass means the API
            refused the forgery.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={runProbes}
              disabled={probeBusy || !decoded}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-action-custom text-xs font-bold uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer"
            >
              {probeBusy ? (
                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Attacking</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0l-7.93 12a2 2 0 001.74 3z" /></svg>Run Attack Probes</>
              )}
            </button>
            {!isAsymmetric(alg) && verifyPublicKey.trim() === "" && (
              <span className="text-[10px] text-muted-custom font-mono-custom">
                Confusion probe needs a public key pasted in Verify — for this {alg} token it does not apply
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {probe.status === "idle" && (
              <Row tone="info" icon="›" label="No probes run yet">
                Two forgeries will be attempted against the live API.
              </Row>
            )}
            {probe.results.map(finding => (
              <Row
                key={finding.id}
                tone={finding.passed ? "pass" : "critical"}
                icon={finding.passed ? "✓" : "✗"}
                label={`${finding.name} — ${finding.passed ? "PASS" : "FAIL"}`}
              >
                {finding.detail}
              </Row>
            ))}
          </div>
        </div>
      </div>

      {/* ── Claim coverage ──────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden glass-panel glow-card animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 panel-header gap-3">
          <div className="flex items-center gap-3">
            <span className="cyber-badge text-primary-color">Claims</span>
            <span className="font-semibold text-main text-sm tracking-wide">Registered Claim Coverage</span>
          </div>
          <span className="text-[10px] font-mono-custom text-muted-custom">
            {claimFindings.filter(c => c.present).length}/{claimFindings.length} present
          </span>
        </div>

        <div className="p-6 bg-secondary-custom/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {claimFindings.map(finding => (
              <div
                key={finding.claim}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl text-xs ${severityBadge(finding.present ? "pass" : finding.guidance.severity)}`}
              >
                <span className="font-bold mt-0.5 font-mono-custom">{finding.claim}</span>
                <div className="min-w-0">
                  <span className="font-bold block font-mono-custom">
                    {finding.present ? "present" : `missing · ${finding.guidance.severity}`}
                  </span>
                  <span className="text-xs opacity-80 mt-0.5 block leading-relaxed">
                    {finding.present
                      ? payload[finding.claim] === true || typeof payload[finding.claim] === "number"
                        ? `= ${payload[finding.claim]}`
                        : "set"
                      : finding.guidance.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}