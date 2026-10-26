import { useNavigate } from "react-router-dom";
import { useJwtContext } from "../context/JwtContext";
import ErrorBoundary from "../components/ErrorBoundary";
import AuditPanel from "../components/AuditPanel";

export default function AuditView() {
  const navigate = useNavigate();
  const { token, result, verifyPublicKey, loadSample, resetAllStates } = useJwtContext();

  return (
    <ErrorBoundary onReset={resetAllStates}>
      {!result ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4 animate-fade-up max-w-lg mx-auto my-6 glow-card">
          <div className="w-14 h-14 rounded-2xl badge-indigo-outline flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-7 h-7 text-primary-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.6-2A10 10 0 112 12a10 10 0 0117.6-6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-main text-base font-bold font-display-custom">
              Nothing to Audit Yet
            </h3>
            <p className="text-xs text-muted-custom mt-1 leading-relaxed">
              Decode a token first — the security audit scanner inspects the algorithm header, key strength, and permission claims.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                loadSample();
                navigate("/audit");
              }}
              className="px-5 py-2.5 rounded-xl btn-primary-custom text-xs font-bold uppercase tracking-widest cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
            >
              Load Sample Token
            </button>
            <button
              onClick={() => navigate("/decode")}
              className="px-5 py-2.5 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-widest cursor-pointer transition-all"
            >
              Open Decoder
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-up">
          {/* Active Token Metadata Summary Bar */}
          <div className="px-5 py-3.5 rounded-2xl glass-panel flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-main font-mono-custom flex items-center gap-2">
                <span className="w-2 h-2 rounded-full dot-indigo glow-pulse" />
                <span>Algorithm: <strong className="text-primary-color">{result.header?.alg}</strong></span>
                <span className="text-slate-300">·</span>
                <span>Subject: <strong>{result.payload?.sub || "no subject"}</strong></span>
              </div>
              <div className="text-[10px] text-muted-custom font-mono-custom mt-0.5">
                Issuer: {result.payload?.iss || "no issuer provided"}
              </div>
            </div>
            <button
              onClick={() => navigate("/decode")}
              className="px-4 py-2 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap shadow-xs hover:border-indigo-300"
            >
              Edit in Decoder →
            </button>
          </div>

          {/* Deep Audit Engine */}
          <AuditPanel token={token} result={result} verifyPublicKey={verifyPublicKey} />
        </div>
      )}
    </ErrorBoundary>
  );
}
