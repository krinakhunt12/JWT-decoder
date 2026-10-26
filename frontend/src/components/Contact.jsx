import { useState, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";


export default function Contact({ addToast }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "feature",
    priority: "normal",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    // Check local API health
    const checkApi = async () => {
      try {
        const res = await fetch("http://localhost:8000/", { method: "GET" });
        if (res.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("degraded");
        }
      } catch {
        setApiStatus("offline");
      }
    };
    checkApi();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      if (addToast) addToast("Please fill in all required fields", "warning");
      return;
    }

    setSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      if (addToast) addToast("Message sent successfully! Thank you for your feedback.", "success");
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "feature",
      priority: "normal",
      message: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="space-y-12 animate-fade-up max-w-5xl mx-auto py-2">
      {/* ─── Hero Header ─── */}
      <ScrollReveal distance={25} duration={550} as="section" className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase badge-indigo-outline rounded-full px-4 py-1.5 glow-indigo-pulse">
          <span className="w-1.5 h-1.5 rounded-full dot-indigo animate-pulse" />
          Feedback & Support Portal
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-main font-display-custom tracking-tight">
          Get in Touch With Us
        </h1>
        <p className="text-xs sm:text-sm text-muted-custom leading-relaxed">
          Have an idea for a new cryptographic feature, found a bug, or want to discuss security? Send a message directly to the engineering team.
        </p>
      </ScrollReveal>

      {/* ─── Main Content Grid: Form + Sidebar ─── */}
      <ScrollReveal distance={36} duration={650} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Col: Contact Form (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl border border-main shadow-xs space-y-6">
          <div className="border-b border-main pb-4">
            <h2 className="text-base font-bold text-main font-display-custom">Send an Inquiry or Feature Request</h2>
            <p className="text-xs text-muted-custom mt-0.5">We typically respond within 24–48 hours</p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4 animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-emerald-900 font-display-custom">Message Received!</h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Thank you, <strong className="font-semibold">{formData.name}</strong>. Your inquiry regarding <span className="font-mono-custom">[{formData.category}]</span> has been noted.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl btn-secondary-custom text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white transition-all shadow-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-main uppercase tracking-wider text-[10px] font-mono-custom">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Morgan"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl input-text-custom font-mono-custom text-xs shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-main uppercase tracking-wider text-[10px] font-mono-custom">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl input-text-custom font-mono-custom text-xs shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-main uppercase tracking-wider text-[10px] font-mono-custom">
                    Inquiry Topic
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl input-text-custom font-mono-custom text-xs shadow-xs cursor-pointer"
                  >
                    <option value="feature">🚀 Feature Proposal / Request</option>
                    <option value="bug">🐛 Bug Report</option>
                    <option value="security">🛡️ Security Vulnerability</option>
                    <option value="general">💬 General Question / Collab</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-main uppercase tracking-wider text-[10px] font-mono-custom">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl input-text-custom font-mono-custom text-xs shadow-xs cursor-pointer"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Production Blocked)</option>
                    <option value="urgent">Urgent Security Concern</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-main uppercase tracking-wider text-[10px] font-mono-custom">
                    Message Details <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-muted-custom font-mono-custom">
                    {formData.message.length}/1000 characters
                  </span>
                </div>
                <textarea
                  name="message"
                  rows={5}
                  maxLength={1000}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your suggestion, reproduction steps for a bug, or technical inquiry..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl input-text-custom font-mono-custom text-xs shadow-xs resize-y leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl btn-primary-custom text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Inquiry</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Col: Channels & Status Widget (5 cols) */}
        <div className="lg:col-span-5 space-y-5">

          {/* Live System Diagnostics */}
          <div className="glass-panel p-6 rounded-2xl border border-main space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-main pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-main font-mono-custom">
                Local Environment Diagnostics
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold font-mono-custom">
                <span className={`w-2 h-2 rounded-full ${apiStatus === "online" ? "bg-emerald-500 animate-pulse" : apiStatus === "checking" ? "bg-amber-400" : "bg-red-500"}`} />
                <span className={apiStatus === "online" ? "text-emerald-700" : apiStatus === "checking" ? "text-amber-700" : "text-red-600"}>
                  {apiStatus === "online" ? "API Live" : apiStatus === "checking" ? "Checking" : "Offline"}
                </span>
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono-custom">
              <div className="flex items-center justify-between p-2 rounded-lg bg-card-custom border border-main">
                <span className="text-muted-custom">FastAPI Backend</span>
                <span className="text-main font-semibold">http://localhost:8000</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-card-custom border border-main">
                <span className="text-muted-custom">Vite Dev Server</span>
                <span className="text-main font-semibold">http://localhost:5173</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-card-custom border border-main">
                <span className="text-muted-custom">Crypto Library</span>
                <span className="text-main font-semibold">python-jose 3.3.0</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-card-custom border border-main">
                <span className="text-muted-custom">PDF Engine</span>
                <span className="text-main font-semibold">ReportLab A4</span>
              </div>
            </div>
          </div>

          {/* Quick Channels */}
          <div className="glass-panel p-6 rounded-2xl border border-main space-y-3.5 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-main font-mono-custom">
              Direct Contact Channels
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-card-custom border border-main flex items-start gap-3 card-hover-lift">
                <span className="text-xl">🐙</span>
                <div>
                  <div className="font-bold text-main">GitHub Discussions</div>
                  <div className="text-muted-custom text-[11px] mt-0.5">Submit issues, feature requests, or fork the repository.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-card-custom border border-main flex items-start gap-3 card-hover-lift">
                <span className="text-xl">🛡️</span>
                <div>
                  <div className="font-bold text-main">Responsible Disclosure</div>
                  <div className="text-muted-custom text-[11px] mt-0.5">Report security questions or algorithm discrepancies directly.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-card-custom border border-main flex items-start gap-3 card-hover-lift">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="font-bold text-main">Developer</div>
                  <div className="text-muted-custom text-[11px] mt-0.5">Maintained by Krina · Senior Software & Systems Engineer.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
