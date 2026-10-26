import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps) {
    // If resetKeys are provided and any key changed, reset error boundary state
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys[idx]
      );
      if (hasChanged) {
        this.handleReset();
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
    if (typeof this.props.onReset === "function") {
      try {
        this.props.onReset();
      } catch (err) {
        console.error("Error executing onReset in ErrorBoundary:", err);
      }
    }
  };

  handleCopyError = () => {
    const errorText = `Error: ${this.state.error?.message || this.state.error}\n\nStack:\n${
      this.state.error?.stack || "No stack trace"
    }\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || "N/A"}`;
    navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || String(this.state.error) || "An unexpected rendering error occurred";

      return (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/30 shadow-2xl relative overflow-hidden animate-scale-in text-center">
          {/* Ambient error glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Error icon with animated pulse ring */}
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-inner relative z-10">
              <svg className="w-8 h-8 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-rose-500/20 blur-md animate-ping opacity-40 pointer-events-none" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-bold uppercase tracking-widest font-mono-custom mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Shield Activated · Error Isolated
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-main font-display-custom tracking-tight mt-1">
            {this.props.title || "Component Rendering Exception"}
          </h2>
          <p className="text-muted-custom text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            The workspace encountered an unexpected issue while rendering claims or signature operations. Don't worry — the rest of the application remains protected.
          </p>

          {/* Error message snippet */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-900/5 dark:bg-slate-900/40 border border-main text-left font-mono-custom text-xs text-rose-600 break-words flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 overflow-x-auto">{errorMessage}</div>
          </div>

          {/* Expandable details */}
          <div className="mt-3 text-left">
            <button
              onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              className="text-[11px] font-mono-custom font-semibold text-muted-custom hover:text-main flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{this.state.showDetails ? "Hide technical stack trace" : "View technical stack trace"}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${this.state.showDetails ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {this.state.showDetails && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono-custom text-[11px] overflow-x-auto max-h-48 space-y-2 border border-slate-800 animate-fade-up">
                <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1 flex justify-between items-center">
                  <span>Stack Trace</span>
                  <button
                    onClick={this.handleCopyError}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wider cursor-pointer"
                  >
                    {this.state.copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed text-[10px] text-slate-400">
                  {this.state.error?.stack || "No call stack available"}
                </pre>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset & Recover</span>
            </button>

            <button
              onClick={this.handleCopyError}
              className="px-4 py-2.5 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{this.state.copied ? "Copied to Clipboard" : "Copy Diagnostics"}</span>
            </button>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="px-4 py-2.5 rounded-xl border border-main hover:bg-slate-100 text-muted-custom hover:text-main text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Home Console
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
