import { useState } from "react";
import ScrollReveal from "../ScrollReveal";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Is my secret key or private payload secure?",
      a: "Yes. Token parsing and Base64url inspection execute completely in your local browser sandbox. Cryptographic validation runs against the local FastAPI instance without ever writing keys or claims to disk or logging them.",
    },
    {
      q: "How does algorithm confusion defense work?",
      a: "The verifier pins the expected algorithm family and explicitly rejects mismatched signatures (such as verifying an RSA token with an HMAC public key string), failing closed by design.",
    },
    {
      q: "Which remote JWKS providers are supported?",
      a: "Auth0, Okta, Firebase, AWS Cognito, Google Identity, Azure Active Directory, Keycloak, and Apple are auto-detected via the `iss` claim. Custom JWKS URLs are also supported with strict SSRF validation.",
    },
    {
      q: "Can I generate tokens for local development and testing?",
      a: "Absolutely! Open the Token Generator tab to compose custom JSON payloads, select your desired algorithm, set an expiration TTL, and mint a cryptographically valid JWT in real time.",
    },
  ];

  return (
    <ScrollReveal distance={40} duration={650} as="section" className="space-y-4 max-w-3xl mx-auto relative z-10">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-main font-display-custom">Frequently Asked Questions</h2>
        <p className="text-xs text-muted-custom">
          Technical clarifications on privacy, verification, and cryptographic standards
        </p>
      </div>

      <div className="space-y-2.5 pt-2">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="glass-panel rounded-xl border border-main overflow-hidden transition-all shadow-xs bg-white/80 backdrop-blur-md"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full px-5 py-4 text-left text-xs font-bold text-main flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
            >
              <span>{f.q}</span>
              <span
                className={`text-base font-mono-custom text-primary-color transition-transform duration-200 ${
                  openFaq === i ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4 text-xs text-muted-custom leading-relaxed border-t border-main pt-3 animate-fade-up bg-slate-50/60">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
