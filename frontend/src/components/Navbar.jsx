import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ loadSample }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { path: "/decode", label: "Decoder", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { path: "/audit", label: "Audit", icon: "M9 12l2 2 4-4m5.6-2A10 10 0 112 12a10 10 0 0117.6-6z" },
    { path: "/diff", label: "Diff", icon: "M8 7h13m0 0v13m0-13l-3 3m-3-3H3m0 0v13m0-13l3 3m-3 3h8a10 10 0 0110 10v-1" },
    { path: "/generate", label: "Generator", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { path: "/about", label: "About", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { path: "/contact", label: "Contact", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 border-b border-main shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl badge-indigo-outline flex items-center justify-center glow-pulse group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-primary-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-main tracking-tight font-display-custom">JWT Console</span>
              <span className="cyber-badge text-primary-color bg-indigo-50 border-indigo-200">v2.0</span>
            </div>
            <span className="text-[10px] text-muted-custom font-mono-custom hidden sm:inline">Cryptographic Security Suite</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-secondary-custom/70 border border-main p-1 rounded-xl">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${isActive
                    ? "badge-indigo-outline shadow-xs font-semibold"
                    : "text-muted-custom hover:text-main hover:bg-white/60"
                  }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Sample Load */}
        <div className="hidden sm:flex items-center gap-2.5">
          {loadSample && currentPath === "/decode" ? (
            <button
              onClick={loadSample}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider btn-secondary-custom cursor-pointer hover:border-indigo-300 transition-all shadow-xs"
            >
              Load Sample
            </button>
          ) : null}

          <button
            onClick={() => navigate("/decode")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider btn-primary-custom cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
          >
            <span>Launch App</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl border border-main bg-card-custom text-muted-custom hover:text-main cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu with Animation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-main bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1.5 animate-scale-in">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${isActive
                    ? "badge-indigo-outline text-primary-color"
                    : "text-muted-custom hover:bg-slate-100 hover:text-main"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-main flex gap-2">
            <button
              onClick={() => {
                navigate("/decode");
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider btn-primary-custom text-center cursor-pointer"
            >
              Open Decoder Console
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
