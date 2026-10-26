import ScrollReveal from "../ScrollReveal";

export default function ComparisonSection() {
  const comparisonRows = [
    { feature: "Client-Side Decoding", pro: true, note: "No token payloads sent to analytics or third-party servers" },
    { feature: "Strict Algorithm Pinning", pro: true, note: "Prevents alg:none and HMAC-RSA confusion downgrade exploits" },
    { feature: "Remote JWKS Fetching with SSRF Guard", pro: true, note: "Blocks private network probe attempts via malicious iss URLs" },
    { feature: "Live Offline Token Generator", pro: true, note: "Compose and sign RFC 7519 tokens with arbitrary TTLs" },
    { feature: "Side-by-Side Payload Diff Engine", pro: true, note: "Identify permission changes between renewed tokens" },
  ];

  return (
    <ScrollReveal distance={40} duration={650} as="section" className="glass-panel rounded-2xl p-6 sm:p-8 border border-main space-y-5 max-w-5xl mx-auto shadow-xs bg-white/80 backdrop-blur-md relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-main pb-4">
        <div>
          <h3 className="text-lg font-bold text-main font-display-custom">Why JWT Console Stands Apart</h3>
          <p className="text-xs text-muted-custom">Comparing local sandboxing with public online decoders</p>
        </div>
        <span className="text-[10px] font-bold px-3 py-1 rounded-full badge-emerald-outline self-start sm:self-center font-mono-custom">
          100% Privacy Preserving
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-main text-muted-custom uppercase text-[10px] tracking-wider font-mono-custom">
              <th className="py-2.5 font-bold">Capability</th>
              <th className="py-2.5 font-bold text-primary-color">JWT Console Pro</th>
              <th className="py-2.5 font-bold text-slate-400">Generic Online Decoders</th>
              <th className="py-2.5 font-bold text-slate-500 hidden sm:table-cell">Why It Matters</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 font-semibold text-main">{row.feature}</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    ✓ Supported
                  </span>
                </td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold text-red-600 bg-red-50 border border-red-200">
                    ✗ No / Insecure
                  </span>
                </td>
                <td className="py-3 text-muted-custom text-[11px] hidden sm:table-cell">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollReveal>
  );
}
