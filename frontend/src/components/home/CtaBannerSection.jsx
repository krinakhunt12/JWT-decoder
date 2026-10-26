import { useNavigate } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

export default function CtaBannerSection() {
  const navigate = useNavigate();

  return (
    <ScrollReveal distance={40} duration={650} as="section" className="glass-panel rounded-2xl p-8 border border-main flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm max-w-5xl mx-auto bg-white/85 backdrop-blur-md z-10">
      <div className="space-y-2 text-center md:text-left">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-color font-mono-custom block">
          Ready to inspect your tokens?
        </span>
        <h3 className="text-2xl font-bold text-main font-display-custom">
          Launch the Secure JWT Debugger Now
        </h3>
        <p className="text-xs text-muted-custom max-w-lg">
          No registration required, no cloud persistence, and instant cryptographic feedback.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate("/decode")}
          className="px-6 py-3 rounded-xl font-bold text-xs tracking-widest uppercase btn-primary-custom shadow-md hover:scale-[1.02] cursor-pointer transition-all"
        >
          Launch Decoder
        </button>
        <button
          onClick={() => navigate("/generate")}
          className="px-6 py-3 rounded-xl font-bold text-xs tracking-widest uppercase btn-secondary-custom hover:scale-[1.02] cursor-pointer transition-all shadow-xs"
        >
          Token Generator
        </button>
      </div>
    </ScrollReveal>
  );
}
