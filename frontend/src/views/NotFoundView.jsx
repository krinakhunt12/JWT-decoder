import { useNavigate } from "react-router-dom";

export default function NotFoundView() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-up max-w-lg mx-auto">
      {/* 404 Cyber Graphic */}
      <div className="relative mb-6">
        <div className="text-8xl sm:text-9xl font-black text-indigo-600/10 font-mono-custom select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-indigo-outline text-[10px] font-bold tracking-widest uppercase font-mono-custom mb-3">
        <span className="w-1.5 h-1.5 rounded-full dot-indigo" />
        Route Not Found
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-main font-display-custom tracking-tight">
        Claim Destination Undefined
      </h1>

      <p className="text-xs sm:text-sm text-muted-custom mt-2 leading-relaxed max-w-md">
        The cryptographic resource or view you requested does not exist on this endpoint. Check the path or jump into one of our suite tools below.
      </p>

      {/* Quick Links */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-xl btn-primary-custom text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all cursor-pointer"
        >
          Return Home
        </button>
        <button
          onClick={() => navigate("/decode")}
          className="px-5 py-2.5 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Open Decoder
        </button>
        <button
          onClick={() => navigate("/audit")}
          className="px-5 py-2.5 rounded-xl border border-main hover:bg-slate-50 text-muted-custom hover:text-main text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Security Audit
        </button>
      </div>
    </div>
  );
}
