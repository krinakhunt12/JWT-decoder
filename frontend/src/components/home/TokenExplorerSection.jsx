import { useState } from "react";
import ScrollReveal from "../ScrollReveal";

export default function TokenExplorerSection() {
  const [activeSegment, setActiveSegment] = useState("payload");

  const sampleTokenData = {
    header: { alg: "HS256", typ: "JWT" },
    payload: {
      sub: "usr_92837",
      name: "Krina",
      role: "senior_developer",
      tenant: "codesmiths",
      scopes: ["profile:read", "code:write", "apis:manage"],
      iat: 1716473600,
      exp: 2047412800,
    },
    signature:
      'HMACSHA256(\n  base64UrlEncode(header)\n  + "."\n  + base64UrlEncode(payload),\n  secret-key\n) ──► Cryptographically Verified ✓',
  };

  const segments = [
    { key: "header", label: "Part 1 · Header", color: "#e11d48", sub: "Algorithm & Type" },
    { key: "payload", label: "Part 2 · Payload", color: "#7c3aed", sub: "Claims & Identity" },
    { key: "signature", label: "Part 3 · Signature", color: "#0d9488", sub: "Cryptographic Proof" },
  ];

  return (
    <ScrollReveal distance={40} duration={650} as="section" className="space-y-4 max-w-5xl mx-auto relative z-10">
      <div className="text-center space-y-1">
        <div className="text-[11px] font-bold text-primary-color uppercase tracking-widest font-mono-custom">
          Interactive Token Architecture
        </div>
        <h2 className="text-2xl font-bold text-main tracking-tight font-display-custom">
          Inspect the Anatomy of a JWT
        </h2>
        <p className="text-xs text-muted-custom">
          Click any of the three Base64url encoded parts below to inspect its decrypted structure
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-main glow-card bg-white/80 backdrop-blur-md">
        {/* Raw encoded token preview */}
        <div className="p-5 panel-header font-mono-custom text-xs sm:text-sm leading-relaxed break-all text-left select-none bg-slate-50/70 border-b border-main">
          {[
            { key: "header", text: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" },
            { key: "payload", text: "eyJzdWIiOiJ1c3JfOTI4MzciLCJuYW1lIjoiS3JpbmEiLCJyb2xlIjoic2VuaW9yX2RldmVsb3BlciJ9" },
            { key: "signature", text: "P_aH_P7Uv9a2jXQnUq9f4Y5X_7N4v5Z6u7t8e9r0A1B" },
          ].map((seg, i) => (
            <span key={seg.key}>
              {i > 0 && <span className="text-slate-400 font-bold mx-0.5">.</span>}
              <span
                onClick={() => setActiveSegment(seg.key)}
                className={`cursor-pointer transition-all px-1.5 py-0.5 rounded font-semibold ${
                  seg.key === "header" ? "token-part-header hover:bg-rose-100" : ""
                } ${seg.key === "payload" ? "token-part-payload hover:bg-violet-100" : ""} ${
                  seg.key === "signature" ? "token-part-signature hover:bg-emerald-100" : ""
                } ${activeSegment === seg.key ? "bg-white ring-2 ring-primary-color shadow-xs" : "opacity-85"}`}
              >
                {seg.text}
              </span>
            </span>
          ))}
        </div>

        {/* Segment Details & Decoded JSON Viewer */}
        <div className="p-6 bg-white/50 flex flex-col md:flex-row gap-6">
          {/* Segment Selector Tabs */}
          <div className="flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-main pb-4 md:pb-0 md:pr-6 min-w-[170px]">
            {segments.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSegment(s.key)}
                className={`text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeSegment === s.key ? "bg-white shadow-xs border border-main" : "hover:bg-slate-50 text-muted-custom"
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: s.color }}>
                  {s.label}
                </div>
                <div className="text-[10px] text-muted-custom mt-0.5">{s.sub}</div>
              </button>
            ))}
          </div>

          {/* Decoded content panel */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-custom tracking-wider uppercase font-mono-custom">
              <span>Decoded Output</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-main">JSON · RFC 7519</span>
            </div>
            <pre
              className="font-mono-custom text-xs leading-relaxed bg-white/90 p-4 rounded-xl border border-main whitespace-pre-wrap overflow-auto max-h-56 shadow-inner"
              style={{
                color: activeSegment === "header" ? "#e11d48" : activeSegment === "payload" ? "#7c3aed" : "#0d9488",
              }}
            >
              {activeSegment === "signature"
                ? sampleTokenData.signature
                : JSON.stringify(sampleTokenData[activeSegment], null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
