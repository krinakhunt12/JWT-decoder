import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import { useJwtContext } from "../context/JwtContext";

export default function ToolLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { resetAllStates } = useJwtContext();

  const toolTabs = [
    { path: "/decode", label: "Decoder", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { path: "/audit", label: "Audit", icon: "M9 12l2 2 4-4m5.6-2A10 10 0 112 12a10 10 0 0117.6-6z" },
    { path: "/diff", label: "Diff", icon: "M8 7h13m0 0v13m0-13l-3 3m-3-3H3m0 0v13m0-13l3 3m-3 3h8a10 10 0 0110 10v-1" },
    { path: "/generate", label: "Generator", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const getToolMeta = () => {
    switch (currentPath) {
      case "/decode":
        return {
          title: "JWT Decoder & Cryptographic Inspector",
          subtitle: "Base64url inspection · HMAC / RSA / ECDSA verification · Remote JWKS auto-discovery",
        };
      case "/audit":
        return {
          title: "Automated Vulnerability & Security Audit",
          subtitle: "Check for alg:none, weak secrets, and missing security claims",
        };
      case "/diff":
        return {
          title: "Side-by-Side Claim Diff Engine",
          subtitle: "Compare token claims side-by-side with visual diff markers",
        };
      case "/generate":
        return {
          title: "Live HMAC Token Generator",
          subtitle: "Sign custom payloads with HS256 / HS384 / HS512 in real time",
        };
      default:
        return {
          title: "Developer Cryptographic Suite",
          subtitle: "Select a tool module below to inspect or forge security claims",
        };
    }
  };

  const meta = getToolMeta();

  return (
    <div className="space-y-6 flex-1 flex flex-col w-full animate-fade-up">
      {/* Tool Header & Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-main pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-main font-display-custom tracking-tight">
              {meta.title}
            </h1>
            <span className="cyber-badge text-primary-color bg-indigo-50 border-indigo-200">
              TOOL
            </span>
          </div>
          <p className="text-muted-custom text-xs mt-0.5 font-mono-custom">
            {meta.subtitle}
          </p>
        </div>

        {/* Sub-tabs with smooth indicator */}
        <div className="flex bg-secondary-custom/80 border border-main p-1 rounded-xl gap-1 self-stretch sm:self-auto shadow-xs">
          {toolTabs.map((nav) => {
            const isActive = currentPath === nav.path;
            return (
              <button
                key={nav.path}
                onClick={() => navigate(nav.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer relative ${
                  isActive
                    ? "badge-indigo-outline shadow-xs font-semibold text-primary-color"
                    : "text-muted-custom hover:text-main hover:bg-white/60"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={nav.icon} />
                </svg>
                <span>{nav.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-color rounded-full animate-scale-in" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area with Protected ErrorBoundary */}
      <ErrorBoundary resetKeys={[currentPath]} onReset={resetAllStates}>
        <div className="w-full flex-1 flex flex-col">
          {children || <Outlet />}
        </div>
      </ErrorBoundary>
    </div>
  );
}
