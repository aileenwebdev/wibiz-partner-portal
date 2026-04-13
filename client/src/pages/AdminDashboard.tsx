/**
 * AdminDashboard.tsx — Wibiz Admin Portal (redesigned)
 */

import { useState } from "react";
import { trpc } from "../lib/trpc";

// ── SVG icon component ─────────────────────────────────────────────────────────

function Icon({ name, size = 15, className }: { name: string; size?: number; className?: string }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: 2 as number,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "menu":      return <svg {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    case "x":         return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "users":     return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "userPlus":  return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
    case "trending":  return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    case "shield":    return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "dollar":    return <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case "barChart":  return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "activity":  return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "fileText":  return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    case "bell":      return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case "search":    return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case "chevDown":  return <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>;
    case "logOut":    return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    case "check":     return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case "xCircle":   return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
    case "external":  return <svg {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
    case "plus":      return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "target":    return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    default:          return <svg {...p}/>;
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = "agents" | "attribution" | "webhooks" | "commissions" | "registrations" | "upgrades" | "verifications";

const NAV_GROUPS: { label: string; items: { id: Tab; label: string; icon: string }[] }[] = [
  {
    label: "Agents",
    items: [
      { id: "agents",        label: "All Agents",      icon: "users"     },
      { id: "registrations", label: "Registrations",   icon: "userPlus"  },
      { id: "upgrades",      label: "Upgrades",        icon: "trending"  },
      { id: "verifications", label: "ID Verification", icon: "shield"    },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "commissions", label: "Commissions", icon: "dollar" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "attribution", label: "Attribution",  icon: "target"    },
      { id: "webhooks",    label: "Webhook Logs", icon: "activity"  },
    ],
  },
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab]           = useState<Tab>("agents");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-dm">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-[230px] min-w-[230px] flex flex-col bg-navy h-screen
        overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-[22px] pb-4 border-b border-white/[0.07] shrink-0">
          <div>
            <img src="/images/wibiz-white.png" alt="Wibiz" className="h-7 w-auto object-contain" />
            <p className="text-[9px] text-white/30 tracking-[1.2px] uppercase mt-1">Admin Console</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white p-1 transition">
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="mx-3.5 my-3 bg-gradient-to-br from-amber/[0.15] to-[#824600]/[0.1] border border-amber/25 rounded-[10px] p-[10px] flex items-center gap-2.5 shrink-0">
          <div className="w-[34px] h-[34px] rounded-[8px] bg-gradient-to-br from-amber to-[#824600] flex items-center justify-center font-sora font-bold text-[12px] text-white shrink-0">
            SA
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white leading-tight truncate">Admin</p>
            <p className="text-[10px] text-amber font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-[5px] h-[5px] rounded-full bg-amber shrink-0" />
              Super Admin
            </p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="py-1.5">
              <p className="text-[10px] text-white/[0.22] font-semibold tracking-[1px] uppercase px-5 pt-2.5 pb-1">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                    className={`
                      w-full flex items-center gap-2.5 px-5 py-[9px] text-[13px] text-left
                      relative border-none bg-transparent cursor-pointer font-dm
                      transition-all duration-[120ms]
                      ${active
                        ? "text-white bg-amber/[0.12] font-medium"
                        : "text-white/50 hover:text-white hover:bg-white/[0.05]"}
                    `}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-amber rounded-r-[3px]" />
                    )}
                    <Icon
                      name={item.icon}
                      size={14}
                      className={active ? "opacity-100" : "opacity-60"}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div className="px-4 pb-3.5 pt-3 border-t border-white/[0.07] shrink-0">
          <div className="flex items-center gap-[7px] bg-green-500/[0.08] border border-green-500/[0.18] rounded-[8px] px-[11px] py-2">
            <span className="w-[6px] h-[6px] rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-white/55">All systems online</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-border h-14 px-6 flex items-center gap-3 shrink-0">

          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted hover:text-navy transition p-1">
            <Icon name="menu" size={20} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-[300px]">
            <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-light pointer-events-none">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              placeholder="Search agents, leads, commissions…"
              className="w-full h-[34px] border border-border rounded-[8px] pl-[34px] pr-3 text-[13px] text-navy bg-surface placeholder-light outline-none transition-[border-color] duration-150 focus:border-amber font-dm"
            />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Add Agent */}
            <button
              onClick={() => setTab("agents")}
              className="flex items-center gap-[5px] h-[34px] px-4 bg-navy hover:bg-navy-light text-white text-[12px] font-semibold rounded-[8px] font-sora tracking-[0.2px] transition-colors duration-150"
            >
              <Icon name="userPlus" size={13} />
              Add Agent
            </button>

            <span className="w-px h-6 bg-border" />

            {/* Bell */}
            <div className="relative w-[34px] h-[34px] border border-border rounded-[8px] flex items-center justify-center cursor-pointer text-muted hover:border-navy transition-colors duration-150">
              <Icon name="bell" size={15} />
              <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] rounded-full bg-red-500 border-[1.5px] border-white" />
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2 px-[10px] py-1 border border-border rounded-[8px] cursor-pointer hover:border-navy transition-colors duration-150">
              <div className="w-[26px] h-[26px] rounded-[6px] bg-gradient-to-br from-amber to-[#824600] flex items-center justify-center text-[10px] font-bold text-white font-sora shrink-0">
                SA
              </div>
              <span className="text-[13px] font-medium text-navy hidden sm:block">Admin</span>
              <span className="text-[10px] font-semibold bg-amber/[0.12] text-[#824600] px-1.5 py-0.5 rounded-[4px] hidden sm:block">
                Admin
              </span>
              <Icon name="chevDown" size={13} className="text-muted" />
            </div>

            {/* Sign out */}
            <a
              href="/login"
              className="flex items-center gap-1.5 text-[12px] text-muted hover:text-navy transition-colors duration-150 pl-0.5"
              title="Sign out"
            >
              <Icon name="logOut" size={15} />
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
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
      <SectionHeader title="All Agents" count={agents?.length} action={
        !showForm && (
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <Icon name="plus" size={13} /> New Agent
          </PrimaryBtn>
        )
      } />

      {/* Credentials banner */}
      {created && (
        <div className="bg-green-50 border border-green-200 rounded-[12px] p-4 text-sm">
          <p className="font-semibold text-green-800 mb-3">Agent created — share these credentials:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CredField label="Rep Code"      value={created.repCode} />
            <CredField label="Username"      value={created.username} />
            <CredField label="Temp Password" value={created.tempPassword} />
          </div>
          <p className="text-green-600 text-xs mt-3">Agent should change their password on first login.</p>
          <button onClick={() => setCreated(null)} className="mt-2 text-xs text-green-500 underline hover:text-green-700 transition">Dismiss</button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-[12px] border border-border shadow-card p-5">
          <h3 className="font-sora font-semibold text-navy text-[13px] mb-4">New Agent</h3>
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
          {createRep.isError && (
            <p className="text-[12px] text-red-500 mt-3">{createRep.error.message}</p>
          )}
          <div className="flex items-center gap-2 mt-4">
            <PrimaryBtn
              onClick={() => createRep.mutate({
                email: newAgent.email,
                legalFullName: newAgent.legalFullName || undefined,
                agentLevel: newAgent.agentLevel as any,
                uplineRepCode: newAgent.uplineRepCode || undefined,
              })}
              disabled={!newAgent.email || createRep.isPending}
            >
              {createRep.isPending ? "Creating…" : "Create Agent"}
            </PrimaryBtn>
            <button onClick={() => setShowForm(false)} className="text-[13px] text-muted hover:text-navy px-3 transition">Cancel</button>
          </div>
        </div>
      )}

      <DataTable
        headers={["Rep Code", "Name", "Level", "Email", "Upline", "Status"]}
        rows={(agents ?? []).map((r) => [
          <RepCodePill key="rc">{r.repCode}</RepCodePill>,
          r.legalFullName ?? <span className="text-light">—</span>,
          <LevelBadge key="lb">{r.agentLevel}</LevelBadge>,
          <span key="em" className="text-muted">{r.email}</span>,
          r.uplineRepCode ? <RepCodePill key="up">{r.uplineRepCode}</RepCodePill> : <span className="text-light">—</span>,
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
            <span key="em" className="text-muted">{r.email}</span>,
            <LevelBadge key="lb">{r.requestedLevel}</LevelBadge>,
            r.referredByRepCode ? <RepCodePill key="rc">{r.referredByRepCode}</RepCodePill> : <span className="text-light">—</span>,
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
            <RepCodePill key="rc">{r.repCode}</RepCodePill>,
            <span key="cur" className="text-muted">{r.currentLevel}</span>,
            <LevelBadge key="req">{r.requestedLevel}</LevelBadge>,
            r.nominatedByRepCode ? <RepCodePill key="nom">{r.nominatedByRepCode}</RepCodePill> : <span className="text-light">—</span>,
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
        <StatCard label="Total"   value={`$${total.toFixed(2)}`}   color="navy"  />
        <StatCard label="Pending" value={`$${pending.toFixed(2)}`} color="amber" />
        <StatCard label="Paid"    value={`$${paid.toFixed(2)}`}    color="green" />
      </div>
      <DataTable
        headers={["Rep Code", "Type", "Amount", "Rate", "Status", "Date", "Action"]}
        rows={(data ?? []).map((c) => [
          <RepCodePill key="rc">{c.repCode}</RepCodePill>,
          <span key="t" className="capitalize">{c.type}</span>,
          <span key="a" className="font-semibold text-navy">${parseFloat(c.amount).toFixed(2)}</span>,
          `${(parseFloat(c.rate) * 100).toFixed(0)}%`,
          <StatusBadge key="s" status={c.status ?? "pending"} />,
          c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
          c.status === "pending"
            ? <ApproveBtn key="ap" label="Approve"   onClick={() => updateStatus.mutate({ id: c.id, status: "approved" })} />
            : c.status === "approved"
            ? <ApproveBtn key="ap" label="Mark Paid" onClick={() => updateStatus.mutate({ id: c.id, status: "paid" })} />
            : <span key="na" className="text-light text-xs">—</span>,
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
        <PrimaryBtn onClick={() => resyncAll.mutate()} disabled={resyncAll.isPending}>
          {resyncAll.isPending ? "Resyncing…" : "Resync All"}
        </PrimaryBtn>
      } />
      {resyncAll.isSuccess && (
        <p className="text-[13px] text-green-600">
          Resolved {(resyncAll.data as { resolved: number }).resolved} of {(resyncAll.data as { attempted: number }).attempted} leads.
        </p>
      )}
      <DataTable
        headers={["GHL Contact", "Email", "Rep Code", "Status", "Action"]}
        rows={(issues ?? []).map((l) => [
          <span key="gh" className="font-mono text-xs text-muted">{l.ghlContactId ?? "—"}</span>,
          l.email ?? "—",
          l.repCode ? <RepCodePill key="rc">{l.repCode}</RepCodePill> : <span className="text-red-400 text-xs font-medium">none</span>,
          <StatusBadge key="s" status={l.attributionStatus ?? "unresolved"} />,
          <div key="ac" className="flex gap-1.5 items-center">
            <input
              type="text"
              placeholder="WBZ-001"
              className="border border-border rounded-[6px] px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-amber font-dm"
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
          <span key="ep" className="font-mono text-xs text-navy/70">{l.endpoint}</span>,
          l.repCodeExtracted ? <RepCodePill key="rc">{l.repCodeExtracted}</RepCodePill> : <span className="text-light">—</span>,
          <StatusBadge key="s" status={l.attributionStatus ?? "unresolved"} />,
          <span key="gh" className="font-mono text-xs text-muted">{l.ghlContactId ?? "—"}</span>,
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
          <RepCodePill key="rc">{s.repCode}</RepCodePill>,
          <StatusBadge key="s" status={s.status} />,
          s.documentUrl
            ? <a key="doc" href={s.documentUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-[12px] text-amber hover:opacity-75 transition">
                View <Icon name="external" size={11} />
              </a>
            : <span key="na" className="text-light text-xs">—</span>,
          s.status === "submitted" ? (
            <div key="ac" className="flex gap-2">
              <ApproveBtn onClick={() => review.mutate({ repCode: s.repCode, status: "approved" })} />
              <RejectBtn  onClick={() => review.mutate({ repCode: s.repCode, status: "rejected" })} />
            </div>
          ) : <span key="na" className="text-light text-xs">—</span>,
        ])}
      />
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls = [
  "w-full border border-border rounded-[10px] px-3 py-2",
  "text-[13px] text-navy bg-white placeholder-light",
  "outline-none transition-[border-color,box-shadow] duration-150",
  "focus:border-amber focus:shadow-[0_0_0_3px_rgba(255,137,0,0.12)]",
  "font-dm",
].join(" ");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-[0.5px]">{label}</label>
      {children}
    </div>
  );
}

function PrimaryBtn({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 h-[34px] px-4 bg-navy hover:bg-navy-light text-white text-[12px] font-semibold rounded-[8px] font-sora tracking-[0.2px] transition-colors duration-150 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function ApproveBtn({ onClick, label = "Approve" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[12px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-[6px] hover:bg-green-100 transition font-medium"
    >
      <Icon name="check" size={11} />
      {label}
    </button>
  );
}

function RejectBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[12px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-[6px] hover:bg-red-100 transition font-medium"
    >
      <Icon name="xCircle" size={11} />
      Reject
    </button>
  );
}

function RepCodePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] bg-amber/[0.1] text-[#824600] border border-amber/25 px-2 py-0.5 rounded-[5px] font-semibold">
      {children}
    </span>
  );
}

function LevelBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] bg-navy/[0.06] text-navy border border-navy/[0.12] px-2 py-0.5 rounded-[5px] font-medium">
      {children}
    </span>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium ${
      active ? "bg-green-50 text-green-700 border border-green-200" : "bg-surface text-muted border border-border"
    }`}>
      <span className={`w-[5px] h-[5px] rounded-full ${active ? "bg-green-500" : "bg-muted"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:     "bg-amber/[0.08] text-[#824600] border-amber/25",
    approved:    "bg-blue-50 text-blue-700 border-blue-200",
    paid:        "bg-green-50 text-green-700 border-green-200",
    resolved:    "bg-green-50 text-green-700 border-green-200",
    rejected:    "bg-red-50 text-red-600 border-red-200",
    unresolved:  "bg-amber/[0.08] text-[#824600] border-amber/25",
    no_rep_code: "bg-surface text-muted border-border",
    submitted:   "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full capitalize border font-medium ${map[status] ?? "bg-surface text-muted border-border"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "navy" | "amber" | "green" }) {
  const styles = {
    navy:  "border-navy/20 bg-navy/[0.04] text-navy",
    amber: "border-amber/30 bg-amber/[0.07] text-[#824600]",
    green: "border-green-200 bg-green-50 text-green-700",
  };
  return (
    <div className={`rounded-[12px] border p-5 shadow-card ${styles[color]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.5px] opacity-60 mb-1">{label}</p>
      <p className="font-sora text-[24px] font-bold leading-none">{value}</p>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <EmptyState />;
  return (
    <div className="bg-white rounded-[12px] border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              {headers.map((h) => (
                <th key={h} className="text-left px-[18px] py-[10px] text-[10px] font-semibold text-muted uppercase tracking-[0.7px] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-[#f5f5f5] hover:bg-surface/70 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-[18px] py-3 text-[13px] text-navy/80 whitespace-nowrap">{cell}</td>
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
        <h2 className="font-sora text-[17px] font-bold text-navy flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="font-dm text-[13px] font-normal text-muted">({count})</span>
          )}
        </h2>
        {subtitle && <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function CredField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-green-600 font-semibold mb-0.5 uppercase tracking-[0.3px]">{label}</p>
      <p className="font-mono text-[13px] text-green-900 bg-green-100 rounded-[6px] px-2.5 py-1.5 select-all">{value}</p>
    </div>
  );
}

function EmptyState({ message = "No records." }: { message?: string }) {
  return (
    <div className="bg-white rounded-[12px] border border-border shadow-card p-12 text-center text-[13px] text-muted">
      {message}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-[12px] border border-border shadow-card p-12 text-center">
      <div className="inline-block w-5 h-5 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
    </div>
  );
}
