/**
 * RepDashboard.tsx — Wibiz Agent Portal
 * Sidebar layout matching dashboard.html mockup.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { COMMISSION_SUMMARY } from "../lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "leads" | "team" | "commissions" | "certification" | "invite";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function Ic({ d, size = 15 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICON: Record<string, string> = {
  overview:      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6",
  leads:         "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
  team:          "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
  commissions:   "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
  certification: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  invite:        "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  logout:        "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  chevronDown:   "M19 9l-7 7-7-7",
  bell:          "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  search:        "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  plus:          "M12 4v16m8-8H4",
  check:         "M5 13l4 4L19 7",
  award:         "M12 15l-4 4 1-5L5 9l5-1 2-5 2 5 5 1-4 5 1 5z",
};

function NavIcon({ id }: { id: string }) {
  return <Ic d={ICON[id] ?? ICON.overview} size={15} />;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { id: "overview"     as Tab, label: "Overview"      },
      { id: "leads"        as Tab, label: "My Leads"      },
      { id: "team"         as Tab, label: "My Team"       },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "commissions"   as Tab, label: "Commissions"  },
      { id: "certification" as Tab, label: "Certification"},
      { id: "invite"        as Tab, label: "Invite"       },
    ],
  },
];

// ─── Initials helper ──────────────────────────────────────────────────────────

function initials(name: string | null | undefined, fallback = "?"): string {
  if (!name) return fallback.charAt(0).toUpperCase();
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function RepDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: me, isLoading } = trpc.rep.me.useQuery();
  const logout = trpc.rep.logout.useMutation({ onSuccess: () => navigate("/login") });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="w-6 h-6 border-2 border-navy-100 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }
  if (!me) { navigate("/login"); return null; }

  const displayName = me.legalFullName ?? me.email;

  return (
    <div className="flex h-screen bg-surface font-dm overflow-hidden">

      {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:relative z-30 flex flex-col h-screen bg-navy w-[224px] min-w-[224px]
        transition-transform duration-200 lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
      `}>

        {/* Logo */}
        <div className="px-5 py-[22px] border-b border-white/[0.08] shrink-0">
          <img src="/images/wibiz-white.png" alt="Wibiz" className="h-8 w-auto object-contain opacity-90" />
        </div>

        {/* Agent card */}
        <div className="mx-4 mt-3.5 mb-1 bg-amber/10 border border-amber/20 rounded-[10px] p-3 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber to-amber-dark flex items-center justify-center font-sora font-bold text-[11px] text-white shrink-0">
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white leading-snug truncate">{displayName}</p>
            <p className="text-[10px] text-amber font-normal">{me.repCode}</p>
          </div>
        </div>

        {/* Nav groups */}
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="py-1.5">
            <p className="px-5 pt-2.5 pb-1 text-[10px] font-semibold tracking-[1px] uppercase text-white/25">
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`
                  relative w-full flex items-center gap-2.5 px-5 py-[9px] text-[13px] text-left
                  transition-all duration-[120ms] font-dm
                  ${tab === item.id
                    ? "bg-amber/[0.12] text-white font-medium"
                    : "text-white/55 hover:text-white hover:bg-white/5"}
                `}
              >
                {/* Active left bar */}
                {tab === item.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-amber rounded-r-[3px]" />
                )}
                <span className={tab === item.id ? "opacity-100" : "opacity-75"}>
                  <NavIcon id={item.id} />
                </span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-auto px-4 py-3.5 border-t border-white/[0.07] shrink-0 space-y-2">
          {/* Status pill */}
          <div className="flex items-center gap-2 bg-green-500/[0.08] border border-green-500/20 rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-white/60">Portal active</span>
          </div>
          {/* Sign out */}
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-white/40 hover:text-white/70 transition rounded-lg hover:bg-white/5"
          >
            <NavIcon id="logout" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* ── TOPBAR ────────────────────────────────────────────────────── */}
        <header className="bg-white border-b border-border h-14 px-6 flex items-center gap-3 shrink-0">

          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden text-muted hover:text-navy mr-1"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Page title (desktop) */}
          <div className="hidden sm:block">
            <p className="font-sora text-[13px] font-semibold text-navy capitalize">
              {tab.replace(/_/g, " ")}
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Agent level chip */}
          <div className="hidden sm:flex items-center gap-1.5 bg-amber/[0.08] border border-amber/20 rounded-full px-3 py-1">
            <span className="text-[11px] font-semibold text-amber-dark">{me.agentLevel}</span>
          </div>

          {/* Notification bell */}
          <button className="relative w-[34px] h-[34px] rounded-lg border border-border bg-white flex items-center justify-center text-muted hover:border-navy transition">
            <NavIcon id="bell" />
            <span className="absolute top-[7px] right-[7px] w-1.5 h-1.5 rounded-full bg-amber border-[1.5px] border-white" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 pl-1 border border-border rounded-lg px-3 py-1.5 cursor-default hover:border-navy transition">
            <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-amber to-amber-dark flex items-center justify-center text-[10px] font-bold text-white">
              {initials(displayName)}
            </div>
            <div className="hidden sm:block">
              <p className="text-[12px] font-medium text-navy leading-none">{displayName.split(" ")[0]}</p>
              <p className="text-[10px] text-muted leading-none mt-0.5 font-mono">{me.repCode}</p>
            </div>
            <span className="text-light ml-0.5"><Ic d={ICON.chevronDown} size={12} /></span>
          </div>
        </header>

        {/* ── CONTENT ───────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === "overview"      && <OverviewTab me={me} />}
          {tab === "leads"         && <LeadsTab />}
          {tab === "team"          && <TeamTab repCode={me.repCode} />}
          {tab === "commissions"   && <CommissionsTab />}
          {tab === "certification" && <CertificationTab />}
          {tab === "invite"        && <InviteTab repCode={me.repCode} />}
        </main>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ me }: {
  me: { repCode: string; agentLevel: string; email: string; legalFullName?: string | null }
}) {
  const { data: summary } = trpc.commission.mySummary.useQuery();

  const metrics = [
    {
      label: "Total Commissions",
      value: `$${(summary?.total ?? 0).toFixed(2)}`,
      trend: null,
      color: "#2563eb",
      pct: 60,
    },
    {
      label: "Paid Out",
      value: `$${(summary?.paid ?? 0).toFixed(2)}`,
      trend: null,
      color: "#22c55e",
      pct: 40,
    },
    {
      label: "Pending",
      value: `$${(summary?.pending ?? 0).toFixed(2)}`,
      trend: null,
      color: "#FF8900",
      pct: 25,
    },
  ];

  return (
    <div className="space-y-5">

      {/* Welcome row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sora text-[18px] font-bold text-navy">
            Good morning, {(me.legalFullName ?? me.email).split(" ")[0]}
          </h2>
          <p className="text-[12px] text-muted mt-0.5">Here's what's happening with your account.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-1.5">
          <span className="text-[12px] text-muted">{new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-border shadow-card p-4 flex items-center justify-between hover:-translate-y-0.5 transition-transform cursor-default">
            <div>
              <p className="text-[11px] text-muted mb-1">{m.label}</p>
              <p className="font-sora text-[20px] font-bold text-navy leading-none">{m.value}</p>
            </div>
            {/* Mini ring */}
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="16" fill="none" stroke="#f0f2f5" strokeWidth="4" />
              <circle cx="22" cy="22" r="16" fill="none" stroke={m.color} strokeWidth="4"
                strokeLinecap="round" strokeDasharray="100"
                strokeDashoffset={100 - m.pct}
                transform="rotate(-90 22 22)"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Commission rates */}
      <div className="bg-white rounded-xl border border-border shadow-card">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div>
            <p className="font-sora text-[13px] font-semibold text-navy">Your Commission Rates</p>
            <p className="text-[11px] text-muted mt-0.5">Based on your current agent level</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {COMMISSION_SUMMARY.map((row) => {
            const active = me.agentLevel === row.level;
            return (
              <div
                key={row.level}
                className={`rounded-xl p-3 border text-center transition ${
                  active
                    ? "bg-navy border-navy shadow-md"
                    : "bg-surface border-border"
                }`}
              >
                <p className={`text-[10px] mb-1 truncate ${active ? "text-white/60" : "text-muted"}`}>{row.level}</p>
                <p className={`font-sora text-[20px] font-bold ${active ? "text-amber" : "text-amber"}`}>{row.setup}</p>
                <p className={`text-[10px] ${active ? "text-white/50" : "text-muted"}`}>setup</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────

function LeadsTab() {
  const { data: myLeads, isLoading } = trpc.rep.myLeads.useQuery();

  if (isLoading) return <CardLoader />;

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div>
          <p className="font-sora text-[13px] font-semibold text-navy">My Attributed Leads</p>
          <p className="text-[11px] text-muted mt-0.5">{myLeads?.length ?? 0} leads attributed to your code</p>
        </div>
      </div>

      {!myLeads?.length ? (
        <EmptyState icon={ICON.leads} text="No leads yet. Share your referral link to start attributing leads." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                {["Name", "Email", "Stage", "Attribution", "Created"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-surface transition-colors cursor-default">
                  <td className="px-5 py-3 font-medium text-navy text-[13px]">
                    {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email || "—"}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-muted">{lead.email || "—"}</td>
                  <td className="px-5 py-3 text-[12px] text-muted capitalize">{lead.currentStage?.replace(/_/g, " ") || "—"}</td>
                  <td className="px-5 py-3"><AttributionBadge status={lead.attributionStatus ?? "unresolved"} /></td>
                  <td className="px-5 py-3 text-[11px] text-muted">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
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

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamTab({ repCode }: { repCode: string }) {
  const { data: downline, isLoading } = trpc.rep.downline.useQuery({ repCode });

  if (isLoading) return <CardLoader />;

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="font-sora text-[13px] font-semibold text-navy">Direct Downline</p>
        <p className="text-[11px] text-muted mt-0.5">{downline?.length ?? 0} agents in your direct team</p>
      </div>

      {!downline?.length ? (
        <EmptyState icon={ICON.team} text="No downline yet. Share your invite link to recruit agents." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                {["Rep Code", "Name", "Level", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {downline.map((rep) => (
                <tr key={rep.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-surface transition-colors cursor-default">
                  <td className="px-5 py-3">
                    <span className="font-mono text-[11px] bg-amber/[0.08] text-amber-dark border border-amber/20 px-2 py-0.5 rounded-md font-semibold">
                      {rep.repCode}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-navy font-medium">{rep.legalFullName ?? rep.email}</td>
                  <td className="px-5 py-3 text-[12px] text-muted">{rep.agentLevel}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      rep.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                    }`}>
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

  if (isLoading) return <CardLoader />;

  const statusStyles: Record<string, string> = {
    pending:  "bg-[#FEF3C7] text-[#D97706]",
    approved: "bg-[#EFF6FF] text-[#1D4ED8]",
    paid:     "bg-[#F0FDF4] text-[#16A34A]",
    rejected: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="font-sora text-[13px] font-semibold text-navy">Commission History</p>
        <p className="text-[11px] text-muted mt-0.5">{commissions?.length ?? 0} commission records</p>
      </div>

      {!commissions?.length ? (
        <EmptyState icon={ICON.commissions} text="No commissions yet. Commissions are created when a lead converts." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                {["Date", "Type", "Amount", "Rate", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-surface transition-colors cursor-default">
                  <td className="px-5 py-3 text-[12px] text-muted">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-navy capitalize">{c.type}</td>
                  <td className="px-5 py-3 font-sora text-[14px] font-bold text-navy">
                    ${parseFloat(c.amount).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-muted">
                    {(parseFloat(c.rate) * 100).toFixed(0)}%
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                      statusStyles[c.status ?? "pending"] ?? "bg-gray-100 text-gray-500"
                    }`}>
                      {c.status ?? "pending"}
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

// ─── Certification ────────────────────────────────────────────────────────────

function CertificationTab() {
  const { data: status }    = trpc.certification.myStatus.useQuery();
  const { data: questions } = trpc.certification.getQuiz.useQuery(undefined, { enabled: !status?.certified });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult]   = useState<{ passed: boolean; score: number; total: number } | null>(null);

  const submit   = trpc.certification.submitQuiz.useMutation({ onSuccess: (d) => setResult(d) });
  const activate = trpc.certification.activateKickstart.useMutation();

  if (status?.certified) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber to-amber-dark flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICON.award} />
            </svg>
          </div>
          <div>
            <h3 className="font-sora text-[16px] font-bold text-navy">Scale360 Certified</h3>
            <p className="text-[13px] text-muted mt-0.5">
              Passed {status.passedAt ? new Date(status.passedAt).toLocaleDateString() : ""} · Score: {status.score}/10
            </p>
          </div>
        </div>
        <button
          onClick={() => activate.mutate()}
          disabled={activate.isPending}
          className="bg-navy text-white px-5 py-2.5 rounded-[8px] text-[13px] font-semibold font-sora hover:bg-navy-light transition disabled:opacity-50"
        >
          {activate.isPending ? "Activating…" : "Activate Kickstart Access"}
        </button>
        {activate.isSuccess && <p className="text-[13px] text-green-600">Kickstart account provisioned.</p>}
        {activate.isError   && <p className="text-[13px] text-red-500">{activate.error.message}</p>}
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-card p-10 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? "bg-green-100" : "bg-amber/10"}`}>
          <span className="text-2xl">{result.passed ? "🎉" : "📝"}</span>
        </div>
        <h3 className="font-sora text-[20px] font-bold text-navy mb-1">{result.passed ? "You passed!" : "Not quite yet"}</h3>
        <p className="text-[13px] text-muted">
          Score: {result.score}/{result.total} · {Math.round((result.score / result.total) * 100)}%
          {!result.passed && " — 80% required to pass"}
        </p>
        {!result.passed && (
          <button onClick={() => { setResult(null); setAnswers({}); }}
            className="mt-5 text-[13px] font-semibold text-amber hover:opacity-75 underline">
            Retake quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-card">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="font-sora text-[13px] font-semibold text-navy">Scale360 Certification Quiz</p>
        <p className="text-[11px] text-muted mt-0.5">10 questions · 80% to pass</p>
      </div>
      <div className="p-5 space-y-5">
        {questions?.map((q) => (
          <div key={q.id} className="pb-4 border-b border-[#f5f5f5] last:border-0">
            <p className="text-[13px] font-semibold text-navy mb-2.5">{q.id}. {q.question}</p>
            <div className="space-y-1.5">
              {q.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg transition ${
                  answers[String(q.id)] === i ? "bg-navy/5 border border-navy/10" : "hover:bg-surface"
                }`}>
                  <input type="radio" name={`q${q.id}`} value={i}
                    checked={answers[String(q.id)] === i}
                    onChange={() => setAnswers((a) => ({ ...a, [String(q.id)]: i }))}
                    className="accent-navy" />
                  <span className="text-[13px] text-navy">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={() => submit.mutate({ answers })}
          disabled={submit.isPending || Object.keys(answers).length < (questions?.length ?? 10)}
          className="bg-navy text-white px-6 py-2.5 rounded-[8px] text-[13px] font-semibold font-sora hover:bg-navy-light transition disabled:opacity-50"
        >
          {submit.isPending ? "Submitting…" : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}

// ─── Invite ───────────────────────────────────────────────────────────────────

function InviteTab({ repCode }: { repCode: string }) {
  const associateLink = `${window.location.origin}/join-agent?ref=${repCode}&level=Associate`;
  const agencyLink    = `${window.location.origin}/join-agent?ref=${repCode}&level=Agency`;
  const referralLink  = `https://scale360.wibiz.ai/?ref=${repCode}`;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-card">
        <div className="px-5 py-3.5 border-b border-border">
          <p className="font-sora text-[13px] font-semibold text-navy">Invite Links</p>
          <p className="text-[11px] text-muted mt-0.5">Share these links to grow your team and attribute leads</p>
        </div>
        <div className="p-5 space-y-3">
          <InviteLinkCard label="Invite an Associate"  url={associateLink} />
          <InviteLinkCard label="Invite an Agency"     url={agencyLink} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-card p-5">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Your Scale360 Referral Link</p>
        <div className="flex items-center gap-3 bg-surface rounded-lg px-4 py-3 border border-border">
          <p className="font-mono text-[13px] text-navy break-all flex-1">{referralLink}</p>
          <CopyBtn text={referralLink} />
        </div>
        <p className="text-[11px] text-muted mt-2.5">
          Leads visiting <span className="text-amber font-medium">start.wibiz.ai/?ref={repCode}</span> will be automatically attributed to you.
        </p>
      </div>
    </div>
  );
}

function InviteLinkCard({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center gap-4 bg-surface rounded-lg px-4 py-3 border border-border">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-navy">{label}</p>
        <p className="text-[11px] text-muted font-mono truncate mt-0.5">{url}</p>
      </div>
      <CopyBtn text={url} />
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition
        ${copied ? "bg-green-50 text-green-700 border-green-200" : "bg-amber text-white border-transparent hover:bg-amber-dark"}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function AttributionBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    resolved:    "bg-[#F0FDF4] text-[#16A34A]",
    unresolved:  "bg-[#FEF3C7] text-[#D97706]",
    no_rep_code: "bg-[#F5F5F5] text-[#6B7280]",
  };
  const labels: Record<string, string> = {
    resolved:    "Attributed",
    unresolved:  "Unresolved",
    no_rep_code: "No Code",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="p-10 flex flex-col items-center text-center gap-3">
      <div className="w-11 h-11 rounded-full bg-navy/[0.05] flex items-center justify-center text-navy/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </div>
      <p className="text-[13px] text-muted max-w-[260px] leading-relaxed">{text}</p>
    </div>
  );
}

function CardLoader() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-10 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-navy-100 border-t-navy rounded-full animate-spin" />
    </div>
  );
}
