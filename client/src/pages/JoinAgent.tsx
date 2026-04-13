/**
 * JoinAgent.tsx
 * Self-registration page. URL: /join-agent?ref=WBZ-XXX&level=Associate
 * ref and level are both optional — agent can register directly.
 */

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { COMMISSION_SUMMARY } from "../lib/constants";

export default function JoinAgent() {
  const [params] = useSearchParams();
  const ref   = params.get("ref") ?? "";
  const level = (params.get("level") ?? "Associate") as "Associate" | "Senior Associate" | "Agency";

  const [form, setForm] = useState({
    firstName:         "",
    lastName:          "",
    email:             "",
    phone:             "",
    businessName:      "",
    agreementAccepted: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState("");

  const submit = trpc.agentSelfReg.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError:   (err) => setError(err.message),
  });

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-navy-500 mb-2">Application Submitted!</h2>
          <p className="text-gray-400 text-sm">
            Your application has been received. Our team will review it and send your login credentials shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-gradient">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <img
            src="https://wibiz.ai/wp-content/uploads/2026/01/logo.png"
            alt="Wibiz"
            className="h-7 w-auto object-contain brightness-0 invert"
          />
          {ref && (
            <span className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full font-mono">
              Referred by {ref}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Commission teaser — sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-navy-500 text-sm mb-1">Partner Commission Rates</h3>
              <p className="text-xs text-gray-400 mb-4">Earn on every Wibiz client you bring in.</p>
              <div className="space-y-2">
                {COMMISSION_SUMMARY.map((row) => (
                  <div
                    key={row.level}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 border text-sm
                      ${row.level === level ? "bg-brand-gradient text-white border-transparent" : "border-gray-100 bg-gray-50"}`}
                  >
                    <span className={`text-xs font-medium ${row.level === level ? "text-white/80" : "text-gray-500"}`}>
                      {row.level}
                    </span>
                    <span className={`font-bold ${row.level === level ? "text-white" : "text-orange-500"}`}>
                      {row.setup}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy-50 border border-navy-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-navy-500 mb-1">Applying as</p>
              <p className="text-sm font-bold text-navy-500">{level}</p>
              <p className="text-xs text-navy-400 mt-1">Rep code will be auto-assigned after approval.</p>
            </div>
          </div>

          {/* Registration form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h1 className="text-xl font-bold text-navy-500 mb-1">Join the Wibiz Partner Network</h1>
              <p className="text-sm text-gray-400 mb-6">Fill in your details below. Approval is typically within 24 hours.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError("");
                  submit.mutate({
                    ...form,
                    referredByRepCode: ref || undefined,
                    requestedLevel:    level,
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" value={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} required />
                  <Field label="Last Name"  value={form.lastName}  onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}  required />
                </div>
                <Field label="Email"         type="email" value={form.email}       onChange={(v) => setForm((f) => ({ ...f, email: v }))}       required />
                <Field label="Phone"         type="tel"   value={form.phone}       onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                <Field label="Business Name"             value={form.businessName} onChange={(v) => setForm((f) => ({ ...f, businessName: v }))} />

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.agreementAccepted}
                    onChange={(e) => setForm((f) => ({ ...f, agreementAccepted: e.target.checked }))}
                    className="mt-0.5 accent-navy-500"
                    required
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I agree to the Wibiz Partner Agreement and understand the commission structure outlined.
                  </span>
                </label>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submit.isPending || !form.agreementAccepted}
                  className="w-full bg-brand-gradient text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {submit.isPending ? "Submitting…" : "Submit Application"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent transition"
        required={required}
      />
    </div>
  );
}
