import { useState } from "react";
import ScrollReveal from "../ScrollReveal";

export default function AlgorithmMatrixSection() {
  const [selectedFamily, setSelectedFamily] = useState("all");

  const algorithms = [
    {
      alg: "HS256",
      family: "HMAC",
      type: "Symmetric",
      keyLength: "256 bits (min)",
      speed: "Fastest (~0.05ms)",
      security: "High (with strong secret)",
      useCase: "Monolithic apps, internal services, shared backend secret",
      popular: true,
    },
    {
      alg: "HS384",
      family: "HMAC",
      type: "Symmetric",
      keyLength: "384 bits (min)",
      speed: "Fast (~0.08ms)",
      security: "Very High",
      useCase: "High-security internal APIs requiring SHA-384 hashing",
      popular: false,
    },
    {
      alg: "HS512",
      family: "HMAC",
      type: "Symmetric",
      keyLength: "512 bits (min)",
      speed: "Fast (~0.1ms)",
      security: "Maximum Symmetric",
      useCase: "Defense, finance, and enterprise internal microservices",
      popular: false,
    },
    {
      alg: "RS256",
      family: "RSA",
      type: "Asymmetric",
      keyLength: "2048 / 4096 bits",
      speed: "Moderate (~1.2ms)",
      security: "Industry Standard",
      useCase: "Auth0, Okta, Firebase, AWS Cognito, distributed microservices",
      popular: true,
    },
    {
      alg: "RS384",
      family: "RSA",
      type: "Asymmetric",
      keyLength: "3072 / 4096 bits",
      speed: "Moderate (~1.5ms)",
      security: "Very High",
      useCase: "Banking, healthcare, zero-trust enterprise infrastructure",
      popular: false,
    },
    {
      alg: "RS512",
      family: "RSA",
      type: "Asymmetric",
      keyLength: "4096 bits",
      speed: "Moderate (~1.9ms)",
      security: "Maximum RSA",
      useCase: "Long-lived public certificates and high-assurance tokens",
      popular: false,
    },
    {
      alg: "ES256",
      family: "ECDSA",
      type: "Elliptic Curve",
      keyLength: "P-256 curve (256 bits)",
      speed: "Very Fast (~0.3ms)",
      security: "Next-Gen Cryptography",
      useCase: "Apple Sign-in, modern mobile apps, IoT, WebAuthn",
      popular: true,
    },
    {
      alg: "ES384",
      family: "ECDSA",
      type: "Elliptic Curve",
      keyLength: "P-384 curve (384 bits)",
      speed: "Fast (~0.5ms)",
      security: "NSA Suite B Standard",
      useCase: "Government, defense, and high-performance asymmetric auth",
      popular: false,
    },
    {
      alg: "ES512",
      family: "ECDSA",
      type: "Elliptic Curve",
      keyLength: "P-521 curve (521 bits)",
      speed: "Fast (~0.8ms)",
      security: "Extreme Quantum-Resistant Margin",
      useCase: "Critical cryptographic infrastructure and quantum security",
      popular: false,
    },
  ];

  const filtered =
    selectedFamily === "all"
      ? algorithms
      : algorithms.filter((a) => a.family.toLowerCase() === selectedFamily.toLowerCase());

  return (
    <ScrollReveal distance={36} duration={650} as="section" className="space-y-6 max-w-5xl mx-auto relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-main pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-indigo-outline text-[10px] font-bold uppercase tracking-widest font-mono-custom mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full dot-indigo" />
            Cryptographic Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-main font-display-custom tracking-tight">
            Supported Signature Algorithms
          </h2>
          <p className="text-xs text-muted-custom mt-1">
            Compare symmetric HMAC vs asymmetric RSA & ECDSA standards with constant-time verification
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-secondary-custom/80 border border-main p-1 rounded-xl gap-1 self-start sm:self-auto shadow-xs">
          {["all", "hmac", "rsa", "ecdsa"].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFamily(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedFamily === f
                  ? "badge-indigo-outline shadow-xs text-primary-color font-semibold"
                  : "text-muted-custom hover:text-main hover:bg-white/60"
              }`}
            >
              {f === "all" ? "All (9)" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.alg}
            className="glass-panel p-5 rounded-2xl border border-main card-hover-lift space-y-3.5 relative overflow-hidden bg-white/80 backdrop-blur-md"
          >
            {item.popular && (
              <span className="absolute top-3 right-3 text-[9px] font-bold font-mono-custom uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-primary-color border border-indigo-200">
                Popular
              </span>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl badge-indigo-outline flex items-center justify-center font-mono-custom font-extrabold text-sm text-primary-color shadow-inner">
                {item.alg.slice(0, 2)}
              </div>
              <div>
                <h3 className="font-mono-custom font-bold text-sm text-main">{item.alg}</h3>
                <span className="text-[10px] text-muted-custom font-medium uppercase tracking-wider">
                  {item.family} · {item.type}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono-custom pt-1 border-t border-slate-100">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-custom">Key Spec:</span>
                <span className="text-main font-semibold">{item.keyLength}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-custom">Verify Speed:</span>
                <span className="text-emerald-600 font-semibold">{item.speed}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-custom">Security Level:</span>
                <span className="text-indigo-600 font-semibold">{item.security}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-custom leading-relaxed pt-1 border-t border-slate-100">
              {item.useCase}
            </p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
