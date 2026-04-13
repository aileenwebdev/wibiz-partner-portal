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
    case "edit":      return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "calendar":  return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "video":     return <svg {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    case "trash":     return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
    default:          return <svg {...p}/>;
  }
}

const LEVELS = ["Associate", "Senior Associate", "Agency", "Super Team", "Super Agency"] as const;

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = "agents" | "leads" | "attribution" | "webhooks" | "commissions" | "registrations" | "upgrades" | "verifications" | "events" | "videos";

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
    label: "Leads",
    items: [
      { id: "leads",       label: "All Leads",    icon: "target"   },
      { id: "attribution", label: "Attribution",  icon: "barChart" },
      { id: "webhooks",    label: "Webhook Logs", icon: "activity" },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "commissions", label: "Commissions", icon: "dollar" },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "events", label: "Events",        icon: "calendar" },
      { id: "videos", label: "Video Library", icon: "video"    },
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
          {tab === "leads"         && <AllLeadsTab />}
          {tab === "registrations" && <RegistrationsTab />}
          {tab === "upgrades"      && <UpgradesTab />}
          {tab === "commissions"   && <CommissionsTab />}
          {tab === "attribution"   && <AttributionTab />}
          {tab === "webhooks"      && <WebhooksTab />}
          {tab === "verifications" && <VerificationsTab />}
          {tab === "events"        && <AdminEventsTab />}
          {tab === "videos"        && <AdminVideosTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Agents ───────────────────────────────────────────────────────────────────

type AgentRow = { repCode: string; email: string; legalFullName?: string | null; agentLevel: string; uplineRepCode?: string | null; isActive?: boolean | null; phone?: string | null; businessName?: string | null };

function AgentsTab() {
  const { data: agents, isLoading, refetch } = trpc.rep.list.useQuery({ limit: 200 });
  const [showForm,  setShowForm]  = useState(false);
  const [editRep,   setEditRep]   = useState<AgentRow | null>(null);
  const [newAgent,  setNewAgent]  = useState({ email: "", legalFullName: "", agentLevel: "Associate", uplineRepCode: "" });
  const [editData,  setEditData]  = useState({ legalFullName: "", agentLevel: "Associate", phone: "", uplineRepCode: "", notes: "" });
  const [created,   setCreated]   = useState<{ repCode: string; username: string; tempPassword: string } | null>(null);

  const createRep = trpc.rep.create.useMutation({
    onSuccess: (rep) => {
      setCreated({ repCode: rep.repCode, username: rep.username ?? rep.email, tempPassword: rep.tempPasswordPlain ?? "(see DB)" });
      setShowForm(false);
      setNewAgent({ email: "", legalFullName: "", agentLevel: "Associate", uplineRepCode: "" });
      refetch();
    },
  });

  const updateRep = trpc.rep.update.useMutation({
    onSuccess: () => { setEditRep(null); refetch(); },
  });

  function openEdit(r: AgentRow) {
    setEditRep(r);
    setEditData({
      legalFullName: r.legalFullName ?? "",
      agentLevel:    r.agentLevel,
      phone:         r.phone ?? "",
      uplineRepCode: r.uplineRepCode ?? "",
      notes:         "",
    });
    setShowForm(false);
  }

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader title="All Agents" count={agents?.length} action={
        !showForm && !editRep && (
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <Icon name="plus" size={13} /> New Agent
          </PrimaryBtn>
        )
      } />

      {/* Credentials banner */}
      {created && (
        <div className="bg-green-50 border border-green-200 rounded-[12px] p-4">
          <p className="font-semibold text-green-800 text-[13px] mb-3">Agent created — share these credentials:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CredField label="Rep Code"      value={created.repCode} />
            <CredField label="Username"      value={created.username} />
            <CredField label="Temp Password" value={created.tempPassword} />
          </div>
          <p className="text-green-600 text-xs mt-3">Agent must change their password on first login.</p>
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
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Upline Rep Code">
              <input type="text" value={newAgent.uplineRepCode}
                onChange={(e) => setNewAgent((f) => ({ ...f, uplineRepCode: e.target.value }))}
                className={inputCls} placeholder="WBZ-001" />
            </Field>
          </div>
          {createRep.isError && <p className="text-[12px] text-red-500 mt-3">{createRep.error.message}</p>}
          <div className="flex items-center gap-2 mt-4">
            <PrimaryBtn
              onClick={() => createRep.mutate({ email: newAgent.email, legalFullName: newAgent.legalFullName || undefined, agentLevel: newAgent.agentLevel as any, uplineRepCode: newAgent.uplineRepCode || undefined })}
              disabled={!newAgent.email || createRep.isPending}
            >
              {createRep.isPending ? "Creating…" : "Create Agent"}
            </PrimaryBtn>
            <button onClick={() => setShowForm(false)} className="text-[13px] text-muted hover:text-navy px-3 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editRep && (
        <div className="bg-white rounded-[12px] border border-amber/40 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sora font-semibold text-navy text-[13px]">
              Edit Agent — <RepCodePill>{editRep.repCode}</RepCodePill>
            </h3>
            <button onClick={() => setEditRep(null)} className="text-muted hover:text-navy transition">
              <Icon name="x" size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input type="text" value={editData.legalFullName}
                onChange={(e) => setEditData((f) => ({ ...f, legalFullName: e.target.value }))}
                className={inputCls} placeholder="Jane Smith" />
            </Field>
            <Field label="Phone">
              <input type="text" value={editData.phone}
                onChange={(e) => setEditData((f) => ({ ...f, phone: e.target.value }))}
                className={inputCls} placeholder="+1 555 000 0000" />
            </Field>
            <Field label="Agent Level">
              <select value={editData.agentLevel}
                onChange={(e) => setEditData((f) => ({ ...f, agentLevel: e.target.value }))}
                className={inputCls}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Upline Rep Code">
              <input type="text" value={editData.uplineRepCode}
                onChange={(e) => setEditData((f) => ({ ...f, uplineRepCode: e.target.value }))}
                className={inputCls} placeholder="WBZ-001" />
            </Field>
          </div>
          {updateRep.isError && <p className="text-[12px] text-red-500 mt-3">{updateRep.error.message}</p>}
          <div className="flex items-center gap-2 mt-4">
            <PrimaryBtn
              onClick={() => updateRep.mutate({ repCode: editRep.repCode, legalFullName: editData.legalFullName || undefined, phone: editData.phone || undefined, agentLevel: editData.agentLevel as any, uplineRepCode: editData.uplineRepCode || undefined })}
              disabled={updateRep.isPending}
            >
              {updateRep.isPending ? "Saving…" : "Save Changes"}
            </PrimaryBtn>
            <button onClick={() => setEditRep(null)} className="text-[13px] text-muted hover:text-navy px-3 transition">Cancel</button>
          </div>
        </div>
      )}

      <DataTable
        headers={["Rep Code", "Name", "Level", "Email", "Upline", "Status", "Actions"]}
        rows={(agents ?? []).map((r) => [
          <RepCodePill key="rc">{r.repCode}</RepCodePill>,
          r.legalFullName ?? <span className="text-light">—</span>,
          <LevelBadge key="lb">{r.agentLevel}</LevelBadge>,
          <span key="em" className="text-muted">{r.email}</span>,
          r.uplineRepCode ? <RepCodePill key="up">{r.uplineRepCode}</RepCodePill> : <span className="text-light">—</span>,
          <ActiveBadge key="ab" active={!!r.isActive} />,
          <div key="ac" className="flex gap-1.5">
            <button
              onClick={() => openEdit(r as AgentRow)}
              className="inline-flex items-center gap-1 text-[11px] text-navy border border-border bg-white px-2 py-1 rounded-[5px] hover:border-navy transition"
            >
              <Icon name="edit" size={11} /> Edit
            </button>
            <button
              onClick={() => updateRep.mutate({ repCode: r.repCode, isActive: !r.isActive })}
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-[5px] border transition ${
                r.isActive
                  ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                  : "text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
              }`}
            >
              {r.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>,
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

// Pipeline stage badge
const STAGE_STYLE: Record<string, string> = {
  "New Lead":             "bg-blue-50 text-blue-700 border-blue-200",
  "Paid - SMB Lite":      "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Paid - SMB Standard":  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Paid - SMB Pro":       "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Onboarding Started":   "bg-amber-50 text-amber-700 border-amber-200",
  "Onboarding Completed": "bg-amber-50 text-amber-700 border-amber-200",
  "Account Deployed":     "bg-navy/5 text-navy border-navy/20",
};

function StageBadge({ stage }: { stage?: string | null }) {
  if (!stage) return <span className="text-light text-xs">—</span>;
  const style = STAGE_STYLE[stage] ?? "bg-gray-50 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${style}`}>
      {stage}
    </span>
  );
}

// ─── All Leads ────────────────────────────────────────────────────────────────

type SyncResult = { pipeline: { total: number; synced: number }; contacts: { total: number; synced: number }; resolved: number; errors: string[] };

function AllLeadsTab() {
  const { data: leads, isLoading, refetch } = trpc.attribution.allLeads.useQuery({ limit: 500 });
  const sync = trpc.attribution.syncFromGhl.useMutation({ onSuccess: () => refetch() });
  const [search, setSearch] = useState("");

  if (isLoading) return <LoadingCard />;

  const filtered = (leads ?? []).filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.email ?? "").toLowerCase().includes(q) ||
      (l.firstName ?? "").toLowerCase().includes(q) ||
      (l.lastName ?? "").toLowerCase().includes(q) ||
      (l.repCode ?? "").toLowerCase().includes(q) ||
      (l.businessName ?? "").toLowerCase().includes(q)
    );
  });

  const inPipeline = (leads ?? []).filter((l) => l.pipelineId);
  const stats = {
    total:      leads?.length ?? 0,
    pipeline:   inPipeline.length,
    resolved:   (leads ?? []).filter((l) => l.attributionStatus === "resolved").length,
    unresolved: (leads ?? []).filter((l) => l.attributionStatus !== "resolved").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-navy font-sora">All Leads</h2>
          <p className="text-[12px] text-light mt-0.5">
            {stats.total} total · {stats.resolved} attributed · {stats.unresolved} unresolved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
            className="flex items-center gap-1.5 bg-navy text-white text-[12px] font-semibold px-4 py-2 rounded-[8px] hover:opacity-90 transition disabled:opacity-50"
          >
            <Icon name="activity" size={13} />
            {sync.isPending ? "Syncing from GHL…" : "Sync from GHL"}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Leads",      value: stats.total      },
          { label: "In Pipeline",      value: stats.pipeline   },
          { label: "Attributed",       value: stats.resolved   },
          { label: "Unattributed",     value: stats.unresolved },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <p className="text-[11px] text-light uppercase tracking-wide mb-1">{s.label}</p>
            <p className="font-sora text-[24px] font-bold text-navy leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sync result */}
      {sync.isSuccess && (() => {
        const d = sync.data as SyncResult;
        return (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-[13px] text-green-700">
            GHL sync complete — {d.pipeline.synced} pipeline leads + {d.contacts.synced} contacts imported · {d.resolved} attributed.
            {d.errors.length > 0 && <span className="text-amber-600 ml-2">{d.errors.length} errors (check logs)</span>}
          </div>
        );
      })()}
      {sync.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
          Sync error: {sync.error.message}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, rep code…"
          className="w-full pl-9 pr-4 py-2 text-[13px] border border-border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-amber/30 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface border-b border-border">
                {["Name", "Email", "Business", "Rep Code", "Stage", "Score", "Plan", "Attribution", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-light uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-light text-[13px]">
                    {leads?.length ? "No leads match your search." : "No leads yet. Click \"Sync from GHL\" to import existing leads."}
                  </td>
                </tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">
                    {[l.firstName, l.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted max-w-[180px] truncate">{l.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted max-w-[140px] truncate">{l.businessName ?? "—"}</td>
                  <td className="px-4 py-3">
                    {l.repCode
                      ? <RepCodePill>{l.repCode}</RepCodePill>
                      : <span className="text-red-400 text-[11px] font-medium">none</span>}
                  </td>
                  <td className="px-4 py-3"><StageBadge stage={l.currentStage} /></td>
                  <td className="px-4 py-3 text-muted">{l.s360AuditScore ?? "—"}</td>
                  <td className="px-4 py-3 text-muted max-w-[120px] truncate">{l.s360PlanName ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.attributionStatus ?? "unresolved"} /></td>
                  <td className="px-4 py-3 text-light whitespace-nowrap text-[11px]">
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
  const review   = trpc.agentVerification.review.useMutation({ onSuccess: () => refetch() });
  const genLink  = trpc.agentVerification.generateLink.useMutation({
    onSuccess: (data) => { setGeneratedLink(data.verifyLink); refetch(); },
  });

  const [linkRepCode,   setLinkRepCode]   = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied,        setCopied]        = useState(false);

  function copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isLoading) return <LoadingCard />;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="ID Verification"
        subtitle="Agents verify their identity via a secure token link"
      />

      {/* Generate / Resend link panel */}
      <div className="bg-white rounded-[12px] border border-border shadow-card p-5">
        <p className="font-sora font-semibold text-navy text-[13px] mb-1">Send Verification Link</p>
        <p className="text-[12px] text-muted mb-4">
          Enter a rep code to generate a 7-day verification link. Paste it into GHL or send directly to the agent.
          The link is also automatically written to the agent's GHL custom field <code className="bg-surface px-1 rounded text-[11px]">verify_link</code>.
        </p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="WBZ-001"
            value={linkRepCode}
            onChange={(e) => setLinkRepCode(e.target.value.toUpperCase())}
            className="border border-border rounded-[8px] px-3 h-[34px] text-[13px] text-navy bg-surface placeholder-light outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(255,137,0,0.12)] w-36 font-dm"
          />
          <PrimaryBtn
            onClick={() => { if (linkRepCode) { genLink.mutate({ repCode: linkRepCode }); } }}
            disabled={!linkRepCode || genLink.isPending}
          >
            {genLink.isPending ? "Generating…" : "Generate Link"}
          </PrimaryBtn>
        </div>
        {genLink.isError && (
          <p className="text-[12px] text-red-500 mt-2">{genLink.error.message}</p>
        )}
        {generatedLink && (
          <div className="mt-3 flex items-center gap-2 bg-surface border border-border rounded-[8px] px-3 py-2">
            <span className="font-mono text-[12px] text-navy flex-1 truncate">{generatedLink}</span>
            <button
              onClick={() => copyLink(generatedLink)}
              className="flex items-center gap-1 text-[11px] font-medium text-amber hover:opacity-75 transition shrink-0"
            >
              <Icon name="copy" size={12} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {/* Sessions table */}
      {!sessions?.length ? (
        <EmptyState message="No verification sessions yet." />
      ) : (
        <DataTable
          headers={["Rep Code", "Status", "Verify Link", "Document", "Submitted", "Actions"]}
          rows={sessions.map((s) => [
            <RepCodePill key="rc">{s.repCode}</RepCodePill>,
            <StatusBadge key="s" status={s.status} />,
            <button
              key="vl"
              onClick={() => copyLink(s.verifyLink)}
              className="inline-flex items-center gap-1 text-[11px] text-amber hover:opacity-75 transition font-medium max-w-[160px]"
              title={s.verifyLink}
            >
              <Icon name="copy" size={11} />
              Copy link
            </button>,
            s.documentUrl
              ? <a key="doc" href={s.documentUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] text-amber hover:opacity-75 transition">
                  View <Icon name="external" size={11} />
                </a>
              : <span key="na" className="text-light text-xs">—</span>,
            s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—",
            s.status === "submitted" ? (
              <div key="ac" className="flex gap-2">
                <ApproveBtn onClick={() => review.mutate({ repCode: s.repCode, status: "approved" })} />
                <RejectBtn  onClick={() => review.mutate({ repCode: s.repCode, status: "rejected" })} />
              </div>
            ) : (
              <button
                key="re"
                onClick={() => genLink.mutate({ repCode: s.repCode })}
                className="text-[11px] text-muted border border-border px-2 py-1 rounded-[5px] hover:border-navy transition"
              >
                Resend
              </button>
            ),
          ])}
        />
      )}
    </div>
  );
}

// ─── Admin Events ─────────────────────────────────────────────────────────────

const BLANK_EVENT = { title: "", description: "", platform: "zoom" as const, meetingUrl: "", badge: "Training", badgeColor: "blue", startsAt: "", endsAt: "", attendeeCount: 0, isPublished: true };

function AdminEventsTab() {
  const { data: events, isLoading, refetch } = trpc.events.listAll.useQuery();
  const create = trpc.events.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm(BLANK_EVENT); } });
  const update = trpc.events.update.useMutation({ onSuccess: () => { refetch(); setEditId(null); } });
  const del    = trpc.events.delete.useMutation({ onSuccess: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [form,     setForm]     = useState(BLANK_EVENT);

  function openEdit(ev: any) {
    setEditId(ev.id);
    setForm({
      title: ev.title, description: ev.description ?? "", platform: ev.platform,
      meetingUrl: ev.meetingUrl ?? "", badge: ev.badge ?? "Training", badgeColor: ev.badgeColor ?? "blue",
      startsAt: ev.startsAt ? new Date(ev.startsAt).toISOString().slice(0, 16) : "",
      endsAt:   ev.endsAt   ? new Date(ev.endsAt).toISOString().slice(0, 16) : "",
      attendeeCount: ev.attendeeCount ?? 0, isPublished: ev.isPublished ?? true,
    });
    setShowForm(false);
  }

  function saveForm() {
    if (editId) update.mutate({ id: editId, ...form });
    else        create.mutate(form);
  }

  if (isLoading) return <LoadingCard />;

  const isEditing = editId !== null;
  const formOpen  = showForm || isEditing;

  return (
    <div className="space-y-5">
      <SectionHeader title="Events" count={events?.length} action={
        !formOpen && <PrimaryBtn onClick={() => { setShowForm(true); setForm(BLANK_EVENT); setEditId(null); }}><Icon name="plus" size={13} /> New Event</PrimaryBtn>
      } />

      {formOpen && (
        <div className="bg-white rounded-[12px] border border-amber/40 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sora font-semibold text-navy text-[13px]">{isEditing ? "Edit Event" : "New Event"}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted hover:text-navy transition"><Icon name="x" size={15} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title *"><input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Event title" /></Field>
            <Field label="Platform">
              <select className={inputCls} value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as any }))}>
                {["zoom","meet","webinar","in_person"].map((p) => <option key={p} value={p}>{p.replace("_"," ")}</option>)}
              </select>
            </Field>
            <Field label="Starts At *"><input type="datetime-local" className={inputCls} value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} /></Field>
            <Field label="Ends At"><input type="datetime-local" className={inputCls} value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} /></Field>
            <Field label="Meeting URL"><input className={inputCls} value={form.meetingUrl} onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))} placeholder="https://..." /></Field>
            <Field label="Badge">
              <div className="flex gap-2">
                <input className={inputCls} value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="Training" />
                <select className={inputCls + " max-w-[110px]"} value={form.badgeColor} onChange={(e) => setForm((f) => ({ ...f, badgeColor: e.target.value }))}>
                  {["blue","purple","green","pink","amber"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Attendee Count"><input type="number" className={inputCls} value={form.attendeeCount} onChange={(e) => setForm((f) => ({ ...f, attendeeCount: Number(e.target.value) }))} /></Field>
            <Field label="Description (optional)"><input className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description…" /></Field>
          </div>
          {(create.isError || update.isError) && <p className="text-[12px] text-red-500 mt-3">{(create.error ?? update.error)?.message}</p>}
          <div className="flex items-center gap-2 mt-4">
            <PrimaryBtn onClick={saveForm} disabled={!form.title || !form.startsAt || create.isPending || update.isPending}>
              {(create.isPending || update.isPending) ? "Saving…" : isEditing ? "Save Changes" : "Publish Event"}
            </PrimaryBtn>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-[13px] text-muted hover:text-navy px-3 transition">Cancel</button>
          </div>
        </div>
      )}

      {!events?.length ? <EmptyState message="No events yet. Create your first event." /> : (
        <DataTable
          headers={["Title", "Date & Time", "Platform", "Attendees", "Badge", "Status", "Actions"]}
          rows={events.map((ev) => [
            <span key="t" className="font-medium text-navy text-[13px]">{ev.title}</span>,
            <span key="d" className="text-[12px] text-muted whitespace-nowrap">{ev.startsAt ? new Date(ev.startsAt).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }) : "—"}</span>,
            <span key="p" className="capitalize text-[12px]">{ev.platform?.replace("_"," ")}</span>,
            <span key="a">{ev.attendeeCount}</span>,
            ev.badge ? <span key="b" className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{ev.badge}</span> : <span key="b" className="text-light">—</span>,
            <span key="s" className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${ev.isPublished ? "bg-green-50 text-green-700 border-green-200" : "bg-surface text-muted border-border"}`}>{ev.isPublished ? "Published" : "Draft"}</span>,
            <div key="ac" className="flex gap-1.5">
              <button onClick={() => openEdit(ev)} className="inline-flex items-center gap-1 text-[11px] border border-border px-2 py-1 rounded-[5px] hover:border-navy transition"><Icon name="edit" size={11} /> Edit</button>
              <button onClick={() => del.mutate({ id: ev.id })} className="inline-flex items-center gap-1 text-[11px] border border-red-200 text-red-600 bg-red-50 px-2 py-1 rounded-[5px] hover:bg-red-100 transition"><Icon name="trash" size={11} /> Delete</button>
            </div>,
          ])}
        />
      )}
    </div>
  );
}

// ─── Admin Videos ─────────────────────────────────────────────────────────────

const BLANK_VIDEO = { title: "", category: "Getting Started", duration: "", videoUrl: "", thumbnailColor: "#15283A", featured: false, isPublished: true, createdBy: "Admin" };
const THUMB_COLORS = [
  { label: "Navy",   value: "#15283A" },
  { label: "Amber",  value: "#824600" },
  { label: "Blue",   value: "#1e40af" },
  { label: "Green",  value: "#166534" },
  { label: "Purple", value: "#4c1d95" },
];

function AdminVideosTab() {
  const { data: videos, isLoading, refetch } = trpc.videos.listAll.useQuery();
  const create = trpc.videos.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm(BLANK_VIDEO); } });
  const update = trpc.videos.update.useMutation({ onSuccess: () => { refetch(); setEditId(null); } });
  const del    = trpc.videos.delete.useMutation({ onSuccess: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [form,     setForm]     = useState(BLANK_VIDEO);

  function openEdit(v: any) {
    setEditId(v.id);
    setForm({ title: v.title, category: v.category, duration: v.duration ?? "", videoUrl: v.videoUrl ?? "", thumbnailColor: v.thumbnailColor ?? "#15283A", featured: !!v.featured, isPublished: !!v.isPublished, createdBy: v.createdBy ?? "Admin" });
    setShowForm(false);
  }

  function saveForm() {
    if (editId) update.mutate({ id: editId, ...form });
    else        create.mutate(form);
  }

  if (isLoading) return <LoadingCard />;

  const isEditing = editId !== null;
  const formOpen  = showForm || isEditing;

  return (
    <div className="space-y-5">
      <SectionHeader title="Video Library" count={videos?.length} action={
        !formOpen && <PrimaryBtn onClick={() => { setShowForm(true); setForm(BLANK_VIDEO); setEditId(null); }}><Icon name="plus" size={13} /> Add Video</PrimaryBtn>
      } />

      {formOpen && (
        <div className="bg-white rounded-[12px] border border-amber/40 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sora font-semibold text-navy text-[13px]">{isEditing ? "Edit Video" : "Add Video"}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted hover:text-navy transition"><Icon name="x" size={15} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title *"><input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Video title" /></Field>
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {["Getting Started","Sales Tips","Product","Admin Guide"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Video URL"><input className={inputCls} value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." /></Field>
            <Field label="Duration"><input className={inputCls} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="12:05" /></Field>
            <Field label="Thumbnail Color">
              <div className="flex gap-2">
                {THUMB_COLORS.map((tc) => (
                  <button
                    key={tc.value}
                    onClick={() => setForm((f) => ({ ...f, thumbnailColor: tc.value }))}
                    className={`w-7 h-7 rounded-lg border-2 transition ${form.thumbnailColor === tc.value ? "border-amber scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ background: tc.value }}
                    title={tc.label}
                  />
                ))}
              </div>
            </Field>
            <Field label="Options">
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-navy">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-amber" />
                  Featured
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-navy">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="accent-navy" />
                  Published
                </label>
              </div>
            </Field>
          </div>
          {(create.isError || update.isError) && <p className="text-[12px] text-red-500 mt-3">{(create.error ?? update.error)?.message}</p>}
          <div className="flex items-center gap-2 mt-4">
            <PrimaryBtn onClick={saveForm} disabled={!form.title || create.isPending || update.isPending}>
              {(create.isPending || update.isPending) ? "Saving…" : isEditing ? "Save Changes" : "Add Video"}
            </PrimaryBtn>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-[13px] text-muted hover:text-navy px-3 transition">Cancel</button>
          </div>
        </div>
      )}

      {!videos?.length ? <EmptyState message="No videos yet. Add your first video." /> : (
        <DataTable
          headers={["Thumbnail", "Title", "Category", "Duration", "Views", "Status", "Actions"]}
          rows={videos.map((v) => [
            <div key="th" className="w-[50px] h-[30px] rounded-[5px] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${v.thumbnailColor ?? "#15283A"}, #0d1c28)` }}>
              <Icon name="video" size={11} className="text-white/60" />
            </div>,
            <div key="t">
              <p className="text-[13px] font-medium text-navy">{v.title}</p>
              {v.featured && <span className="text-[10px] text-amber font-semibold">★ Featured</span>}
            </div>,
            <span key="c" className="text-[12px] text-muted">{v.category}</span>,
            <span key="d" className="text-[12px] text-muted">{v.duration ?? "—"}</span>,
            <span key="vc">{v.viewCount ?? 0}</span>,
            <span key="s" className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${v.isPublished ? "bg-green-50 text-green-700 border-green-200" : "bg-surface text-muted border-border"}`}>{v.isPublished ? "Published" : "Draft"}</span>,
            <div key="ac" className="flex gap-1.5">
              <button onClick={() => openEdit(v)} className="inline-flex items-center gap-1 text-[11px] border border-border px-2 py-1 rounded-[5px] hover:border-navy transition"><Icon name="edit" size={11} /> Edit</button>
              <button onClick={() => del.mutate({ id: v.id })} className="inline-flex items-center gap-1 text-[11px] border border-red-200 text-red-600 bg-red-50 px-2 py-1 rounded-[5px] hover:bg-red-100 transition"><Icon name="trash" size={11} /> Delete</button>
            </div>,
          ])}
        />
      )}
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
