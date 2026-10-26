import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="mt-16 border-t border-main bg-white/50 backdrop-blur-md pt-10 pb-8 text-xs text-muted-custom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg badge-indigo-outline flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-primary-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="font-bold text-main tracking-tight font-display-custom">JWT Console</span>
            </div>
            <p className="leading-relaxed text-[11px] text-muted-custom">
              A private, sandboxed, timing-safe cryptographic inspection and security analysis platform for JSON Web Tokens.
            </p>
            <div className="flex items-center gap-2 font-mono-custom text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-semibold">Zero-Log Client Sandbox</span>
            </div>
          </div>

          {/* Core Tools */}
          <div className="space-y-2">
            <h4 className="font-bold text-main uppercase tracking-wider text-[11px] font-display-custom">Tools</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => navigate("/decode")} className="hover:text-primary-color cursor-pointer transition-colors">
                  JWT Decoder & Inspector
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/audit")} className="hover:text-primary-color cursor-pointer transition-colors">
                  Vulnerability Security Scanner
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/diff")} className="hover:text-primary-color cursor-pointer transition-colors">
                  Side-by-Side Claim Diff
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/generate")} className="hover:text-primary-color cursor-pointer transition-colors">
                  Live HMAC Token Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Cryptographic Standards */}
          <div className="space-y-2">
            <h4 className="font-bold text-main uppercase tracking-wider text-[11px] font-display-custom">Standards</h4>
            <div className="flex flex-wrap gap-1.5">
              {["RFC 7519 · JWT", "RFC 7515 · JWS", "RFC 7517 · JWK", "RFC 7518 · JWA", "OpenID Connect"].map((std) => (
                <span key={std} className="px-2 py-0.5 rounded-md bg-secondary-custom border border-main text-[10px] font-mono-custom font-medium">
                  {std}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-custom leading-normal mt-2">
              Supports HS256, HS384, HS512, RS256, RS384, RS512, and ES256, ES384, ES512 algorithms.
            </p>
          </div>

          {/* Company & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-main uppercase tracking-wider text-[11px] font-display-custom">Navigation</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => navigate("/")} className="hover:text-primary-color cursor-pointer transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-primary-color cursor-pointer transition-colors">
                  About the Platform & Architecture
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-primary-color cursor-pointer transition-colors">
                  Contact & Support
                </button>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary-color transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-main pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p className="font-mono-custom">
            Built by <strong className="text-main font-semibold">Krina</strong> · Senior Software & Systems Engineer
          </p>
          <div className="flex items-center gap-4 text-muted-custom">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              FastAPI + React 19 + ReportLab
            </span>
            <span>·</span>
            <span>No tokens logged or stored</span>
          </div>
        </div>
      </div>
    </footer>
  );
}