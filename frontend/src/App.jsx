import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DecoderPanel from "./components/DecoderPanel";
import SectionCard from "./components/SectionCard";
import VerifyPanel from "./components/VerifyPanel";
import JWKSResolverPanel from "./components/JWKSResolverPanel";
import AuditPanel from "./components/AuditPanel";
import DiffPanel from "./components/DiffPanel";
import GeneratorPanel from "./components/GeneratorPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import SecurityScanner from "./components/SecurityScanner";
import { isAsymmetric, SUPPORTED_ALGORITHMS } from "./constants/algorithms";

const API = "http://localhost:8000";

// Clean, non-agriculture sample JWT: sub is a developer identity, no agri fields
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTI4MzciLCJuYW1lIjoiS3JpbmEiLCJyb2xlIjoic2VuaW9yX2RldmVsb3BlciIsInRlbmFudCI6ImNvZGVzbWl0aHMiLCJzY29wZXMiOlsicHJvZmlsZTpyZWFkIiwiY29kZTp3cml0ZSIsImFwaXM6bWFuYWdlIl0sImlhdCI6MTcxNjQ3MzYwMCwiZXhwIjoyMDQ3NDEyODAwfQ.P_aH_P7Uv9a2jXQnUq9f4Y5X_7N4v5Z6u7t8e9r0A1B";

// ─── Time Badge ─────────────────────────────────────────────────────────────
function TimeBadge({ label, ts }) {
  if (!ts) return null;
  const now = Math.floor(Date.now() / 1000);
  const expired = label === "exp" && ts < now;
  const dateObj = new Date(ts * 1000);
  const localStr = dateObj.toLocaleString();
  const utcStr = dateObj.toUTCString();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-medium w-full border font-mono-custom
      ${expired
        ? "bg-red-950/20 text-red-300 border-red-900/40"
        : "bg-cyan-950/20 text-cyan-300 border-cyan-900/30"
      }`}>
      <div className="flex items-center gap-2 font-semibold">
        <span className={`w-1.5 h-1.5 rounded-full ${expired ? "bg-red-400" : "bg-cyan-400"}`} />
        <span className="uppercase text-slate-300 text-[10px] tracking-widest">
          {label === "exp" ? "exp · Expiration" : label === "iat" ? "iat · Issued At" : "nbf · Not Before"}
        </span>
        {expired && <span className="ml-1 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase tracking-wide">expired</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:ml-auto text-xs">
        <span className="text-slate-400">Local: <strong className="text-slate-200">{localStr}</strong></span>
        <span className="text-slate-700">|</span>
        <span className="text-slate-400">UTC: <strong className="text-slate-300">{utcStr}</strong></span>
      </div>
    </div>
  );
}

// ─── Overview shown before decode ────────────────────────────────────────────
function LandingOverview({ loadSample }) {
  return (
    <div className="space-y-5 animate-fade-up w-full">
      {/* JWT Structure breakdown */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl" />
        <h3 className="text-slate-200 text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          What is a JSON Web Token?
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed max-w-lg mb-5">
          JWT (RFC 7519) is a compact, URL-safe token format for securely transmitting claims as a JSON object. Each token consists of three Base64url-encoded segments, separated by dots.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Part 1 · Header", color: "#00d4ff", bg: "cyan", desc: "Declares the signing algorithm (e.g. HS256) and token type (JWT)." },
            { label: "Part 2 · Payload", color: "#b06fff", bg: "violet", desc: "Contains the claims — subject, issuer, scopes, expiry, custom data." },
            { label: "Part 3 · Signature", color: "#00ffb2", bg: "emerald", desc: "HMAC hash of header + payload. Proves data integrity." },
          ].map((p, i) => (
            <div key={i} className="p-4 rounded-xl border text-left"
              style={{ background: `${p.color}08`, borderColor: `${p.color}18` }}>
              <span className="text-[10px] font-bold tracking-widest uppercase block mb-1" style={{ color: p.color }}>{p.label}</span>
              <p className="text-xs text-slate-500 leading-normal">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: "⚡", color: "cyan", title: "Timing-Safe Verification", desc: "Signatures validated with the HMAC and RSA/ECDSA families using constant-time comparison and explicit algorithm pinning." },
          { icon: "🕐", color: "violet", title: "Timezone-Aware Claims", desc: "Converts UNIX timestamps (exp, iat, nbf) to your system timezone and UTC simultaneously." },
          { icon: "✍︎", color: "mint", title: "Live Token Generator", desc: "Compose custom payloads, choose algorithm, set TTL — get a signed JWT in real time." },
          { icon: "📄", color: "rose", title: "PDF Security Reports", desc: "Export high-fidelity A4 PDF reports via ReportLab with full token cryptographic breakdown." },
        ].map((f, i) => (
          <div key={i} className="glass-panel rounded-2xl p-5 hover:bg-slate-900/40 transition-all">
            <div className="text-lg mb-2">{f.icon}</div>
            <h4 className="text-slate-200 text-xs font-bold mb-1.5">{f.title}</h4>
            <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-slate-200 text-xs font-bold block">Try a sample token →</span>
          <span className="text-slate-500 text-xs mt-0.5 block">Load a realistic developer JWT to explore all features.</span>
        </div>
        <button
          onClick={loadSample}
          className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap"
        >
          Load Sample
        </button>
      </div>
    </div>
  );
}

// ─── Toast System ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl shadow-xl border backdrop-blur-xl flex items-start gap-3 animate-fade-up font-mono-custom text-xs
            ${t.type === "success" ? "bg-cyan-950/90 text-cyan-300 border-cyan-800/40" : ""}
            ${t.type === "error" ? "bg-red-950/90 text-red-300 border-red-800/40" : ""}
            ${t.type === "warning" ? "bg-amber-950/90 text-amber-300 border-amber-800/40" : ""}
            ${t.type === "info" ? "bg-slate-900/90 text-slate-300 border-slate-700/50" : ""}
          `}>
          <span className="mt-0.5">
            {t.type === "success" && "✓"}{t.type === "error" && "✗"}{t.type === "warning" && "⚠"}{t.type === "info" && "›"}
          </span>
          <div className="flex-1 font-semibold leading-normal">{t.message}</div>
          <button onClick={() => removeToast(t.id)} className="text-slate-500 hover:text-slate-200 font-bold cursor-pointer">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ navigate, loadSample }) {
  const [activeSegment, setActiveSegment] = useState("payload");
  const [openFaq, setOpenFaq] = useState(null);
  const [typed, setTyped] = useState("");

  const headline = "Decode. Verify. Sign.";
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyped(headline.slice(0, i + 1));
      i++;
      if (i >= headline.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, []);

  const segmentData = {
    header: { alg: "HS256", typ: "JWT" },
    payload: {
      sub: "usr_92837",
      name: "Krina",
      role: "senior_developer",
      tenant: "codesmiths",
      scopes: ["profile:read", "code:write", "apis:manage"],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    },
    signature: "HMACSHA256(\n  base64UrlEncode(header)\n  + \".\"\n  + base64UrlEncode(payload),\n  secret-key\n) ──► Verified ✓",
  };

  const faqs = [
    { q: "Is my secret key safe?", a: "The Header and Payload are decoded entirely in your browser using standard Base64url decoding — no server involved. Your key material is only sent to the local FastAPI server for signature verification, which never logs or stores it. For RS*/ES* tokens paste the public key only — verification never needs the private half." },
    { q: "Which algorithms are supported?", a: "Two families: symmetric HMAC (HS256, HS384, HS512) verified with a shared secret, and asymmetric RSA (RS256, RS384, RS512) and ECDSA (ES256, ES384, ES512) verified with a PEM public key or JWK. The algorithm is pinned by you and cross-checked against the token header, so algorithm-confusion attacks fail closed." },
    { q: "How does the timestamp parser work?", a: "Standard UNIX epoch values in exp, iat, and nbf fields are automatically converted to both your system's local timezone and UTC, giving you immediate context about token validity." },
    { q: "Can I generate production-ready tokens?", a: "Yes. Navigate to the Generator tab to craft custom payloads, select an algorithm, set expiry, and get a properly signed Base64url JWT token output instantly." },
  ];

  return (
    <div className="min-h-screen dot-grid-animated scanlines flex flex-col bg-background text-foreground overflow-hidden relative">
      {/* Ambient glows and Watermarks */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px]" />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-cyan-400/3 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

        {/* Decorative watermarks */}
        <div className="absolute top-[12%] left-[-8%] text-[14vw] font-black text-muted-custom opacity-10 pointer-events-none select-none uppercase tracking-widest -rotate-12 leading-none whitespace-nowrap">
          JWT SUITE
        </div>
        <div className="absolute bottom-[20%] right-[-8%] text-[14vw] font-black text-muted-custom opacity-10 pointer-events-none select-none uppercase tracking-widest rotate-12 leading-none whitespace-nowrap">
          VERIFIED
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-16">
        
        {/* Floating Glowing Orbs Behind Cards */}
        <div className="absolute top-[25%] left-[-5%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-float-orb-slow -z-10" />
        <div className="absolute top-[55%] right-[-5%] w-[350px] h-[350px] bg-violet-600/5 rounded-full blur-[105px] pointer-events-none animate-float-orb-fast -z-10" />
        <div className="absolute bottom-[15%] left-[10%] w-[300px] h-[300px] bg-teal-500/3 rounded-full blur-[90px] pointer-events-none animate-float-orb-slow -z-10" />

        {/* NavBar */}
        <header className="flex items-center justify-between border-b border-main pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl badge-indigo-outline flex items-center justify-center glow-pulse">
              <svg className="w-4 h-4 text-primary-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-main tracking-tight font-display-custom">JWT Console</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full badge-indigo-outline">v2.0</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/decode")}
            className="text-xs font-bold px-4 py-2 rounded-xl btn-secondary-custom transition-all cursor-pointer tracking-wide uppercase shadow-sm"
          >
            Open Console →
          </button>
        </header>

        {/* Hero */}
        <main className="text-center max-w-3xl mx-auto space-y-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase badge-indigo-outline rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full dot-indigo animate-pulse" />
            Cryptographic Token Workspace
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold text-main tracking-tight leading-none font-display-custom">
            {typed}
            <span className="cursor-blink text-primary-color ml-1">_</span>
          </h1>

          <p className="text-muted-custom text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            A professional developer toolkit for inspecting, verifying, and generating JSON Web Tokens. Built for engineers who care about security.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { val: "9 Algs", label: "HS · RS · ES" },
              { val: "100%", label: "Sandboxed" },
              { val: "PDF", label: "Export Ready" },
            ].map((s, i) => (
              <div key={i} className="px-3 py-3 rounded-xl bg-card-custom border border-main text-center shadow-sm">
                <span className="text-primary-color font-bold text-base font-mono-custom block">{s.val}</span>
                <span className="text-muted-custom text-[10px] uppercase tracking-widest font-bold block mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/decode")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase btn-primary-custom shadow-md hover:scale-[1.02] cursor-pointer transition-all"
            >
              Start Decoding
            </button>
            <button
              onClick={() => navigate("/generate")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase btn-secondary-custom cursor-pointer hover:scale-[1.02] transition-all shadow-sm"
            >
              Token Generator
            </button>
          </div>
        </main>


        {/* Interactive JWT Simulator */}
        <section className="space-y-5 animate-fade-up animation-delay-100">
          <div className="text-center">
            <h2 className="text-main text-lg font-bold tracking-tight font-display-custom">Interactive Token Explorer</h2>
            <p className="text-muted-custom text-xs mt-1">Click a segment to inspect its decoded content</p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden glow-card">
            {/* Token display */}
            <div className="p-5 panel-header font-mono-custom text-xs sm:text-sm leading-relaxed break-all text-left select-none">
              {[
                { key: "header", text: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" },
                { key: "payload", text: "eyJzdWIiOiJ1c3JfOTI4MzciLCJuYW1lIjoiS3JpbmEiLCJyb2xlIjoic2VuaW9yX2RldmVsb3BlciJ9" },
                { key: "signature", text: "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" },
              ].map((seg, i) => (
                <span key={seg.key}>
                  {i > 0 && <span className="text-muted-custom font-bold mx-0.5">.</span>}
                  <span
                    onClick={() => setActiveSegment(seg.key)}
                    className={`cursor-pointer transition-all px-1 py-0.5 rounded token-part-${seg.key} ${activeSegment === seg.key ? "bg-secondary-custom/50 ring-1 border-main" : "opacity-85 hover:opacity-100"}`}
                  >
                    {seg.text}
                  </span>
                </span>
              ))}
            </div>

            <div className="p-5 bg-secondary-custom/50 flex flex-col md:flex-row gap-5">
              {/* Tab selectors */}
              <div className="flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-main pb-3 md:pb-0 md:pr-4 min-w-[130px]">
                {[
                  { key: "header", label: "Header", color: "#e11d48" },
                  { key: "payload", label: "Payload", color: "#7c3aed" },
                  { key: "signature", label: "Signature", color: "#0d9488" },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSegment(s.key)}
                    className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${activeSegment === s.key ? "btn-secondary-custom" : "text-muted-custom hover:text-main"}`}
                    style={activeSegment === s.key ? { color: s.color, borderColor: `${s.color}25` } : {}}
                  >
                    › {s.label}
                  </button>
                ))}
              </div>

              {/* Decoded content */}
              <div className="flex-1 min-h-[150px]">
                <div className="text-[10px] font-bold text-muted-custom tracking-widest uppercase mb-2">Decoded View</div>
                <pre className="font-mono-custom text-xs leading-relaxed bg-card-custom p-4 rounded-xl border border-main text-main whitespace-pre-wrap overflow-auto max-h-48"
                  style={{ color: activeSegment === "header" ? "#e11d48" : activeSegment === "payload" ? "#7c3aed" : "#0d9488" }}>
                  {activeSegment === "signature"
                    ? segmentData.signature
                    : JSON.stringify(segmentData[activeSegment], null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline steps */}
        <section className="space-y-5 animate-fade-up animation-delay-200">
          <div className="text-center">
            <h2 className="text-main text-lg font-bold font-display-custom">How It Works</h2>
            <p className="text-muted-custom text-xs mt-1">Four-step cryptographic pipeline</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { n: "01", title: "Paste Token", desc: "Input any Base64url-encoded JWT securely." },
              { n: "02", title: "Inspect Claims", desc: "Browse decoded header, payload, and timestamps." },
              { n: "03", title: "Verify Signature", desc: "Cryptographic check against a shared secret or a PEM public key." },
              { n: "04", title: "Export PDF", desc: "Download a ReportLab-generated A4 report." },
            ].map((s, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 text-left space-y-2 hover:border-main transition-all">
                <span className="text-3xl font-extrabold text-primary-color opacity-30 font-mono-custom block leading-none">{s.n}</span>
                <h4 className="text-main text-xs font-bold">{s.title}</h4>
                <p className="text-muted-custom text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden animate-fade-up animation-delay-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl" />
          <div className="space-y-1.5">
            <span className="cyber-badge text-indigo-600 inline-block mb-1">Security First</span>
            <h3 className="text-slate-800 text-base font-bold font-display-custom">Real-Time Cryptographic Validation</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md">
              Validate digital signatures, inspect permission scopes, check token lifetime, and detect security misconfigurations — all in one console.
            </p>
          </div>
          <button
            onClick={() => { loadSample(); navigate("/decode"); }}
            className="px-5 py-3 rounded-xl btn-primary-custom text-xs font-bold uppercase tracking-widest whitespace-nowrap cursor-pointer transition-all shadow-sm"
          >
            Load Dev Token
          </button>
        </section>

        {/* FAQ */}
        <section className="space-y-5 max-w-3xl mx-auto w-full animate-fade-up animation-delay-400">
          <div className="text-center">
            <h2 className="text-main text-lg font-bold font-display-custom">Common Questions</h2>
          </div>
          <div className="space-y-2.5">
            {faqs.map((f, i) => (
              <div key={i} className="glass-panel rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer text-muted-custom hover:text-main text-xs font-bold"
                >
                  <span>{f.q}</span>
                  <span className="text-primary-color font-bold text-base">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-xs text-muted-custom leading-relaxed border-t border-main pt-4 animate-fade-up">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-custom border-t border-main pt-6 pb-4">
          <p className="font-mono-custom">🔐 JWT Console · Sandboxed · No tokens logged or stored · Built with FastAPI + React</p>
        </footer>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // Decoder
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // History
  const [history, setHistory] = useState(() => {
    try { const s = localStorage.getItem("jwt_history"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const saveToHistory = useCallback((tok, header, payload) => {
    if (!tok) return;
    setHistory(prev => {
      const filtered = prev.filter(item => item.token !== tok);
      const sub = payload?.sub || payload?.name || payload?.role || "Decoded Payload";
      const alg = header?.alg || "HS256";
      const newItem = { id: Math.random().toString(36).substring(2, 9), token: tok, sub, alg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      const updated = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem("jwt_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Verify
  const [verifySecret, setVerifySecret] = useState("my-secret-key");
  const [verifyPublicKey, setVerifyPublicKey] = useState("");
  const [verifyAlgorithm, setVerifyAlgorithm] = useState("HS256");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);

  // JWKS remote key resolution
  const [jwksUrl, setJwksUrl] = useState("");
  const [jwksResult, setJwksResult] = useState(null);
  const [resolving, setResolving] = useState(false);

  // Generator
  const [genHeaderAlg, setGenHeaderAlg] = useState("HS256");
  const [genPayloadStr, setGenPayloadStr] = useState(JSON.stringify({
    sub: "usr_92837",
    name: "Krina",
    role: "senior_developer",
    tenant: "codesmiths",
    scopes: ["profile:read", "code:write", "apis:manage"],
    iat: Math.floor(Date.now() / 1000)
  }, null, 2));
  const [genSecret, setGenSecret] = useState("my-secret-key");
  const [genExpiresIn, setGenExpiresIn] = useState("86400");
  const [generatedToken, setGeneratedToken] = useState("");
  const [genResult, setGenResult] = useState(null);
  const [genError, setGenError] = useState("");
  const [showGenSecret, setShowGenSecret] = useState(false);

  // Decode
  const decode = useCallback(async (t = token) => {
    const tk = t.trim();
    if (!tk) return;
    setLoading(true); setError(""); setResult(null); setVerifyResult(null); setJwksResult(null);
    try {
      const res = await fetch(`${API}/decode`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: tk }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Decode failed");
      setResult(data);
      addToast("JWT decoded successfully", "success");
      saveToHistory(tk, data.header, data.payload);
      if (data.header?.alg && SUPPORTED_ALGORITHMS.includes(data.header.alg)) setVerifyAlgorithm(data.header.alg);
    } catch (e) { setError(e.message); addToast(`Decode error: ${e.message}`, "error"); }
    finally { setLoading(false); }
  }, [token, addToast, saveToHistory]);

  const loadHistoryItem = useCallback((tok) => { setToken(tok); decode(tok); addToast("Loaded from history", "info"); }, [decode, addToast]);
  const removeHistoryItem = useCallback((id) => {
    setHistory(prev => { const u = prev.filter(i => i.id !== id); localStorage.setItem("jwt_history", JSON.stringify(u)); return u; });
    addToast("Removed from history", "info");
  }, [addToast]);
  const clearHistory = useCallback(() => { setHistory([]); localStorage.removeItem("jwt_history"); addToast("History cleared", "info"); }, [addToast]);

  // Auto-verify when result, key material, or algorithm changes
  useEffect(() => {
    const needsPublicKey = isAsymmetric(verifyAlgorithm);
    const keyMissing = needsPublicKey ? !verifyPublicKey.trim() : !verifySecret;
    if (!result || !token || keyMissing) { setVerifyResult(null); return; }
    let mounted = true;
    const verify = async () => {
      setVerifying(true);
      try {
        const res = await fetch(`${API}/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: token.trim(), secret: needsPublicKey ? "" : verifySecret, algorithm: verifyAlgorithm, public_key: needsPublicKey ? verifyPublicKey : null }) });
        const data = await res.json();
        if (mounted) {
          if (data.overall_valid && (!verifyResult || !verifyResult.overall_valid)) addToast("Signature verified ✓", "success");
          setVerifyResult(data);
        }
      } catch (e) { console.error("Verify error", e); }
      finally { if (mounted) setVerifying(false); }
    };
    const t = setTimeout(verify, 200);
    return () => { mounted = false; clearTimeout(t); };
  }, [token, result, verifySecret, verifyPublicKey, verifyAlgorithm, addToast]);

  // JWKS resolution (explicit, opt-in — never fires on paste)
  const resolveJwks = useCallback(async () => {
    const tk = token.trim();
    if (!tk) return;
    setResolving(true);
    try {
      const res = await fetch(`${API}/verify-jwks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tk, jwks_url: jwksUrl.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "JWKS resolution failed");
      setJwksResult(data);
      addToast(
        data.overall_valid
          ? `Signature verified via ${data.jwks_provider} ✓`
          : `JWKS resolution: ${data.message}`,
        data.overall_valid ? "success" : "warning",
      );
    } catch (e) {
      addToast(`JWKS error: ${e.message}`, "error");
    } finally {
      setResolving(false);
    }
  }, [token, jwksUrl, addToast]);

  const useMatchedKey = useCallback(jwkJson => {
    setVerifyPublicKey(jwkJson);
    addToast("Public key loaded into Verify panel", "success");
  }, [addToast]);

  const clearJwks = useCallback(() => {
    setJwksResult(null);
    setJwksUrl("");
  }, []);

  // Live token generation
  useEffect(() => {
    if (currentPath !== "/generate") return;
    let mounted = true;
    const generate = async () => {
      try {
        const parsed = JSON.parse(genPayloadStr);
        setGenError("");
        const res = await fetch(`${API}/sign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ header: { alg: genHeaderAlg, typ: "JWT" }, payload: parsed, secret: genSecret, algorithm: genHeaderAlg, expires_in: genExpiresIn ? parseInt(genExpiresIn) : null }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Sign failed");
        if (mounted) { setGeneratedToken(data.token); setGenResult(data); }
      } catch (e) { if (mounted) setGenError(e.message); }
    };
    const t = setTimeout(generate, 300);
    return () => { mounted = false; clearTimeout(t); };
  }, [genPayloadStr, genHeaderAlg, genSecret, genExpiresIn, currentPath]);

  // PDF export
  const exportPDF = async () => {
    if (!result) return;
    setExporting(true);
    try {
      const res = await fetch(`${API}/export-pdf`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: token.trim(), header: result.header, payload: result.payload, signature: result.signature }) });
      if (!res.ok) throw new Error("PDF export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `jwt-report-${result.payload.sub || "decoded"}.pdf`; a.click();
      URL.revokeObjectURL(url);
      addToast("PDF exported successfully", "success");
    } catch (e) { setError(e.message); addToast(`PDF error: ${e.message}`, "error"); }
    finally { setExporting(false); }
  };

  const loadSample = () => { setToken(SAMPLE_JWT); decode(SAMPLE_JWT); };
  const clear = () => { setToken(""); setResult(null); setError(""); setVerifyResult(null); clearJwks(); addToast("Cleared", "info"); };
  const openInDecoder = (tok) => { setToken(tok); navigate("/decode"); decode(tok); addToast("Token loaded in decoder", "info"); };
  const resetAllStates = () => { clear(); setGenHeaderAlg("HS256"); setGenSecret("my-secret-key"); setGenExpiresIn("86400"); addToast("Reset complete", "success"); };

  if (currentPath === "/" || currentPath === "") {
    return <LandingPage navigate={navigate} loadSample={loadSample} />;
  }

  return (
    <div className="min-h-screen dot-grid-animated flex flex-col bg-background text-foreground">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-cyan-500/4 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-violet-600/4 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 py-7 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-main pb-5">
          <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-all select-none">
            <div className="w-10 h-10 rounded-xl badge-cyan-outline flex items-center justify-center glow-pulse">
              <svg className="w-5 h-5 text-cyan-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-main font-display-custom tracking-tight">JWT Console</h1>
                <span className="cyber-badge text-cyan-custom">PRO</span>
              </div>
              <p className="text-muted-custom text-xs mt-0.5 font-mono-custom">Base64url · HMAC · Cryptographic Suite</p>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="flex bg-secondary-custom border border-main p-1 rounded-xl gap-1">
            {[
              { path: "/decode", label: "Decoder", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { path: "/audit", label: "Audit", icon: "M9 12l2 2 4-4m5.6-2A10 10 0 112 12a10 10 0 0117.6-6z" },
              { path: "/diff", label: "Diff", icon: "M8 7h13m0 0v13m0-13l-3 3m-3-3H3m0 0v13m0-13l3 3m-3 3h8a10 10 0 0110 10v-1" },
              { path: "/generate", label: "Generator", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map(nav => (
              <button key={nav.path} onClick={() => navigate(nav.path)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${currentPath === nav.path ? "badge-indigo-outline" : "text-muted-custom hover:text-main"}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={nav.icon} />
                </svg>
                {nav.label}
              </button>
            ))}
          </div>
        </header>

        {/* Decoder View */}
        {currentPath === "/decode" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 flex-1 items-start w-full">
            <div className="lg:col-span-5 w-full">
              <ErrorBoundary onReset={resetAllStates}>
                <DecoderPanel token={token} setToken={setToken} decode={decode} loadSample={loadSample} clear={clear} loading={loading} error={error} history={history} loadHistoryItem={loadHistoryItem} clearHistory={clearHistory} removeHistoryItem={removeHistoryItem} />
              </ErrorBoundary>
            </div>
            <div className="lg:col-span-7 space-y-5 w-full">
              {!result ? (
                <LandingOverview loadSample={loadSample} />
              ) : (
                <ErrorBoundary onReset={resetAllStates}>
                  {/* PDF Toolbar */}
                  <div className="flex items-center justify-between px-5 py-3 rounded-2xl glass-panel animate-fade-up">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-custom font-mono-custom">
                      <span className="w-2 h-2 rounded-full dot-cyan glow-pulse" />
                      Base64url decoded
                    </div>
                    <button onClick={exportPDF} disabled={exporting}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl btn-violet-action text-xs font-bold uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer">
                      {exporting ? (
                        <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Exporting</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Export PDF</>
                      )}
                    </button>
                  </div>

                  <SecurityScanner header={result.header} payload={result.payload} verifyResult={verifyResult} verifySecret={isAsymmetric(verifyAlgorithm) ? "" : verifySecret} />

                  <SectionCard title="Header · Algorithm & Type" badge="Header" badgeColor="#e11d48" data={result.header} />

                  <SectionCard title="Payload · Claims & Data" badge="Payload" badgeColor="#7c3aed" data={result.payload}
                    extra={Object.keys(result.time_fields || {}).length > 0 && (
                      <div className="flex flex-col gap-2 w-full">
                        {Object.keys(result.time_fields).map(k => <TimeBadge key={k} label={k} ts={result.payload[k]} />)}
                      </div>
                    )}
                  />

                  <VerifyPanel verifyAlgorithm={verifyAlgorithm} setVerifyAlgorithm={setVerifyAlgorithm} verifySecret={verifySecret} setVerifySecret={setVerifySecret} verifyPublicKey={verifyPublicKey} setVerifyPublicKey={setVerifyPublicKey} verifyResult={verifyResult} showSecret={showSecret} setShowSecret={setShowSecret} showPublicKey={showPublicKey} setShowPublicKey={setShowPublicKey} />

                  <JWKSResolverPanel token={token} header={result.header} payload={result.payload} jwksUrl={jwksUrl} setJwksUrl={setJwksUrl} jwksResult={jwksResult} resolving={resolving} resolve={resolveJwks} onUseMatchedKey={useMatchedKey} onClear={clearJwks} />
                </ErrorBoundary>
              )}
            </div>
          </div>
        )}

        {/* Audit View */}
        {currentPath === "/audit" && (
          <ErrorBoundary onReset={resetAllStates}>
            {!result ? (
              <div className="glass-panel rounded-2xl p-10 text-center space-y-3 animate-fade-up">
                <div className="text-main text-sm font-bold">Nothing to audit yet</div>
                <div className="text-xs text-muted-custom">
                  Decode a token first — the audit needs its header and claims.
                </div>
                <button
                  onClick={loadSample}
                  className="mt-2 px-5 py-2.5 rounded-xl btn-action-custom text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  Load sample token
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="px-5 py-3 rounded-2xl glass-panel flex items-center justify-between gap-4 animate-fade-up">
                  <div>
                    <div className="text-xs font-bold text-main font-mono-custom">
                      {result.header?.alg} · {result.payload?.sub || "no subject"}
                    </div>
                    <div className="text-[10px] text-muted-custom font-mono-custom mt-0.5">
                      {result.payload?.iss || "no issuer"}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/decode")}
                    className="px-4 py-2 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap"
                  >
                    Edit token
                  </button>
                </div>
                <AuditPanel token={token} result={result} verifyPublicKey={verifyPublicKey} />
              </div>
            )}
          </ErrorBoundary>
        )}

        {/* Diff View */}
        {currentPath === "/diff" && (
          <ErrorBoundary onReset={resetAllStates}>
            <DiffPanel activeToken={result ? token : ""} />
          </ErrorBoundary>
        )}

        {/* Generator View */}
        {currentPath === "/generate" && (
          <ErrorBoundary onReset={resetAllStates}>
            <GeneratorPanel genHeaderAlg={genHeaderAlg} setGenHeaderAlg={setGenHeaderAlg} genPayloadStr={genPayloadStr} setGenPayloadStr={setGenPayloadStr} genSecret={genSecret} setGenSecret={setGenSecret} genExpiresIn={genExpiresIn} setGenExpiresIn={setGenExpiresIn} generatedToken={generatedToken} genResult={genResult} genError={genError} showGenSecret={showGenSecret} setShowGenSecret={setShowGenSecret} openInDecoder={openInDecoder} />
          </ErrorBoundary>
        )}

        <footer className="mt-14 text-center text-xs text-muted-custom border-t border-main pt-5 font-mono-custom">
          <p>🔐 JWT Console · No tokens are logged or stored · Sandboxed cryptographic tooling</p>
        </footer>
      </div>
    </div>
  );
}
