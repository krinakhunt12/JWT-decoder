import { useState, useEffect, useRef } from "react";
import { useJwtContext } from "../context/JwtContext";

export default function LifecycleMonitor({ payload }) {
  const { addToast } = useJwtContext();
  const [clockSkew, setClockSkew] = useState(0); // in seconds
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000));

  const exp = payload?.exp ? Number(payload.exp) : null;
  const iat = payload?.iat ? Number(payload.iat) : null;
  const nbf = payload?.nbf ? Number(payload.nbf) : null;

  // Real-time ticking clock (1s interval)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const simulatedNow = currentTime + clockSkew;

  // Audio chime using Web Audio API (no external asset needed)
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  // Check alert when expiration arrives
  useEffect(() => {
    if (!exp) return;
    if (simulatedNow >= exp && !hasAlerted) {
      if (alertEnabled) {
        playAlertChime();
        if (addToast) addToast("⚠️ Inspected token has expired!", "error");
        // Browser notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("JWT Expired", {
            body: `Token for subject "${payload?.sub || "user"}" has expired.`,
            icon: "/favicon.ico",
          });
        }
      }
      setHasAlerted(true);
    } else if (simulatedNow < exp && hasAlerted) {
      setHasAlerted(false); // Reset if clock skew changes back
    }
  }, [simulatedNow, exp, hasAlerted, alertEnabled, addToast, payload]);

  // Request browser notification permission
  const handleToggleAlert = async () => {
    if (!alertEnabled) {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      setAlertEnabled(true);
      if (addToast) addToast("Expiry notifications enabled 🔔", "info");
    } else {
      setAlertEnabled(false);
    }
  };

  if (!exp && !iat && !nbf) {
    return (
      <div className="p-4 rounded-2xl glass-panel border border-main text-xs flex items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-2.5 text-muted-custom font-mono-custom">
          <span className="text-base">⏳</span>
          <span>No expiration timestamp (<code className="text-primary-color font-bold">exp</code>) found in token claims.</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-main">
          Indefinite Lifespan
        </span>
      </div>
    );
  }

  // Calculate remaining time
  const remainingSeconds = exp ? exp - simulatedNow : 0;
  const isExpired = exp ? remainingSeconds <= 0 : false;
  const isNotYetValid = nbf ? simulatedNow < nbf : false;
  const isExpiringSoon = !isExpired && remainingSeconds > 0 && remainingSeconds < 300; // < 5 mins

  // Calculate percentage elapsed
  let percentElapsed = 100;
  if (exp && iat && exp > iat) {
    const totalDuration = exp - iat;
    const elapsed = simulatedNow - iat;
    percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  } else if (exp) {
    percentElapsed = isExpired ? 100 : 50;
  }

  // Format seconds into digital clock string
  const formatCountdown = (secs) => {
    const absSecs = Math.abs(secs);
    const days = Math.floor(absSecs / 86400);
    const hours = Math.floor((absSecs % 86400) / 3600);
    const minutes = Math.floor((absSecs % 3600) / 60);
    const seconds = absSecs % 60;

    const pad = (n) => String(n).padStart(2, "0");
    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-main glow-card space-y-4 animate-fade-up bg-white/90 shadow-xs">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-main pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl badge-indigo-outline flex items-center justify-center text-primary-color font-bold shadow-xs">
            ⏱️
          </div>
          <div>
            <h3 className="font-display-custom font-bold text-sm text-main tracking-tight">
              Token Lifecycle & Session Monitor
            </h3>
            <span className="text-[10px] text-muted-custom font-mono-custom">
              Real-time temporal validity and expiration clock
            </span>
          </div>
        </div>

        {/* Dynamic Status Pill */}
        <div className="flex items-center gap-2">
          {isNotYetValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono-custom bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Not Yet Valid (NBF)
            </span>
          ) : isExpired ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono-custom bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Expired
            </span>
          ) : isExpiringSoon ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono-custom bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Expiring Soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono-custom bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active & Valid
            </span>
          )}

          {/* Desktop Alert Toggle */}
          <button
            onClick={handleToggleAlert}
            title={alertEnabled ? "Alerts enabled" : "Enable desktop & chime alerts upon expiration"}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${alertEnabled
                ? "bg-indigo-50 border-indigo-300 text-primary-color"
                : "border-main hover:bg-slate-100 text-muted-custom"
              }`}
          >
            <span className="text-xs">{alertEnabled ? "🔔" : "🔕"}</span>
          </button>
        </div>
      </div>

      {/* Countdown Digital Timer Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-50/80 border border-main">
          <span className="text-[10px] text-muted-custom uppercase tracking-wider font-mono-custom block">
            Issued At (iat)
          </span>
          <span className="text-xs font-bold text-main font-mono-custom block mt-0.5">
            {iat ? new Date(iat * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "None specified"}
          </span>
        </div>

        <div className={`p-3 rounded-xl border ${isExpired ? "bg-rose-50/70 border-rose-200" : "bg-indigo-50/70 border-indigo-200"}`}>
          <span className={`text-[10px] uppercase tracking-wider font-mono-custom block font-bold ${isExpired ? "text-rose-600" : "text-primary-color"}`}>
            {isExpired ? "Expired Elapsed" : "Time Remaining"}
          </span>
          <span className={`text-sm sm:text-base font-extrabold font-mono-custom block mt-0.5 tracking-tight ${isExpired ? "text-rose-700" : "text-indigo-900"}`}>
            {exp ? (isExpired ? `+${formatCountdown(remainingSeconds)} ago` : formatCountdown(remainingSeconds)) : "∞ Indefinite"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 border border-main">
          <span className="text-[10px] text-muted-custom uppercase tracking-wider font-mono-custom block">
            Expires At (exp)
          </span>
          <span className="text-xs font-bold text-main font-mono-custom block mt-0.5">
            {exp ? new Date(exp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Never"}
          </span>
        </div>
      </div>

      {/* Visual Elapsed Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono-custom text-muted-custom">
          <span>Session Lifetime Progress</span>
          <span className="font-bold text-main">{Math.round(percentElapsed)}% Elapsed</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-main relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isExpired
                ? "bg-rose-500"
                : isExpiringSoon
                  ? "bg-gradient-to-r from-amber-400 to-rose-500"
                  : "bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600"
              }`}
            style={{ width: `${percentElapsed}%` }}
          />
        </div>
      </div>

      {/* Interactive Clock Skew Simulation Slider */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-custom font-mono-custom">
          <span>Clock Skew Simulation:</span>
          <span className="font-bold text-main">
            {clockSkew === 0 ? "0s (Real-time)" : clockSkew > 0 ? `+${clockSkew}s` : `${clockSkew}s`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[-120, -60, 0, 60, 120, 300].map((s) => (
            <button
              key={s}
              onClick={() => setClockSkew(s)}
              className={`px-2 py-1 rounded text-[10px] font-mono-custom font-bold cursor-pointer transition-all ${clockSkew === s
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
            >
              {s === 0 ? "Reset" : s > 0 ? `+${s}s` : `${s}s`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
