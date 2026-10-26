export default function LoadingFallback({ message = "Initializing Cryptographic Workspace..." }) {
  return (
    <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-fade-up">
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing pulsing orb */}
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
        
        {/* Rotating cyber spinner rings */}
        <div className="absolute w-16 h-16 rounded-full border-2 border-indigo-200/40 border-t-indigo-600 animate-spin" />
        <div className="absolute w-12 h-12 rounded-full border-2 border-cyan-300/40 border-b-cyan-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
        
        {/* Center lock / key icon */}
        <div className="w-8 h-8 rounded-lg bg-card-custom border border-main flex items-center justify-center shadow-xs">
          <svg className="w-4 h-4 text-primary-color animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      {/* Cyber badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-indigo-outline text-[10px] font-bold tracking-widest uppercase font-mono-custom mb-3 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full dot-indigo glow-pulse" />
        Asynchronous Module Loading
      </div>

      <h3 className="text-base font-bold text-main font-display-custom tracking-tight">
        {message}
      </h3>
      <p className="text-xs text-muted-custom font-mono-custom mt-1 max-w-sm">
        Preparing secure WASM & cryptographic libraries for sandboxed evaluation
      </p>

      {/* Shimmering progress indicator */}
      <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden border border-main relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 rounded-full animate-progress" />
      </div>
    </div>
  );
}
