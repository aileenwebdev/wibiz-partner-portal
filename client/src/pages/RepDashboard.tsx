/**
 * RepDashboard.tsx — Agent portal with Wibiz branding
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { COMMISSION_SUMMARY } from "../lib/constants";
import { Menu, X, LogOut, Users, DollarSign, Award, Link2, BarChart2 } from "lucide-react";

type Tab = "overview" | "leads" | "team" | "commissions" | "certification" | "invite";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",      label: "Overview",      icon: <BarChart2 size={15} /> },
  { id: "leads",         label: "My Leads",      icon: <Users size={15} /> },
  { id: "team",          label: "My Team",        icon: <Users size={15} /> },
  { id: "commissions",   label: "Commissions",    icon: <DollarSign size={15} /> },
  { id: "certification", label: "Certification",  icon: <Award size={15} /> },
  { id: "invite",        label: "Invite",         icon: <Link2 size={15} /> },
];

export default function RepDashboard() {
  const navigate  = useNavigate();
  const [tab, setTab]     = useState<Tab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: me, isLoading } = trpc.rep.me.useQuery(undefined, {
    onError: () => navigate("/login"),
  });
  const logout = trpc.rep.logout.useMutation({ onSuccess: () => navigate("/login") });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-6 h-6 border-2 border-navy-200 border-t-navy-500 rounded-full animate-spin" />
    </div>
  );
  if (!me) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="bg-brand-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://wibiz.ai/wp-content/uploads/2026/01/logo.png"
              alt="Wibiz"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
            <div className="hidden sm:block h-5 w-px bg-white/20" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs bg-white/15 font-mono px-2.5 py-1 rounded-full font-semibold tracking-wide">
                {me.repCode}
              </span>
              <span className="text-xs text-white/60">{me.agentLevel}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-white/80">{me.legalFullName ?? me.email}</span>
            <button
              onClick={() => logout.mutate()}
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition"
            >
              <LogOut size={14} />
              Sign out
            </button>
            <button onClick={() => setMenuOpen((v) => !v)} className="sm:hidden text-white/80 hover:text-white">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/10 px-4 pb-3 space-y-1">
            <div className="py-2 text-xs text-white/50">
              {me.repCode} · {me.agentLevel}
            </div>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition
                  ${tab === t.id ? "bg-white/15 text-white font-semibold" : "text-white/70 hover:text-white hover:bg-white/10"}`}
              >
                {t.icon}{t.label}
              </button>
            ))}
            <button
              onClick={() => logout.mutate()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white mt-2"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </header>

      {/* Tab bar — desktop */}
      <div className="hidden sm:block bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${tab === t.id
                    ? "border-orange-500 text-navy-500"
                    : "border-transparent text-gray-400 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
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
      {/* Welcome */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Welcome back</p>
        <h2 className="text-xl font-bold text-navy-500">{me.legalFullName ?? me.email}</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-mono text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2.5 py-1 rounded-md font-semibold">
            {me.repCode}
          </span>
          <span className="text-xs bg-navy-50 text-navy-500 border border-navy-100 px-2.5 py-1 rounded-md font-medium">
            {me.agentLevel}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Commissions" value={`$${(summary?.total ?? 0).toFixed(2)}`}   color="navy" />
        <StatCard label="Pending"           value={`$${(summary?.pending ?? 0).toFixed(2)}`} color="amber" />
        <StatCard label="Paid Out"          value={`$${(summary?.paid ?? 0).toFixed(2)}`}    color="green" />
      </div>

      {/* Commission rates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-navy-500 text-sm mb-4">Your Commission Rates</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {COMMISSION_SUMMARY.map((row) => (
            <div
              key={row.level}
              className={`rounded-xl p-3 border text-center transition
                ${me.agentLevel === row.level
                  ? "border-orange-300 bg-brand-gradient text-white shadow-md"
                  : "border-gray-100 bg-gray-50"}`}
            >
              <div className={`text-xs mb-1 ${me.agentLevel === row.level ? "text-white/70" : "text-gray-400"}`}>
                {row.level}
              </div>
              <div className={`text-xl font-bold ${me.agentLevel === row.level ? "text-white" : "text-orange-500"}`}>
                {row.setup}
              </div>
              <div className={`text-xs ${me.agentLevel === row.level ? "text-white/60" : "text-gray-400"}`}>
                setup
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────

function LeadsTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="w-12 h-12 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <Users size={22} className="text-navy-400" />
      </div>
      <h3 className="font-semibold text-navy-500 mb-1">Leads are tracked via GHL</h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        Attribution is captured automatically through your referral link. View your pipeline directly in GHL.
      </p>
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamTab({ repCode }: { repCode: string }) {
  const { data: downline, isLoading } = trpc.rep.downline.useQuery({ repCode });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="font-bold text-navy-500">Direct Downline</h3>
      </div>
      {!downline?.length ? (
        <div className="p-8 text-center text-sm text-gray-400">
          No downline yet. Share your invite link to recruit.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Rep Code", "Name", "Level", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {downline.map((rep) => (
                <tr key={rep.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-md font-semibold">{rep.repCode}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{rep.legalFullName ?? rep.email}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{rep.agentLevel}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rep.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {rep.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Commissions ──────────────────────────────────────────────────────────────

function CommissionsTab() {
  const { data: commissions, isLoading } = trpc.commission.mine.useQuery();

  if (isLoading) return <LoadingCard />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="font-bold text-navy-500">Commission History</h3>
      </div>
      {!commissions?.length ? (
        <div className="p-8 text-center text-sm text-gray-400">No commissions yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Date", "Type", "Amount", "Rate", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3 text-gray-700 capitalize">{c.type}</td>
                  <td className="px-5 py-3 font-bold text-navy-500">${parseFloat(c.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-gray-400">{(parseFloat(c.rate) * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status ?? "pending"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Certification ────────────────────────────────────────────────────────────

function CertificationTab() {
  const { data: status }    = trpc.certification.myStatus.useQuery();
  const { data: questions } = trpc.certification.getQuiz.useQuery(undefined, { enabled: !status?.certified });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult]   = useState<{ passed: boolean; score: number; total: number } | null>(null);

  const submit   = trpc.certification.submitQuiz.useMutation({ onSuccess: (data) => setResult(data) });
  const activate = trpc.certification.activateKickstart.useMutation();

  if (status?.certified) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-gradient rounded-full flex items-center justify-center shrink-0">
            <Award size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-navy-500 text-lg">Scale360 Certified</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Passed {status.passedAt ? new Date(status.passedAt).toLocaleDateString() : ""} · Score: {status.score}/10
            </p>
          </div>
        </div>
        <button
          onClick={() => activate.mutate()}
          disabled={activate.isPending}
          className="bg-brand-gradient text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {activate.isPending ? "Activating…" : "Activate Kickstart Access"}
        </button>
        {activate.isSuccess && <p className="text-sm text-green-600">Kickstart account provisioned successfully.</p>}
        {activate.isError   && <p className="text-sm text-red-500">{activate.error.message}</p>}
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? "bg-green-100" : "bg-orange-50"}`}>
          <span className="text-2xl">{result.passed ? "🎉" : "📝"}</span>
        </div>
        <h3 className="font-bold text-navy-500 text-xl mb-1">{result.passed ? "You passed!" : "Not quite yet"}</h3>
        <p className="text-gray-400 text-sm">
          Score: {result.score}/{result.total} · {Math.round((result.score / result.total) * 100)}%
          {!result.passed && " (80% required)"}
        </p>
        {!result.passed && (
          <button onClick={() => { setResult(null); setAnswers({}); }}
            className="mt-5 text-sm font-semibold text-orange-500 hover:text-orange-600 underline">
            Retake quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div>
        <h3 className="font-bold text-navy-500 text-lg">Scale360 Certification Quiz</h3>
        <p className="text-sm text-gray-400 mt-0.5">10 questions · 80% to pass</p>
      </div>
      {questions?.map((q) => (
        <div key={q.id} className="space-y-2 pb-4 border-b border-gray-50 last:border-0">
          <p className="text-sm font-semibold text-gray-800">{q.id}. {q.question}</p>
          <div className="space-y-2 pl-1">
            {q.options.map((opt, i) => (
              <label key={i} className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-lg transition ${answers[String(q.id)] === i ? "bg-navy-50" : "hover:bg-gray-50"}`}>
                <input type="radio" name={`q${q.id}`} value={i}
                  checked={answers[String(q.id)] === i}
                  onChange={() => setAnswers((a) => ({ ...a, [String(q.id)]: i }))}
                  className="accent-navy-500" />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => submit.mutate({ answers })}
        disabled={submit.isPending || Object.keys(answers).length < (questions?.length ?? 10)}
        className="bg-brand-gradient text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
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
      <InviteLinkCard label="Invite an Associate" description="Share with new recruits at the Associate level" url={associateLink} />
      <InviteLinkCard label="Invite an Agency"    description="Share with agents ready for the Agency level" url={agencyLink} />
      <div className="bg-navy-50 border border-navy-100 rounded-2xl p-5">
        <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-2">Your Scale360 Referral Link</p>
        <p className="font-mono text-sm text-navy-500 break-all">https://scale360.wibiz.ai/?ref={repCode}</p>
      </div>
    </div>
  );
}

function InviteLinkCard({ label, description, url }: { label: string; description: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy-500">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        <p className="text-xs text-gray-300 font-mono truncate mt-1">{url}</p>
      </div>
      <button
        onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-lg border transition
          ${copied ? "bg-green-50 text-green-700 border-green-200" : "bg-brand-gradient text-white border-transparent hover:opacity-90"}`}
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color: "navy" | "amber" | "green" }) {
  const styles = {
    navy:  "bg-navy-500 text-white",
    amber: "bg-brand-gradient text-white",
    green: "bg-green-600 text-white",
  };
  return (
    <div className={`rounded-2xl p-5 shadow-sm ${styles[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-orange-50 text-orange-600 border-orange-200",
    approved: "bg-blue-50 text-blue-700 border-blue-200",
    paid:     "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize border font-medium ${map[status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
      {status}
    </span>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-navy-200 border-t-navy-500 rounded-full animate-spin" />
    </div>
  );
}
