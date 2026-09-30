import { getAlgorithm } from "../constants/algorithms";

export default function SecurityScanner({ header, payload, verifyResult, verifySecret }) {
  const issues = [];
  const passes = [];

  // Algorithm checks
  const alg = header?.alg || "";
  const symmetric = getAlgorithm(alg)?.family === "HMAC";
  if (alg === "none") {
    issues.push({ label: "alg: none", detail: "Token uses no signing algorithm — any payload can be crafted.", severity: "critical" });
  } else if (getAlgorithm(alg)) {
    if (symmetric) {
      passes.push({ label: `${alg} Algorithm`, detail: "HMAC symmetric signature — every verifier needs the shared secret." });
    } else {
      passes.push({ label: `${alg} Algorithm`, detail: "Asymmetric signature — verify with the issuer's public key, no shared secret required." });
    }
  } else {
    issues.push({ label: `Unsupported Algorithm (${alg || "missing"})`, detail: "This console cannot verify this algorithm. Treat the token as untrusted until checked against its issuer.", severity: "critical" });
  }

  // Remote key reference
  if (header?.jku) {
    issues.push({ label: "Remote jku Header", detail: `Token points at ${header.jku} for its key — fetching it lets the issuer choose the verification key.`, severity: "warning" });
  }
  if (header?.x5u) {
    issues.push({ label: "Remote x5u Header", detail: "Token references a remote certificate chain — verify the chain pins a trusted issuer.", severity: "warning" });
  }

  // Expiry
  const exp = payload?.exp;
  const now = Math.floor(Date.now() / 1000);
  if (!exp) {
    issues.push({ label: "No Expiry (exp)", detail: "Token has no expiration claim — it is valid indefinitely.", severity: "warning" });
  } else if (exp < now) {
    issues.push({ label: "Token Expired", detail: `Expired at ${new Date(exp * 1000).toLocaleString()}.`, severity: "critical" });
  } else {
    const remaining = exp - now;
    const days = Math.floor(remaining / 86400);
    passes.push({ label: "Token Active", detail: `Expires in ${days > 0 ? days + " day(s)" : "< 24h"} · ${new Date(exp * 1000).toLocaleString()}.` });
  }

  // Issuer
  if (!payload?.iss) {
    issues.push({ label: "No Issuer (iss)", detail: "Missing issuer claim makes it hard to validate token origin.", severity: "warning" });
  } else {
    passes.push({ label: "Issuer Present", detail: `iss = "${payload.iss}"` });
  }

  // Subject
  if (!payload?.sub) {
    issues.push({ label: "No Subject (sub)", detail: "Missing subject claim — token identity is unverifiable.", severity: "warning" });
  } else {
    passes.push({ label: "Subject Present", detail: `sub = "${payload.sub}"` });
  }

  // Weak secret hint — only meaningful for symmetric tokens
  const weak = ["secret", "password", "1234", "jwt", "test", "key", "123456"];
  if (symmetric && verifySecret && weak.some(w => verifySecret.toLowerCase().includes(w))) {
    issues.push({ label: "Weak Secret Key", detail: "Secret key appears to be weak or predictable. Use a strong random secret.", severity: "warning" });
  } else if (symmetric && verifySecret && verifySecret.length >= 32) {
    passes.push({ label: "Strong Secret Key", detail: `Secret is ${verifySecret.length} characters — sufficient entropy.` });
  }

  // Signature verification result
  if (verifyResult) {
    if (verifyResult.overall_valid) {
      passes.push({ label: "Signature Valid", detail: `Verified with the ${symmetric ? "shared secret" : "public key"} for ${alg}.` });
    } else if (!verifyResult.signature_valid) {
      issues.push({ label: "Invalid Signature", detail: "Signature mismatch — token may have been tampered with.", severity: "critical" });
    } else if (!verifyResult.claims_valid) {
      issues.push({ label: "Claims Rejected", detail: verifyResult.error || "A registered claim failed validation.", severity: "warning" });
    }
  }

  const criticalCount = issues.filter(i => i.severity === "critical").length;
  const warningCount = issues.filter(i => i.severity === "warning").length;

  const overallStatus = criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "safe";
  const statusConfig = {
    safe: { label: "All Checks Passed", dot: "dot-emerald", badge: "badge-emerald-outline" },
    warning: { label: `${warningCount} Warning${warningCount > 1 ? "s" : ""}`, dot: "dot-amber", badge: "badge-amber-outline" },
    critical: { label: `${criticalCount} Critical Issue${criticalCount > 1 ? "s" : ""}`, dot: "dot-rose", badge: "badge-rose-outline" },
  }[overallStatus];

  return (
    <div className="rounded-2xl overflow-hidden glass-panel glow-card animate-fade-up">
      <div className="flex items-center justify-between px-5 py-3.5 panel-header">
        <div className="flex items-center gap-3">
          <span className="cyber-badge text-primary-color">Scanner</span>
          <span className="text-main text-xs font-bold">Security Analysis</span>
        </div>
        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${statusConfig.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
          {statusConfig.label}
        </div>
      </div>

      <div className="p-5 space-y-2.5 bg-secondary-custom/50">
        {issues.map((issue, i) => (
          <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl text-xs ${issue.severity === "critical"
              ? "badge-rose-outline"
              : "badge-amber-outline"
            }`}>
            <span className="font-bold mt-0.5">{issue.severity === "critical" ? "✗" : "⚠"}</span>
            <div>
              <span className="font-bold block font-mono-custom">{issue.label}</span>
              <span className="text-xs opacity-75 mt-0.5 block">{issue.detail}</span>
            </div>
          </div>
        ))}
        {passes.map((pass, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl badge-emerald-outline text-xs">
            <span className="font-bold mt-0.5">✓</span>
            <div>
              <span className="font-bold block font-mono-custom">{pass.label}</span>
              <span className="text-xs opacity-75 mt-0.5 block">{pass.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
