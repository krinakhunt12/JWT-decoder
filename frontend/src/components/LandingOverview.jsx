export default function LandingOverview({ loadSample }) {
  return (
    <div className="space-y-5 animate-fade-up w-full">
      {/* JWT Structure breakdown */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden glow-card">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-main text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 glow-pulse" />
          What is a JSON Web Token?
        </h3>
        <p className="text-muted-custom text-xs leading-relaxed max-w-lg mb-5">
          JWT (RFC 7519) is a compact, URL-safe token format for securely transmitting claims as a JSON object. Each token consists of three Base64url-encoded segments, separated by dots.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Part 1 · Header", color: "#e11d48", desc: "Declares the signing algorithm (e.g. HS256) and token type (JWT)." },
            { label: "Part 2 · Payload", color: "#7c3aed", desc: "Contains the claims — subject, issuer, scopes, expiry, custom data." },
            { label: "Part 3 · Signature", color: "#0d9488", desc: "HMAC or digital signature. Proves data authenticity & integrity." },
          ].map((p, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border text-left card-hover-lift transition-all"
              style={{ background: `${p.color}08`, borderColor: `${p.color}25` }}
            >
              <span
                className="text-[10px] font-bold tracking-widest uppercase block mb-1 font-mono-custom"
                style={{ color: p.color }}
              >
                {p.label}
              </span>
              <p className="text-xs text-muted-custom leading-normal">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: "⚡", title: "Timing-Safe Verification", desc: "Signatures validated with HMAC, RSA, and ECDSA families using constant-time comparison and explicit algorithm pinning." },
          { icon: "🕐", title: "Timezone-Aware Claims", desc: "Converts UNIX timestamps (exp, iat, nbf) to your system timezone and UTC simultaneously." },
          { icon: "✍︎", title: "Live Token Generator", desc: "Compose custom payloads, choose algorithm, set TTL — get a signed JWT in real time." },
          { icon: "📄", title: "PDF Security Reports", desc: "Export high-fidelity A4 PDF reports via ReportLab with full token cryptographic breakdown." },
        ].map((f, i) => (
          <div key={i} className="glass-panel rounded-2xl p-5 hover:bg-slate-50 transition-all card-hover-lift">
            <div className="text-lg mb-2">{f.icon}</div>
            <h4 className="text-main text-xs font-bold mb-1.5">{f.title}</h4>
            <p className="text-muted-custom text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 glow-card">
        <div>
          <span className="text-main text-xs font-bold block">Try a sample token →</span>
          <span className="text-muted-custom text-xs mt-0.5 block">Load a realistic developer JWT to explore all security features.</span>
        </div>
        <button
          onClick={loadSample}
          className="px-5 py-2.5 rounded-xl btn-primary-custom text-xs font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap shadow-sm hover:scale-[1.02]"
        >
          Load Sample
        </button>
      </div>
    </div>
  );
}
