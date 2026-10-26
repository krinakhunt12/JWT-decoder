import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ showLabel = false, className = "" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Crisp Light" : "Cyber Dark"} Mode`}
      title={`Current: ${isDark ? "Cyber Dark Mode" : "Crisp Light Mode"} (Click to switch)`}
      className={`relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${isDark
          ? "bg-slate-900/90 border-purple-500/30 text-purple-300 hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
          : "bg-white/90 border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-xs"
        } ${className}`}
    >
      {/* Icon Frame with 360-degree rotation transition */}
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (Visible in Light Mode) */}
        <svg
          className={`w-4 h-4 text-amber-500 transition-all duration-300 transform ${isDark
              ? "rotate-90 scale-0 opacity-0 absolute"
              : "rotate-0 scale-100 opacity-100"
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="4" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 2v2m0 16v2m10-10h-2M4 10H2m15.364-7.364l-1.414 1.414M7.05 16.95l-1.414 1.414M17.364 17.364l-1.414-1.414M7.05 7.05L5.636 5.636"
          />
        </svg>

        {/* Moon & Stars Icon (Visible in Dark Mode) */}
        <svg
          className={`w-4 h-4 text-cyan-400 transition-all duration-300 transform ${isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 absolute"
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          {/* Subtle star dot */}
          <circle cx="19" cy="5" r="1" fill="#a855f7" className="animate-pulse" />
        </svg>
      </div>

      {/* Optional Mode Tag / Label */}
      {showLabel ? (
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
          {isDark ? "Cyber Dark" : "Crisp Light"}
        </span>
      ) : (
        <span className="sr-only">Toggle theme</span>
      )}

      {/* Cyber Glowing Ping Indicator in Dark Mode */}
      {isDark && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
        </span>
      )}
    </button>
  );
}
