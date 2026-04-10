/**
 * AdminDashboard.tsx — Modern CRM-style admin portal
 */

import { useState } from "react";
import { trpc } from "../lib/trpc";
import {
  Users, FileText, TrendingUp, DollarSign, Activity,
  ShieldCheck, Menu, X, LogOut, Target, ChevronRight,
} from "lucide-react";

type Tab = "agents" | "attribution" | "webhooks" | "commissions" | "registrations" | "upgrades" | "verifications";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "agents",        label: "Agents",          icon: <Users size={16} /> },
  { id: "registrations", label: "Registrations",   icon: <FileText size={16} /> },
  { id: "upgrades",      label: "Upgrades",         icon: <TrendingUp size={16} /> },
  { id: "commissions",   label: "Commissions",      icon: <DollarSign size={16} /> },
  { id: "attribution",   label: "Attribution",      icon: <Target size={16} /> },
  { id: "webhooks",      label: "Webhook Logs",     icon: <Activity size={16} /> },
  { id: "verifications", label: "ID Verification",  icon: <ShieldCheck size={16} /> },
];

export default function AdminDashboard() {
  const [tab, setTab]         = useState<Tab>("agents");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = NAV.find((n) => n.id === tab);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ── */}
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col
        bg-navy-500 text-white transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <img
            src="https://wibiz.ai/wp-content/uploads/2026/01/logo.png"
            alt="Wibiz"
            className="h-7 w-auto object-contain brightness-0 invert"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Administration</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors text-left
                ${tab === item.id
                  ? "bg-white/10 text-white border-r-2 border-orange-500"
                  : "text-white/60 hover:text-white hover:bg-white/5"}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">A</div>
            <span>Admin</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-semibold">{active?.label}</span>
            </div>
          </div>
          <a
            href="/login"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            <LogOut size={14} />
            Sign out
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {tab === "agents"        && <AgentsTab />}
          {tab === "registrations" && <RegistrationsTab />}
          {tab === "upgrades"      && <UpgradesTab />}
          {tab === "commissions"   && <CommissionsTab />}
          {tab === "attribution"   && <AttributionTab />}
          {tab === "webhooks"      && <WebhooksTab />}
          {tab === "verifications" && <VerificationsTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Agents ───────────────────────────────────────────────────────────────────

function AgentsTab() {
  const { data: agents, isLoading, refetch } = trpc.rep.list.useQuery({ limit: 200 });
  const [showForm, setShowForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ email: "", legalFullName: "", agentLevel: "Associate", uplineRepCode: "" });
  const [created, setCreated]   = useState<{ repCode: string; username: string; tempPassword: string } | null>(null);

  const createRep = trpc.rep.create.useMutation({
    onSuccess: (rep) => {
      setCreated({ repCode: rep.repCode, username: rep.username ?? rep.email, tempPassword: rep.tempPasswordPlain ?? "(see DB)" });
      setShowForm(false);
      setNewAgent({ email: "", legalFullName: "", agentLevel: "Associate", uplineRepCode: "" });
      refetch();
    },
  });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader title="Agents" count={agents?.length} action={
        !showForm && (
          <GradientButton onClick={() => setShowForm(true)}>+ New Agent</GradientButton>
        )
      } />

      {/* Credentials banner */}
      {created && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-green-800 mb-2">Agent created — share these credentials:</p>
          <div className="grid grid-cols-3 gap-3">
            <CredField label="Rep Code"      value={created.repCode} />
            <CredField label="Username"      value={created.username} />
            <CredField label="Temp Password" value={created.tempPassword} />
          </div>
          <p className="text-green-600 text-xs mt-3">Agent should change their password on first login.</p>
          <button onClick={() => setCreated(null)} className="mt-2 text-xs text-green-500 underline hover:text-green-700">Dismiss</button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">New Agent</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email *">
              <input type="email" value={newAgent.email}
                onChange={(e) => setNewAgent((f) => ({ ...f, email: e.target.value }))}
                className={inputCls} placeholder="agent@email.com" />
            </Field>
            <Field label="Full Name">
              <input type="text" value={newAgent.legalFullName}
                onChange={(e) => setNewAgent((f) => ({ ...f, legalFullName: e.target.value }))}
                className={inputCls} placeholder="Jane Smith" />
            </Field>
            <Field label="Agent Level *">
              <select value={newAgent.agentLevel}
                onChange={(e) => setNewAgent((f) => ({ ...f, agentLevel: e.target.value }))}
                className={inputCls}>
                {["Associate", "Senior Associate", "Agency", "Super Team", "Super Agency"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Upline Rep Code">
              <input type="text" value={newAgent.uplineRepCode}
                onChange={(e) => setNewAgent((f) => ({ ...f, uplineRepCode: e.target.value }))}
                className={inputCls} placeholder="WBZ-001" />
            </Field>
          </div>
          {createRep.isError && <p className="text-xs text-red-600 mt-3">{createRep.error.message}</p>}
          <div className="flex gap-2 mt-4">
            <GradientButton
              onClick={() => createRep.mutate({ email: newAgent.email, legalFullName: newAgent.legalFullName || undefined, agentLevel: newAgent.agentLevel as any, uplineRepCode: newAgent.uplineRepCode || undefined })}
              disabled={!newAgent.email || createRep.isPending}
            >
              {createRep.isPending ? "Creating…" : "Create Agent"}
            </GradientButton>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-gray-600 px-3">Cancel</button>
          </div>
        </div>
      )}

      <DataTable
        headers={["Rep Code", "Name", "Level", "Email", "Upline", "Status"]}
        rows={(agents ?? []).map((r) => [
          <RepCode key="rc">{r.repCode}</RepCode>,
          r.legalFullName ?? <span className="text-gray-300">—</span>,
          <LevelBadge key="lb">{r.agentLevel}</LevelBadge>,
          <span key="em" className="text-gray-500">{r.email}</span>,
          r.uplineRepCode ? <RepCode key="up">{r.uplineRepCode}</RepCode> : <span className="text-gray-300">—</span>,
          <ActiveBadge key="ab" active={!!r.isActive} />,
        ])}
      />
    </div>
  );
}

// ─── Registrations ────────────────────────────────────────────────────────────

function RegistrationsTab() {
  const { data: requests, isLoading, refetch } = trpc.agentSelfReg.list.useQuery({ status: "pending" });
  const approve = trpc.agentSelfReg.approve.useMutation({ onSuccess: () => refetch() });
  const reject  = trpc.agentSelfReg.reject.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader title="Pending Registrations" count={requests?.length} />
      {!requests?.length ? (
        <EmptyState message="No pending registrations." />
      ) : (
        <DataTable
          headers={["Name", "Email", "Level", "Referred By", "Actions"]}
          rows={requests.map((r) => [
            `${r.firstName} ${r.lastName}`,
            <span key="em" className="text-gray-500">{r.email}</span>,
            r.requestedLevel,
            r.referredByRepCode ? <RepCode key="rc">{r.referredByRepCode}</RepCode> : <span className="text-gray-300">—</span>,
            <div key="ac" className="flex gap-2">
              <ApproveBtn onClick={() => approve.mutate({ id: r.id })} />
              <RejectBtn  onClick={() => reject.mutate({ id: r.id })} />
            </div>,
          ])}
        />
      )}
    </div>
  );
}

// ─── Upgrades ─────────────────────────────────────────────────────────────────

function UpgradesTab() {
  const { data: requests, isLoading, refetch } = trpc.repUpgrade.listAll.useQuery({ status: "pending" });
  const approve = trpc.repUpgrade.approve.useMutation({ onSuccess: () => refetch() });
  const reject  = trpc.repUpgrade.reject.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader title="Pending Upgrades" count={requests?.length} />
      {!requests?.length ? (
        <EmptyState message="No pending upgrades." />
      ) : (
        <DataTable
          headers={["Rep Code", "Current Level", "Requested", "Nominated By", "Actions"]}
          rows={requests.map((r) => [
            <RepCode key="rc">{r.repCode}</RepCode>,
            <span key="cur" className="text-gray-500">{r.currentLevel}</span>,
            <LevelBadge key="req">{r.requestedLevel}</LevelBadge>,
            r.nominatedByRepCode ? <RepCode key="nom">{r.nominatedByRepCode}</RepCode> : <span className="text-gray-300">—</span>,
            <div key="ac" className="flex gap-2">
              <ApproveBtn onClick={() => approve.mutate({ id: r.id })} />
              <RejectBtn  onClick={() => reject.mutate({ id: r.id })} />
            </div>,
          ])}
        />
      )}
    </div>
  );
}

// ─── Commissions ──────────────────────────────────────────────────────────────

function CommissionsTab() {
  const { data, isLoading, refetch } = trpc.commission.all.useQuery({});
  const updateStatus = trpc.commission.updateStatus.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <LoadingCard />;

  const total   = (data ?? []).reduce((s, c) => s + parseFloat(c.amount), 0);
  const pending = (data ?? []).filter((c) => c.status === "pending").reduce((s, c) => s + parseFloat(c.amount), 0);
  const paid    = (data ?? []).filter((c) => c.status === "paid").reduce((s, c) => s + parseFloat(c.amount), 0);

  return (
    <div className="space-y-5">
      <SectionHeader title="Commissions" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total"   value={`$${total.toFixed(2)}`}   color="navy" />
        <StatCard label="Pending" value={`$${pending.toFixed(2)}`} color="amber" />
        <StatCard label="Paid"    value={`$${paid.toFixed(2)}`}    color="green" />
      </div>
      <DataTable
        headers={["Rep Code", "Type", "Amount", "Rate", "Status", "Date", "Action"]}
        rows={(data ?? []).map((c) => [
          <RepCode key="rc">{c.repCode}</RepCode>,
          <span key="t" className="capitalize">{c.type}</span>,
          <span key="a" className="font-semibold text-gray-900">${parseFloat(c.amount).toFixed(2)}</span>,
          `${(parseFloat(c.rate) * 100).toFixed(0)}%`,
          <StatusBadge key="s" status={c.status ?? "pending"} />,
          c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
          c.status === "pending"
            ? <ApproveBtn key="ap" label="Approve" onClick={() => updateStatus.mutate({ id: c.id, status: "approved" })} />
            : c.status === "approved"
            ? <ApproveBtn key="ap" label="Mark Paid" onClick={() => updateStatus.mutate({ id: c.id, status: "paid" })} />
            : <span key="na" className="text-gray-300 text-xs">—</span>,
        ])}
      />
    </div>
  );
}

// ─── Attribution ──────────────────────────────────────────────────────────────

function AttributionTab() {
  const { data: issues, isLoading, refetch } = trpc.attribution.unresolvedLeads.useQuery();
  const resyncAll = trpc.attribution.resyncAll.useMutation({ onSuccess: () => refetch() });
  const assign    = trpc.attribution.assignRep.useMutation({ onSuccess: () => refetch() });
  const [assignTarget, setAssignTarget] = useState<{ leadId: number; repCode: string } | null>(null);

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader title="Unresolved Leads" count={issues?.length} action={
        <GradientButton onClick={() => resyncAll.mutate()} disabled={resyncAll.isPending}>
          {resyncAll.isPending ? "Resyncing…" : "Resync All"}
        </GradientButton>
      } />
      {resyncAll.isSuccess && (
        <p className="text-sm text-green-600">
          Resolved {(resyncAll.data as { resolved: number }).resolved} of {(resyncAll.data as { attempted: number }).attempted} leads.
        </p>
      )}
      <DataTable
        headers={["GHL Contact", "Email", "Rep Code", "Status", "Action"]}
        rows={(issues ?? []).map((l) => [
          <span key="gh" className="font-mono text-xs text-gray-400">{l.ghlContactId ?? "—"}</span>,
          l.email ?? "—",
          l.repCode ? <RepCode key="rc">{l.repCode}</RepCode> : <span className="text-red-400 text-xs">none</span>,
          <StatusBadge key="s" status={l.attributionStatus ?? "unresolved"} />,
          <div key="ac" className="flex gap-1.5 items-center">
            <input
              type="text" placeholder="WBZ-001"
              className="border rounded px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-navy-400"
              onBlur={(e) => setAssignTarget({ leadId: l.id, repCode: e.target.value })}
            />
            <ApproveBtn label="Assign" onClick={() => assignTarget?.leadId === l.id && assign.mutate(assignTarget)} />
          </div>,
        ])}
      />
    </div>
  );
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

function WebhooksTab() {
  const { data: logs, isLoading } = trpc.attribution.webhookLogs.useQuery({ limit: 50 });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader title="Webhook Logs" subtitle="Last 50 events" />
      <DataTable
        headers={["Endpoint", "Rep Code", "Status", "GHL Contact", "Date"]}
        rows={(logs ?? []).map((l) => [
          <span key="ep" className="font-mono text-xs text-gray-600">{l.endpoint}</span>,
          l.repCodeExtracted ? <RepCode key="rc">{l.repCodeExtracted}</RepCode> : <span className="text-gray-300">—</span>,
          <StatusBadge key="s" status={l.attributionStatus ?? "unresolved"} />,
          <span key="gh" className="font-mono text-xs text-gray-400">{l.ghlContactId ?? "—"}</span>,
          l.createdAt ? new Date(l.createdAt).toLocaleString() : "—",
        ])}
      />
    </div>
  );
}

// ─── ID Verification ──────────────────────────────────────────────────────────

function VerificationsTab() {
  const { data: sessions, isLoading, refetch } = trpc.agentVerification.list.useQuery();
  const review = trpc.agentVerification.review.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader title="ID Verification" />
      <DataTable
        headers={["Rep Code", "Status", "Document", "Actions"]}
        rows={(sessions ?? []).map((s) => [
          <RepCode key="rc">{s.repCode}</RepCode>,
          <StatusBadge key="s" status={s.status} />,
          s.documentUrl
            ? <a key="doc" href={s.documentUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline">View</a>
            : <span key="na" className="text-gray-300 text-xs">—</span>,
          s.status === "submitted" ? (
            <div key="ac" className="flex gap-2">
              <ApproveBtn onClick={() => review.mutate({ repCode: s.repCode, status: "approved" })} />
              <RejectBtn  onClick={() => review.mutate({ repCode: s.repCode, status: "rejected" })} />
            </div>
          ) : <span key="na" className="text-gray-300 text-xs">—</span>,
        ])}
      />
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function GradientButton({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-brand-gradient text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
    >
      {children}
    </button>
  );
}

function ApproveBtn({ onClick, label = "Approve" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 transition">
      {label}
    </button>
  );
}

function RejectBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-100 transition">
      Reject
    </button>
  );
}

function RepCode({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md font-semibold">{children}</span>;
}

function LevelBadge({ children }: { children: React.ReactNode }) {
  return <span className="text-xs bg-navy-50 text-navy-500 border border-navy-100 px-2 py-0.5 rounded-md font-medium">{children}</span>;
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:     "bg-amber-50 text-orange-600 border-orange-200",
    approved:    "bg-blue-50 text-blue-700 border-blue-200",
    paid:        "bg-green-50 text-green-700 border-green-200",
    resolved:    "bg-green-50 text-green-700 border-green-200",
    rejected:    "bg-red-50 text-red-600 border-red-200",
    unresolved:  "bg-amber-50 text-orange-600 border-orange-200",
    no_rep_code: "bg-gray-50 text-gray-500 border-gray-200",
    submitted:   "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize border font-medium ${map[status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "navy" | "amber" | "green" }) {
  const colors = {
    navy:  "border-navy-200 bg-navy-50 text-navy-500",
    amber: "border-orange-200 bg-orange-50 text-orange-500",
    green: "border-green-200 bg-green-50 text-green-700",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <EmptyState />;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-gray-700 whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, subtitle, action }: {
  title: string;
  count?: number;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-navy-500">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-sm font-normal text-gray-400">({count})</span>
          )}
        </h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function CredField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-green-600 font-semibold mb-0.5">{label}</p>
      <p className="font-mono text-sm text-green-900 bg-green-100 rounded px-2 py-1 select-all">{value}</p>
    </div>
  );
}

function EmptyState({ message = "No records." }: { message?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
      <div className="inline-block w-5 h-5 border-2 border-navy-200 border-t-navy-500 rounded-full animate-spin" />
    </div>
  );
}
