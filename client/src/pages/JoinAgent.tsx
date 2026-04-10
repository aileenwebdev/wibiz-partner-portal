/**
 * JoinAgent.tsx
 * Self-registration page. URL: /join-agent?ref=BC-XXX&level=Associate
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Application Submitted</h2>
          <p className="text-gray-600 text-sm">
            Your application has been received. You'll hear from us shortly with next steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-xl font-semibold mb-1">Join the Wibiz Partner Network</h1>
          {ref && (
            <p className="text-sm text-gray-500 mb-6">
              Referred by: <span className="font-mono text-orange-600">{ref}</span>
              {level && ` · Applying as ${level}`}
            </p>
          )}

          {/* Commission grid teaser */}
          <div className="mb-6 bg-orange-50 rounded-md p-4">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Scale360 Commission Rates</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {COMMISSION_SUMMARY.map((row) => (
                <div key={row.level} className="bg-white rounded p-2 border">
                  <div className="font-semibold text-gray-700">{row.level}</div>
                  <div className="text-orange-600 font-bold text-sm">{row.setup}</div>
                  <div className="text-gray-400">setup + monthly</div>
                </div>
              ))}
            </div>
          </div>

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
            <Field label="Email"         type="email" value={form.email}        onChange={(v) => setForm((f) => ({ ...f, email: v }))}        required />
            <Field label="Phone"         type="tel"   value={form.phone}        onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <Field label="Business Name"             value={form.businessName}  onChange={(v) => setForm((f) => ({ ...f, businessName: v }))} />

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreementAccepted}
                onChange={(e) => setForm((f) => ({ ...f, agreementAccepted: e.target.checked }))}
                className="mt-0.5"
                required
              />
              <span className="text-xs text-gray-600">
                I agree to the Wibiz Partner Agreement and understand the commission structure outlined above.
              </span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submit.isPending || !form.agreementAccepted}
              className="w-full bg-orange-500 text-white py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {submit.isPending ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required = false
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        required={required}
      />
    </div>
  );
}
