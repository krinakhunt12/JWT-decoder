import { useState } from "react";
import { useJwtContext } from "../context/JwtContext";
import ErrorBoundary from "../components/ErrorBoundary";
import DecoderPanel from "../components/DecoderPanel";
import LandingOverview from "../components/LandingOverview";
import SecurityScanner from "../components/SecurityScanner";
import SectionCard from "../components/SectionCard";
import VerifyPanel from "../components/VerifyPanel";
import JWKSResolverPanel from "../components/JWKSResolverPanel";
import TimeBadge from "../components/TimeBadge";
import LifecycleMonitor from "../components/LifecycleMonitor";
import SnippetGeneratorModal from "../components/SnippetGeneratorModal";
import { isAsymmetric } from "../constants/algorithms";

export default function DecoderView() {
  const [showSnippetModal, setShowSnippetModal] = useState(false);

  const {
    token,
    setToken,
    result,
    error,
    loading,
    exporting,
    history,
    loadHistoryItem,
    clearHistory,
    removeHistoryItem,
    decode,
    loadSample,
    clear,
    exportPDF,
    verifyAlgorithm,
    setVerifyAlgorithm,
    verifySecret,
    setVerifySecret,
    verifyPublicKey,
    setVerifyPublicKey,
    verifyResult,
    showSecret,
    setShowSecret,
    showPublicKey,
    setShowPublicKey,
    jwksUrl,
    setJwksUrl,
    jwksResult,
    resolving,
    resolveJwks,
    useMatchedKey,
    clearJwks,
    resetAllStates,
  } = useJwtContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 flex-1 items-start w-full">
      {/* 🚀 Developer Snippet Generator Modal */}
      <SnippetGeneratorModal
        token={token}
        isOpen={showSnippetModal}
        onClose={() => setShowSnippetModal(false)}
      />

      {/* Left Column: Token Input & History Panel */}
      <div className="lg:col-span-5 w-full">
        <ErrorBoundary onReset={resetAllStates}>
          <DecoderPanel
            token={token}
            setToken={setToken}
            decode={decode}
            loadSample={loadSample}
            clear={clear}
            loading={loading}
            error={error}
            history={history}
            loadHistoryItem={loadHistoryItem}
            clearHistory={clearHistory}
            removeHistoryItem={removeHistoryItem}
          />
        </ErrorBoundary>
      </div>

      {/* Right Column: Decoded Payload / Verification / Security Inspector */}
      <div className="lg:col-span-7 space-y-5 w-full">
        {!result ? (
          <LandingOverview loadSample={loadSample} />
        ) : (
          <ErrorBoundary onReset={resetAllStates}>
            {/* Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl glass-panel animate-fade-up">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-color font-mono-custom">
                <span className="w-2 h-2 rounded-full dot-indigo glow-pulse" />
                Base64url decoded successfully
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Feature 2: 1-Click Code Snippet Generator Trigger */}
                <button
                  onClick={() => setShowSnippetModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs hover:border-indigo-300 hover:scale-[1.02]"
                >
                  <span>🚀</span>
                  <span>API Snippets</span>
                </button>

                {/* PDF Export Button */}
                <button
                  onClick={exportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary-custom text-xs font-bold uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  {exporting ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Exporting</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Export PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Feature 1: Live Expiry & Session Lifecycle Countdown Monitor */}
            <LifecycleMonitor payload={result.payload} />

            {/* Cryptographic & Security Scanner */}
            <SecurityScanner
              header={result.header}
              payload={result.payload}
              verifyResult={verifyResult}
              verifySecret={isAsymmetric(verifyAlgorithm) ? "" : verifySecret}
            />

            {/* Header Claims Card */}
            <SectionCard
              title="Header · Algorithm & Type"
              badge="Header"
              badgeColor="#e11d48"
              data={result.header}
            />

            {/* Payload Claims Card */}
            <SectionCard
              title="Payload · Claims & Data"
              badge="Payload"
              badgeColor="#7c3aed"
              data={result.payload}
              extra={
                Object.keys(result.time_fields || {}).length > 0 && (
                  <div className="flex flex-col gap-2 w-full mt-3">
                    {Object.keys(result.time_fields).map((k) => (
                      <TimeBadge key={k} label={k} ts={result.payload[k]} />
                    ))}
                  </div>
                )
              }
            />

            {/* Verification Panel */}
            <VerifyPanel
              verifyAlgorithm={verifyAlgorithm}
              setVerifyAlgorithm={setVerifyAlgorithm}
              verifySecret={verifySecret}
              setVerifySecret={setVerifySecret}
              verifyPublicKey={verifyPublicKey}
              setVerifyPublicKey={setVerifyPublicKey}
              verifyResult={verifyResult}
              showSecret={showSecret}
              setShowSecret={setShowSecret}
              showPublicKey={showPublicKey}
              setShowPublicKey={setShowPublicKey}
            />

            {/* JWKS Remote Key Resolver */}
            <JWKSResolverPanel
              token={token}
              header={result.header}
              payload={result.payload}
              jwksUrl={jwksUrl}
              setJwksUrl={setJwksUrl}
              jwksResult={jwksResult}
              resolving={resolving}
              resolve={resolveJwks}
              onUseMatchedKey={useMatchedKey}
              onClear={clearJwks}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
