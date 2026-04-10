import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";

export default function Login() {
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Wibiz Partner Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? "Sign in as administrator" : "Sign in to your agent account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-500 text-white py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => { setIsAdmin((v) => !v); setError(""); setForm({ username: "", password: "" }); }}
          className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600 text-center"
        >
          {isAdmin ? "← Back to agent login" : "Admin login"}
        </button>
      </div>
    </div>
  );
}
