import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";

export default function Login() {
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [error, setError]   = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient flex-col justify-between p-12">
        <img
          src="https://wibiz.ai/wp-content/uploads/2026/01/logo.png"
          alt="Wibiz"
          className="h-10 w-auto object-contain brightness-0 invert"
        />
        <div>
          <h2 className="text-white text-3xl font-bold leading-snug mb-4">
            Your partner portal.<br />Built for growth.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Track commissions, manage your team, monitor leads, and grow your Scale360 business — all in one place.
          </p>
        </div>
        <p className="text-white/40 text-xs">© {new Date().getFullYear()} Wibiz. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img
              src="https://wibiz.ai/wp-content/uploads/2026/01/logo.png"
              alt="Wibiz"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-navy-500">
                {isAdmin ? "Admin Sign In" : "Welcome back"}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {isAdmin ? "Partner Portal Administration" : "Sign in to your agent account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent transition"
                  placeholder="your.username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-gradient text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition mt-1"
              >
                {isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <button
            onClick={() => { setIsAdmin((v) => !v); setError(""); setForm({ username: "", password: "" }); }}
            className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600 text-center transition"
          >
            {isAdmin ? "← Back to agent login" : "Admin login"}
          </button>
        </div>
      </div>
    </div>
  );
}
