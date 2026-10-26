import { useNavigate } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";

export default function About() {
  const navigate = useNavigate();

  const standards = [
    {
      code: "RFC 7519",
      name: "JSON Web Token (JWT)",
      scope: "Compact URL-safe means of representing claims to be transferred between two parties.",
      status: "Fully Compliant",
    },
    {
      code: "RFC 7515",
      name: "JSON Web Signature (JWS)",
      scope: "Digital signatures and MACs over arbitrary octets using Base64url encoding.",
      status: "Fully Compliant",
    },
    {
      code: "RFC 7517",
      name: "JSON Web Key (JWK)",
      scope: "JSON data structure that represents cryptographic keys for asymmetric verification.",
      status: "RSA & ECDSA Supported",
    },
    {
      code: "RFC 7518",
      name: "JSON Web Algorithms (JWA)",
      scope: "Cryptographic algorithms and identifiers for signing and signature validation.",
      status: "9 Algorithms Implemented",
    },
  ];

  const securityPillars = [
    {
      icon: "🔒",
      title: "Local-First Sandbox",
      subtitle: "Zero Server Persistence",
      desc: "Token Header and Payload decoding happens client-side in your browser via Web APIs. Your tokens and sensitive claims are never recorded into databases or analytics.",
    },
    {
      icon: "🛡️",
      title: "SSRF Key Shielding",
      subtitle: "Local Subnet Filter",
      desc: "Remote JWKS discovery filters against loopback (127.0.0.1) and internal RFC 1918 subnets, protecting internal microservices from server-side request forgery.",
    },
    {
      icon: "⏱️",
      title: "Constant-Time Verification",
      subtitle: "Anti-Timing Leakage",
      desc: "HMAC signatures are cross-checked with timing-safe comparison algorithms to prevent side-channel byte-by-byte timing attacks over network requests.",
    },
    {
      icon: "⚡",
      title: "Strict Algorithm Pinning",
      subtitle: "Strict Asymmetric/Symmetric Pinning",
      desc: "Rejects malicious tokens where an asymmetric public key is supplied to verify an HMAC signature, shutting down the classic algorithm confusion attack vector.",
    },
  ];

  return (
    <div className="space-y-14 animate-fade-up max-w-5xl mx-auto py-2">
      {/* ─── Hero Section ─── */}
      <ScrollReveal distance={25} duration={550} as="section" className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase badge-indigo-outline rounded-full px-4 py-1.5 glow-indigo-pulse">
          <span className="w-1.5 h-1.5 rounded-full dot-indigo animate-pulse" />
          Platform Architecture & Standards
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-main font-display-custom tracking-tight">
          Engineered for Cryptographic Certainty & Privacy
        </h1>

        <p className="text-muted-custom text-sm leading-relaxed">
          JWT Console was built to eliminate the security vulnerabilities of public online decoders.
          Designed by developers, for developers who need robust verification without compromising tokens or private key material.
        </p>
      </ScrollReveal>

      {/* ─── Mission & Origin Story ─── */}
      <ScrollReveal distance={36} duration={650} as="section" className="glass-panel p-6 sm:p-8 rounded-2xl border border-main space-y-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3 border-b border-main pb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-primary-color font-bold">
            💡
          </div>
          <div>
            <h2 className="text-base font-bold text-main font-display-custom">The Problem With Public Web Decoders</h2>
            <p className="text-xs text-muted-custom">Why copying production tokens into random sites is dangerous</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-custom leading-relaxed">
          <p>
            Every day, developers paste real authentication tokens into public websites to quickly read claims or troubleshoot expired sessions.
            Unfortunately, many online decoders transmit payloads to external telemetry servers, log tokens into server access logs, or fail to reject insecure algorithm switches.
          </p>
          <p>
            <strong className="text-main font-semibold">JWT Console solves this fundamentally:</strong> by decoupling client-side parsing from hardened local backend verification, you get instant visibility into your claims while ensuring secrets and keys never leave your controlled environment.
          </p>
        </div>
      </ScrollReveal>

      {/* ─── Four Security Pillars ─── */}
      <ScrollReveal distance={36} duration={650} as="section" className="space-y-5">
        <div className="text-center space-y-1">
          <div className="text-[11px] font-bold text-primary-color uppercase tracking-widest font-mono-custom">Core Architecture</div>
          <h2 className="text-2xl font-bold text-main font-display-custom">Four Architectural Security Guarantees</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {securityPillars.map((pillar, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-main space-y-3 card-hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-2xl p-2 rounded-xl bg-slate-100 border border-main">{pillar.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full badge-indigo-outline font-mono-custom">
                  {pillar.subtitle}
                </span>
              </div>
              <h3 className="text-main font-bold text-sm font-display-custom">{pillar.title}</h3>
              <p className="text-muted-custom text-xs leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ─── RFC Standards Compliance ─── */}
      <ScrollReveal distance={36} duration={650} as="section" className="glass-panel rounded-2xl p-6 sm:p-8 border border-main space-y-5 shadow-xs">
        <div className="border-b border-main pb-4">
          <h2 className="text-lg font-bold text-main font-display-custom">IETF RFC Cryptographic Standards Compliance</h2>
          <p className="text-xs text-muted-custom">Strict adherence to modern Internet Engineering Task Force specifications</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {standards.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-card-custom border border-main space-y-2 card-hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-color font-mono-custom">{s.code}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {s.status}
                </span>
              </div>
              <h4 className="text-main font-semibold text-xs">{s.name}</h4>
              <p className="text-[11px] text-muted-custom leading-normal">{s.scope}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ─── Developer & Engineering Profile ─── */}
      <ScrollReveal distance={36} duration={650} as="section" className="glass-panel rounded-2xl p-6 sm:p-8 border border-main flex flex-col md:flex-row items-center gap-6 shadow-xs">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-1 flex-shrink-0 shadow-md">
          <div className="w-full h-full bg-white rounded-xl flex items-center justify-center font-bold text-2xl text-primary-color font-display-custom">
            K
          </div>
        </div>

        <div className="space-y-2 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h3 className="text-base font-bold text-main font-display-custom">Krina</h3>
            <span className="cyber-badge text-primary-color">Lead Architect</span>
          </div>
          <p className="text-xs text-muted-custom leading-relaxed">
            Systems & Full-Stack Software Engineer specializing in modern web applications, distributed identity standards (OAuth 2.0 / OIDC), and applied cryptography.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 font-mono-custom text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-main text-slate-700">FastAPI</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-main text-slate-700">React 19</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-main text-slate-700">ReportLab</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-main text-slate-700">python-jose</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/decode")}
          className="px-5 py-2.5 rounded-xl btn-primary-custom text-xs font-bold uppercase tracking-widest cursor-pointer whitespace-nowrap hover:scale-105 transition-all shadow-sm"
        >
          Try Decoder →
        </button>
      </ScrollReveal>
    </div>
  );
}