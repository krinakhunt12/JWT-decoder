import ScrollReveal from "../ScrollReveal";

export default function FeatureGridSection() {
  const featureCards = [
    {
      icon: "⚡",
      badge: "Cryptographic Engine",
      color: "#4f46e5",
      title: "Timing-Safe Verification",
      desc: "Validates HMAC (HS256..512), RSA (RS256..512), and ECDSA (ES256..512) signatures with constant-time equality checks and strict algorithm pinning to prevent confusion attacks.",
    },
    {
      icon: "🌐",
      badge: "Zero-Paste Resolution",
      color: "#0891b2",
      title: "Remote JWKS Auto-Discovery",
      desc: "Automatically resolves public key sets from the `iss` claim across Auth0, Okta, Firebase, AWS Cognito, Google, Azure AD, and Keycloak with full SSRF protection.",
    },
    {
      icon: "🛡️",
      badge: "Vulnerability Scanner",
      color: "#e11d48",
      title: "Deep Security Audit",
      desc: "Instantly audits tokens for the notorious `alg: none` flaw, weak dictionary secrets, missing critical claims (`exp`, `nbf`, `aud`), and token expiration risks.",
    },
    {
      icon: "🔍",
      badge: "Claim Inspector",
      color: "#7c3aed",
      title: "Structured Claim Tree",
      desc: "Unfolds JSON claims with hierarchical indentation, type inference, real-time search, and 1-click clipboard duplication.",
    },
    {
      icon: "🕐",
      badge: "Timezone Engine",
      color: "#059669",
      title: "Bi-Temporal Validity",
      desc: "Automatically translates standard UNIX timestamps (`exp`, `iat`, `nbf`) to both your machine's local timezone and UTC simultaneously.",
    },
    {
      icon: "⚖️",
      badge: "Diff Comparator",
      color: "#d97706",
      title: "Visual Claim Diffing",
      desc: "Compare two tokens side-by-side to highlight payload modifications, permission creep, and token drift across authentication revisions.",
    },
  ];

  return (
    <ScrollReveal distance={40} duration={650} as="section" className="space-y-6 max-w-5xl mx-auto relative z-10">
      <div className="text-center space-y-1">
        <div className="text-[11px] font-bold text-primary-color uppercase tracking-widest font-mono-custom">
          Security Capabilities
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-main tracking-tight font-display-custom">
          Built for Engineers Who Care About Cryptographic Rigor
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {featureCards.map((feat, i) => (
          <div
            key={i}
            className="glass-panel p-6 rounded-2xl border border-main card-hover-lift space-y-3 relative overflow-hidden bg-white/75 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl p-2 rounded-xl bg-slate-100/90 border border-main">{feat.icon}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono-custom"
                style={{ color: feat.color, backgroundColor: `${feat.color}10`, borderColor: `${feat.color}25` }}
              >
                {feat.badge}
              </span>
            </div>
            <h3 className="text-main font-bold text-sm font-display-custom">{feat.title}</h3>
            <p className="text-muted-custom text-xs leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
