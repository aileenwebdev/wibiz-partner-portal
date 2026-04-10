/**
 * RepDashboard.tsx
 * Main agent portal — leads, team, commissions, certification, invite.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { COMMISSION_SUMMARY } from "../../../server/lib/commission";

type Tab = "overview" | "leads" | "team" | "commissions" | "certification" | "invite";

export default function RepDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  const { data: me, isLoading } = trpc.rep.me.useQuery(undefined, {
    onError: () => navigate("/login"),
  });
  const logout = trpc.rep.logout.useMutation({ onSuccess: () => navigate("/login") });

  if (isLoading) return <div className="flex items-center justify-center h-screen text-sm text-gray-400">Loading…</div>;
  if (!me) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview",     label: "Overview" },
    { id: "leads",        label: "My Leads" },
    { id: "team",         label: "My Team" },
    { id: "commissions",  label: "Commissions" },
    { id: "certification",label: "Certification" },
    { id: "invite",       label: "Invite" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div>
          <span className="font-semibold text-gray-900">Wibiz Partner Portal</span>
          <span className="ml-3 text-xs text-orange-600 font-mono bg-orange-50 px-2 py-0.5 rounded">
            {me.repCode}
          </span>
          <span className="ml-2 text-xs text-gray-400">{me.agentLevel}</span>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {tab === "overview"     && <OverviewTab me={me} />}
        {tab === "leads"        && <LeadsTab />}
        {tab === "team"         && <TeamTab repCode={me.repCode} />}
        {tab === "commissions"  && <CommissionsTab />}
        {tab === "certification"&& <CertificationTab />}
        {tab === "invite"       && <InviteTab repCode={me.repCode} />}
      </main>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ me }: { me: { repCode: string; agentLevel: string; email: string; legalFullName?: string | null } }) {
  const { data: summary } = trpc.commission.mySummary.useQuery();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Commissions" value={`$${(summary?.total ?? 0).toFixed(2)}`} />
        <StatCard label="Pending"           value={`$${(summary?.pending ?? 0).toFixed(2)}`} />
        <StatCard label="Paid"              value={`$${(summary?.paid ?? 0).toFixed(2)}`} />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-medium text-gray-900 mb-4">Your Commission Rates</h3>
        <div className="grid grid-cols-3 gap-3">
          {COMMISSION_SUMMARY.map((row) => (
            <div
              key={row.level}
              className={`rounded-md p-4 border text-center ${
                me.agentLevel === row.level ? "border-orange-300 bg-orange-50" : "border-gray-100"
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">{row.level}</div>
              <div className="text-2xl font-bold text-orange-600">{row.setup}</div>
              <div className="text-xs text-gray-400">setup + monthly</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────

function LeadsTab() {
  // Leads are managed via GHL — show attribution status for agent context
  return (
    <div className="bg-white rounded-lg border p-6">
      <p className="text-sm text-gray-500">
        Your leads are managed in GHL. Attribution is tracked automatically via your referral link.
      </p>
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamTab({ repCode }: { repCode: string }) {
  const { data: downline, isLoading } = trpc.rep.downline.useQuery({ repCode });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900">Direct Downline</h3>
      </div>
      {!downline?.length ? (
        <p className="p-6 text-sm text-gray-400">No downline agents yet. Share your invite link to recruit.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Rep Code</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Name</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Level</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {downline.map((rep) => (
              <tr key={rep.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-orange-600">{rep.repCode}</td>
                <td className="px-4 py-3 text-gray-700">{rep.legalFullName ?? rep.email}</td>
                <td className="px-4 py-3 text-gray-500">{rep.agentLevel}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${rep.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {rep.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Commissions ──────────────────────────────────────────────────────────────

function CommissionsTab() {
  const { data: commissions, isLoading } = trpc.commission.mine.useQuery();

  if (isLoading) return <LoadingCard />;

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900">Commission History</h3>
      </div>
      {!commissions?.length ? (
        <p className="p-6 text-sm text-gray-400">No commissions yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Date</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Type</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Amount</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Rate</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-gray-700 capitalize">{c.type}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">${parseFloat(c.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">{(parseFloat(c.rate) * 100).toFixed(0)}%</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status ?? "pending"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Certification ────────────────────────────────────────────────────────────

function CertificationTab() {
  const { data: status } = trpc.certification.myStatus.useQuery();
  const { data: questions } = trpc.certification.getQuiz.useQuery(undefined, {
    enabled: !status?.certified,
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult]   = useState<{ passed: boolean; score: number; total: number } | null>(null);

  const submit = trpc.certification.submitQuiz.useMutation({
    onSuccess: (data) => setResult(data),
  });

  const activate = trpc.certification.activateKickstart.useMutation();

  if (status?.certified) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h3 className="font-semibold text-gray-900">Scale360 Certified</h3>
            <p className="text-sm text-gray-500">
              Passed on {status.passedAt ? new Date(status.passedAt).toLocaleDateString() : "—"} · Score: {status.score}/10
            </p>
          </div>
        </div>
        <button
          onClick={() => activate.mutate()}
          disabled={activate.isPending}
          className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {activate.isPending ? "Activating…" : "Activate Kickstart Access"}
        </button>
        {activate.isSuccess && <p className="text-sm text-green-600">Kickstart account provisioned successfully.</p>}
        {activate.isError   && <p className="text-sm text-red-600">{activate.error.message}</p>}
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <div className="text-4xl mb-3">{result.passed ? "🎉" : "📝"}</div>
        <h3 className="font-semibold text-lg mb-1">
          {result.passed ? "You passed!" : "Not quite — try again"}
        </h3>
        <p className="text-gray-500 text-sm">
          Score: {result.score}/{result.total} · {Math.round((result.score / result.total) * 100)}%
          {!result.passed && " (80% required to pass)"}
        </p>
        {!result.passed && (
          <button
            onClick={() => { setResult(null); setAnswers({}); }}
            className="mt-4 text-sm text-orange-600 hover:underline"
          >
            Retake quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Scale360 Certification Quiz</h3>
        <p className="text-sm text-gray-500">10 questions · 80% to pass</p>
      </div>

      {questions?.map((q) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-medium text-gray-800">{q.id}. {q.question}</p>
          <div className="space-y-1">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={i}
                  checked={answers[String(q.id)] === i}
                  onChange={() => setAnswers((a) => ({ ...a, [String(q.id)]: i }))}
                  className="text-orange-500"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => submit.mutate({ answers })}
        disabled={submit.isPending || Object.keys(answers).length < (questions?.length ?? 10)}
        className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
      >
        {submit.isPending ? "Submitting…" : "Submit Quiz"}
      </button>
    </div>
  );
}

// ─── Invite ───────────────────────────────────────────────────────────────────

function InviteTab({ repCode }: { repCode: string }) {
  const associateLink = `${window.location.origin}/join-agent?ref=${repCode}&level=Associate`;
  const agencyLink    = `${window.location.origin}/join-agent?ref=${repCode}&level=Agency`;

  return (
    <div className="space-y-4">
      <InviteLinkCard label="Invite an Associate" url={associateLink} />
      <InviteLinkCard label="Invite an Agency"    url={agencyLink} />
      <div className="bg-white rounded-lg border p-4">
        <p className="text-xs text-gray-500">
          Your Scale360 referral link: <span className="font-mono text-orange-600">https://scale360.wibiz.ai/?ref={repCode}</span>
        </p>
      </div>
    </div>
  );
}

function InviteLinkCard({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 font-mono truncate max-w-sm">{url}</p>
      </div>
      <button
        onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-md hover:bg-orange-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    paid:     "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-lg border p-6 text-center text-sm text-gray-400">Loading…</div>
  );
}
