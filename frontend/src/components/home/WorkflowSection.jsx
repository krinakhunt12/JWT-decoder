import ScrollReveal from "../ScrollReveal";

export default function WorkflowSection() {
  const workflowSteps = [
    { num: "01", title: "Paste Token", desc: "Input any standard Base64url encoded JSON Web Token string." },
    { num: "02", title: "Instant Inspection", desc: "Browse decoded Header metadata, payload claims, and timezone calculations." },
    { num: "03", title: "Verify Signature", desc: "Test HMAC shared secrets or RSA/ECDSA public keys in timing-safe constant time." },
    { num: "04", title: "Export Security PDF", desc: "Download high-fidelity forensic PDF reports generated client-side." },
  ];

  return (
    <ScrollReveal distance={40} duration={650} as="section" className="space-y-6 max-w-5xl mx-auto relative z-10">
      <div className="text-center space-y-1">
        <div className="text-[11px] font-bold text-primary-color uppercase tracking-widest font-mono-custom">
          Process Flow
        </div>
        <h2 className="text-2xl font-bold text-main font-display-custom">
          Four-Step Security Verification Workflow
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {workflowSteps.map((step, idx) => (
          <div
            key={idx}
            className="glass-panel p-5 rounded-2xl border border-main space-y-2 card-hover-lift relative bg-white/75 backdrop-blur-md"
          >
            <span className="text-4xl font-extrabold text-primary-color opacity-25 font-mono-custom block leading-none">
              {step.num}
            </span>
            <h4 className="text-main text-xs font-bold font-display-custom">{step.title}</h4>
            <p className="text-muted-custom text-xs leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
