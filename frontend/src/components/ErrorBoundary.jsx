import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel rounded-2xl p-8 text-center alert-box-error animate-fade-up max-w-lg mx-auto my-10">
          <div className="w-14 h-14 rounded-full badge-rose-outline flex items-center justify-center mx-auto mb-5 shadow-inner">
            <svg className="w-7 h-7 text-danger-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className="text-danger-custom font-bold tracking-wide uppercase text-xs">Render Failure</h3>
          <h2 className="text-main text-lg font-semibold mt-2">Unexpected Component Crash</h2>
          <p className="text-muted-custom text-xs mt-2.5 leading-relaxed">
            The UI encountered an error while processing input claims or signatures. If you pasted custom formatting, it may have caused a parsing exception.
          </p>

          {this.state.error && (
            <div className="mt-4 p-3 rounded-lg bg-muted-custom border border-main font-mono-custom text-xs text-danger-custom text-left break-all overflow-x-auto max-h-24 leading-relaxed">
              {this.state.error.toString()}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white transition-all shadow-md cursor-pointer"
          >
            Reset Panel & Recover
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
