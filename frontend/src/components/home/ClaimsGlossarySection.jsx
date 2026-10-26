import { useState } from "react";
import ScrollReveal from "../ScrollReveal";

export default function ClaimsGlossarySection() {
  const [selectedClaim, setSelectedClaim] = useState("sub");

  const registeredClaims = [
    {
      claim: "sub",
      name: "Subject",
      type: "StringOrURI",
      rfc: "RFC 7519 §4.1.2",
      description: "Identifies the principal that is the subject of the JWT. The claims in a JWT are normally statements about the subject.",
      example: '"sub": "usr_92837264"',
      recommended: "User ID, machine identifier, or unique client GUID",
    },
    {
      claim: "iss",
      name: "Issuer",
      type: "StringOrURI",
      rfc: "RFC 7519 §4.1.1",
      description: "Identifies the principal that issued the JWT. Its syntax is generally a case-sensitive string containing a StringOrURI value.",
      example: '"iss": "https://auth.codesmiths.io/"',
      recommended: "Matches your identity provider or OAuth authority",
    },
    {
      claim: "aud",
      name: "Audience",
      type: "StringOrURI / Array",
      rfc: "RFC 7519 §4.1.3",
      description: "Identifies the recipients that the JWT is intended for. Each principal intended to process the JWT MUST identify itself with a value in the aud claim.",
      example: '"aud": ["https://api.codesmiths.io", "v2-gateway"]',
      recommended: "API audience or resource server identifier",
    },
    {
      claim: "exp",
      name: "Expiration Time",
      type: "NumericDate (UNIX seconds)",
      rfc: "RFC 7519 §4.1.4",
      description: "Identifies the expiration time on or after which the JWT MUST NOT be accepted for processing. Token is invalid once current time >= exp.",
      example: '"exp": 1748281600',
      recommended: "Short TTL for access tokens (15m to 1 hour)",
    },
    {
      claim: "nbf",
      name: "Not Before",
      type: "NumericDate (UNIX seconds)",
      rfc: "RFC 7519 §4.1.5",
      description: "Identifies the time before which the JWT MUST NOT be accepted for processing. Used for scheduled activation of credentials.",
      example: '"nbf": 1716473600',
      recommended: "Activation time for time-delayed invitations or passes",
    },
    {
      claim: "iat",
      name: "Issued At",
      type: "NumericDate (UNIX seconds)",
      rfc: "RFC 7519 §4.1.6",
      description: "Identifies the time at which the JWT was issued. Can be used to determine the age of the JWT.",
      example: '"iat": 1716473600',
      recommended: "Current epoch timestamp at the time of token minting",
    },
    {
      claim: "jti",
      name: "JWT ID",
      type: "String",
      rfc: "RFC 7519 §4.1.7",
      description: "Provides a unique identifier for the JWT. Can be used to prevent the JWT from being replayed (replay cache).",
      example: '"jti": "8f90c4c1-58e1-4c63-95ad-29fa3a9df8e3"',
      recommended: "UUID v4 or cryptographic nonce for revocation checking",
    },
  ];

  const active = registeredClaims.find((c) => c.claim === selectedClaim) || registeredClaims[0];

  return (
    <ScrollReveal distance={36} duration={650} as="section" className="space-y-6 max-w-5xl mx-auto relative z-10">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-indigo-outline text-[10px] font-bold uppercase tracking-widest font-mono-custom mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full dot-indigo" />
          RFC 7519 Specification
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-main font-display-custom tracking-tight">
          Standard Registered Claims Dictionary
        </h2>
        <p className="text-xs text-muted-custom max-w-lg mx-auto">
          Interactive reference of standardized claim names reserved by the IETF for JWT interoperability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Claim Badges Selector */}
        <div className="lg:col-span-5 glass-panel p-4 rounded-2xl border border-main bg-white/80 backdrop-blur-md space-y-2">
          <div className="text-[10px] font-bold text-muted-custom uppercase tracking-wider font-mono-custom px-2 py-1">
            Registered Claims (Click to inspect)
          </div>
          <div className="space-y-1">
            {registeredClaims.map((item) => (
              <button
                key={item.claim}
                onClick={() => setSelectedClaim(item.claim)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono-custom transition-all cursor-pointer ${
                  selectedClaim === item.claim
                    ? "bg-indigo-50 border border-indigo-200 text-primary-color font-bold shadow-xs"
                    : "text-muted-custom hover:text-main hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-primary-color">"{item.claim}"</span>
                  <span className="text-[11px] text-slate-500 font-sans">{item.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">{item.type.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detailed Specification Viewer */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-2xl border border-main bg-white/90 backdrop-blur-md space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-main pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary-color font-mono-custom">"{active.claim}"</span>
                <span className="text-sm font-semibold text-main">({active.name})</span>
              </div>
              <span className="text-[10px] text-muted-custom font-mono-custom">{active.rfc}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-main font-mono-custom">
              {active.type}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-muted-custom uppercase tracking-wider font-mono-custom">
              Description & Purpose
            </h4>
            <p className="text-xs text-main leading-relaxed">
              {active.description}
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <h4 className="text-[11px] font-bold text-muted-custom uppercase tracking-wider font-mono-custom">
              JSON Example
            </h4>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono-custom text-xs border border-slate-800">
              {active.example}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-main text-xs space-y-1">
            <span className="font-bold text-main block text-[11px] font-mono-custom uppercase tracking-wide">
              Engineering Best Practice
            </span>
            <p className="text-muted-custom text-[11px] leading-relaxed">
              {active.recommended}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
