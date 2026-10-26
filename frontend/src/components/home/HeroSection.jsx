import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

export default function HeroSection({ loadSampleAndNavigate }) {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");

  const headline = "Decode. Verify. Audit. Sign.";
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyped(headline.slice(0, i + 1));
      i++;
      if (i >= headline.length) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, []);

  const metrics = [
    { val: "9 Algorithms", label: "HS · RS · ES Suites" },
    { val: "100% Sandboxed", label: "Zero Server Persistence" },
    { val: "SSRF Hardened", label: "Remote JWKS Fetching" },
    { val: "ReportLab A4", label: "Executive PDF Reports" },
  ];

  return (
    <ScrollReveal distance={25} duration={550} as="section" className="text-center max-w-4xl mx-auto space-y-7 pt-4 relative z-10">
      {/* Animated Cyber Badge */}
      <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase badge-indigo-outline rounded-full px-4 py-1.5 glow-indigo-pulse backdrop-blur-md bg-white/70">
        <span className="w-2 h-2 rounded-full dot-indigo animate-pulse" />
        Enterprise Cryptographic Token Suite
      </div>

      {/* Dynamic Typed Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-main tracking-tight leading-none font-display-custom drop-shadow-xs">
        <span>{typed}</span>
        <span className="cursor-blink text-primary-color ml-1">_</span>
      </h1>

      <p className="text-muted-custom text-sm sm:text-base leading-relaxed max-w-2xl mx-auto backdrop-blur-xs">
        The ultimate developer workspace for inspecting, verifying, auditing, and generating JSON Web Tokens.
        Built with timing-safe cryptography, SSRF protection, and zero key logging.
      </p>

      {/* Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
        {metrics.map((stat, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white/75 backdrop-blur-md border border-main text-center shadow-xs card-hover-lift"
          >
            <span className="text-primary-color font-bold text-sm sm:text-base font-mono-custom block">
              {stat.val}
            </span>
            <span className="text-muted-custom text-[10px] uppercase tracking-wider font-bold block mt-0.5">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Hero CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
        <button
          onClick={() => navigate("/decode")}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase btn-primary-custom shadow-md hover:scale-[1.02] cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <span>Open Decoder Console</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <button
          onClick={() => {
            if (loadSampleAndNavigate) {
              loadSampleAndNavigate();
            } else {
              navigate("/decode");
            }
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase btn-secondary-custom cursor-pointer hover:border-indigo-300 hover:scale-[1.02] transition-all shadow-xs flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md"
        >
          <span>Load Quick Demo Token</span>
          <span className="text-primary-color font-mono-custom text-[10px]">✨</span>
        </button>
      </div>

      {/* Trust & Compliance Signals */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-[11px] font-mono-custom text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          100% Client-Side Parsing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.6-2A10 10 0 112 12a10 10 0 0117.6-6z" />
          </svg>
          Strict Algorithm Pinning
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          SSRF Loopback Guard
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Forensic PDF Reports
        </span>
      </div>
    </ScrollReveal>
  );
}
