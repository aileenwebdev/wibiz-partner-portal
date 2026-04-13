import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";

// ─── SVG icons (inline, no dependency) ────────────────────────────────────────

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function IconEye({ off }: { off?: boolean }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconError() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

// ─── Network decoration (decorative SVG for left panel) ───────────────────────

function NetworkDecoration() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8900" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF8900" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Connecting lines */}
      <line x1="120" y1="180" x2="280" y2="320" stroke="#FF8900" strokeWidth="1" />
      <line x1="280" y1="320" x2="420" y2="240" stroke="#FF8900" strokeWidth="1" />
      <line x1="420" y1="240" x2="540" y2="380" stroke="#FF8900" strokeWidth="1" />
      <line x1="80"  y1="400" x2="280" y2="320" stroke="#FF8900" strokeWidth="1" />
      <line x1="280" y1="320" x2="360" y2="480" stroke="#FF8900" strokeWidth="1" />
      <line x1="180" y1="80"  x2="120" y2="180" stroke="#FF8900" strokeWidth="1" />
      <line x1="380" y1="100" x2="420" y2="240" stroke="#FF8900" strokeWidth="1" />
      {/* Nodes */}
      {[
        [120,180,5],[280,320,8],[420,240,5],[540,380,4],
        [80,400,4],[360,480,5],[180,80,4],[380,100,5],
      ].map(([cx,cy,r],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.15)" />
      ))}
    </svg>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ username: "", password: "" });
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isAdmin, setIsAdmin]   = useState(false);

  const agentLogin = trpc.rep.login.useMutation({
    onSuccess: () => navigate("/dashboard"),
    onError:   (err) => setError(err.message),
  });
  const adminLogin = trpc.rep.adminLogin.useMutation({
    onSuccess: () => navigate("/admin"),
    onError:   (err) => setError(err.message),
  });

  const isPending = agentLogin.isPending || adminLogin.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (isAdmin) adminLogin.mutate(form);
    else         agentLogin.mutate(form);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0d1c28] font-dm">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col bg-[#15283A] px-14 py-12 overflow-hidden">

        {/* Radial glow overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute" style={{
            top: 0, right: 0, width: "60%", height: "50%",
            background: "radial-gradient(circle at 80% 20%, rgba(255,137,0,0.08) 0%, transparent 60%)",
          }} />
          <div className="absolute" style={{
            bottom: 0, left: 0, width: "50%", height: "50%",
            background: "radial-gradient(circle at 20% 80%, rgba(255,137,0,0.05) 0%, transparent 50%)",
          }} />
        </div>

        {/* Network decoration */}
        <NetworkDecoration />

        {/* Logo */}
        <div className="relative z-10 mb-auto animate-[fadeUp_0.5s_ease_both]">
          <img src="/images/wibiz-white.png" alt="Wibiz" className="h-[44px] w-auto object-contain" />
        </div>

        {/* Hero copy */}
        <div className="relative z-10 my-auto animate-[fadeUp_0.5s_0.1s_ease_both]">
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-amber mb-4">
            Partner Portal
          </p>
          <h1 className="font-sora text-[40px] font-extrabold text-white leading-[1.15] tracking-[-1px] mb-5">
            Grow your<br />
            <span className="text-amber">Scale360</span><br />
            business.
          </h1>
          <p className="text-[15px] font-light text-white/50 leading-[1.7] max-w-[380px]">
            Track commissions, manage your downline, monitor leads, and close deals — all in one place.
          </p>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-auto animate-[fadeUp_0.5s_0.2s_ease_both]">
          {[
            { val: "$0",  accent: true,  label: "Total commissions" },
            { val: "0",   accent: false, label: "Leads attributed" },
            { val: "0",   accent: false, label: "Team members" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/[0.08] rounded-xl p-4">
              <div className="font-sora text-[22px] font-bold text-white leading-none mb-1">
                {s.accent ? <><span className="text-amber">{s.val[0]}</span>{s.val.slice(1)}</> : s.val}
              </div>
              <div className="text-[11px] text-white/40 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center bg-surface px-8 py-12 lg:px-10">
        <div className="w-full max-w-[420px] animate-[fadeUp_0.5s_0.15s_ease_both]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img src="/images/wibiz-colored.png" alt="Wibiz" className="h-9 w-auto object-contain" />
          </div>

          {/* Header */}
          <div className="mb-8">
            {/* Live badge */}
            <div className="inline-flex items-center gap-1.5 bg-amber/10 border border-amber/25 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.5px] uppercase text-amber">
                {isAdmin ? "Admin Access" : "Agent Portal Live"}
              </span>
            </div>

            <h1 className="font-sora text-[26px] font-bold text-navy leading-tight tracking-[-0.5px] mb-1.5">
              {isAdmin ? "Admin sign in" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted">
              {isAdmin ? "Partner Portal Administration" : "Sign in to your agent account"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-[8px] px-3.5 py-2.5 mb-5">
              <span className="text-red-500 shrink-0"><IconError /></span>
              <p className="text-[13px] text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-[18px]">

            {/* Username */}
            <div>
              <label className="block text-[12px] font-semibold text-navy tracking-[0.2px] mb-[7px]">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="your.username"
                required
                className="w-full h-[46px] bg-white border-[1.5px] border-border rounded-[10px] px-4 text-[14px] text-navy placeholder-[#C0CDD8] outline-none transition-[border-color,box-shadow] duration-150 focus:border-amber focus:shadow-[0_0_0_3px_rgba(255,137,0,0.12)]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-navy tracking-[0.2px] mb-[7px]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full h-[46px] bg-white border-[1.5px] border-border rounded-[10px] pl-4 pr-11 text-[14px] text-navy placeholder-[#C0CDD8] outline-none transition-[border-color,box-shadow] duration-150 focus:border-amber focus:shadow-[0_0_0_3px_rgba(255,137,0,0.12)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-navy transition p-1"
                >
                  <IconEye off={showPass} />
                </button>
              </div>
            </div>

            {/* Row: remember + forgot */}
            <div className="flex items-center justify-between -mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-amber rounded" />
                <span className="text-[13px] text-muted">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => { setIsAdmin((v) => !v); setError(""); setForm({ username: "", password: "" }); }}
                className="text-[13px] font-medium text-amber hover:opacity-75 transition"
              >
                {isAdmin ? "← Agent login" : "Admin login"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-[48px] bg-navy hover:bg-navy-light text-white rounded-[10px] font-sora text-[14px] font-semibold tracking-[0.3px] flex items-center justify-center gap-2 transition-[background,transform] duration-150 active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isPending ? (
                <><IconSpinner /> Signing in…</>
              ) : (
                <>Sign In to Portal <IconArrow /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-7 text-[12px] text-muted leading-relaxed">
            By signing in you agree to our{" "}
            <a href="#" className="text-amber font-medium hover:opacity-75">Terms</a>
            {" & "}
            <a href="#" className="text-amber font-medium hover:opacity-75">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Keyframe animations via global style tag */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
