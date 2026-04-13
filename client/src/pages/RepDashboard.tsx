/**
 * RepDashboard.tsx — Wibiz Agent Portal (full redesign matching dashboard.html)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { COMMISSION_SUMMARY } from "../lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "leads" | "team" | "commissions" | "certification" | "invite" | "videos" | "events";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function Ic({ d, size = 15, className }: { d: string | string[]; size?: number; className?: string }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ICON: Record<string, string | string[]> = {
  overview:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  leads:         ["M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"],
  team:          "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
  commissions:   "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
  certification: ["M9 12l2 2 4-4", "M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"],
  invite:        "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  videos:        ["M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14", "M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"],
  events:        ["M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"],
  logout:        "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  chevDown:      "M19 9l-7 7-7-7",
  bell:          ["M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5", "M13.73 21a2 2 0 01-3.46 0"],
  search:        "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  play:          "M5 3l14 9-14 9V3z",
  award:         "M12 15l-4 4 1-5L5 9l5-1 2-5 2 5 5 1-4 5 1 5z",
  check:         "M5 13l4 4L19 7",
  plus:          "M12 4v16m8-8H4",
  eye:           ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"],
  copy:          ["M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2", "M16 4h2a2 2 0 012 2v12a2 2 0 01-2 2h-2M8 4v0a2 2 0 012-2h4a2 2 0 012 2v0"],
  external:      ["M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6", "M15 3h6m0 0v6m0-6L10 14"],
};

function NavIcon({ id }: { id: string }) {
  const d = ICON[id] ?? ICON.overview;
  return <Ic d={d as string} size={15} />;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_GROUPS: { label: string; items: { id: Tab; label: string; badge?: number }[] }[] = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "My Homepage"   },
      { id: "leads",    label: "My Leads"      },
      { id: "team",     label: "My Team"       },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "commissions", label: "Commissions" },
    ],
  },
  {
    label: "Learn",
    items: [
      { id: "videos",        label: "Video Library"   },
      { id: "events",        label: "Events"          },
      { id: "certification", label: "Certification"   },
      { id: "invite",        label: "Invite & Recruit"},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string | null | undefined, fallback = "?"): string {
  if (!name) return fallback.charAt(0).toUpperCase();
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function RepDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: me, isLoading } = trpc.rep.me.useQuery();
  const logout = trpc.rep.logout.useMutation({ onSuccess: () => navigate("/login") });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }
  if (!me) { navigate("/login"); return null; }

  const displayName = me.legalFullName ?? me.email;

  return (
    <div className="flex h-screen bg-surface font-dm overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber to-[#824600] flex items-center justify-center font-sora font-bold text-[11px] text-white shrink-0">
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
                {tab === item.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-amber rounded-r-[3px]" />
                )}
                <span className={tab === item.id ? "opacity-100" : "opacity-75"}>
                  <NavIcon id={item.id} />
                </span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-amber text-white text-[10px] font-bold px-[7px] py-[2px] rounded-full leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-auto px-4 py-3.5 border-t border-white/[0.07] shrink-0 space-y-2">
          <div className="flex items-center gap-2 bg-green-500/[0.08] border border-green-500/20 rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-white/60">Portal active</span>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-white/40 hover:text-white/70 transition rounded-lg hover:bg-white/5"
          >
            <NavIcon id="logout" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-border h-14 px-6 flex items-center gap-3 shrink-0">
          <button className="lg:hidden text-muted hover:text-navy mr-1" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-[280px]">
            <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-light pointer-events-none">
              <Ic d={ICON.search as string} size={14} />
            </span>
            <input
              type="text"
              placeholder="Search leads, events, videos…"
              className="w-full h-[34px] border border-border rounded-[8px] pl-[32px] pr-3 text-[13px] text-navy bg-surface placeholder-light outline-none focus:border-amber transition-[border-color]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <button className="relative w-[34px] h-[34px] rounded-lg border border-border bg-white flex items-center justify-center text-muted hover:border-navy transition">
              <NavIcon id="bell" />
              <span className="absolute top-[7px] right-[7px] w-1.5 h-1.5 rounded-full bg-amber border-[1.5px] border-white" />
            </button>

            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 cursor-default hover:border-navy transition">
              <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-amber to-[#824600] flex items-center justify-center text-[10px] font-bold text-white">
                {initials(displayName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-medium text-navy leading-none">{displayName.split(" ")[0]}</p>
                <p className="text-[10px] text-muted leading-none mt-0.5">{me.agentLevel}</p>
              </div>
              <span className="text-light ml-0.5"><Ic d={ICON.chevDown as string} size={12} /></span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === "overview"      && <OverviewTab me={me} onTabChange={setTab} />}
          {tab === "leads"         && <LeadsTab />}
          {tab === "team"          && <TeamTab repCode={me.repCode} />}
          {tab === "commissions"   && <CommissionsTab />}
          {tab === "certification" && <CertificationTab />}
          {tab === "invite"        && <InviteTab repCode={me.repCode} />}
          {tab === "videos"        && <VideosTab />}
          {tab === "events"        && <EventsTab />}
        </main>
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

const DUMMY_LEADS = [
  { name: "Sarah Mitchell", initials: "SM", status: "Closing",    priority: "High", value: "$18.4k", color: "from-blue-500 to-blue-700",   dot: "bg-amber"      },
  { name: "David Chen",     initials: "DC", status: "Proposal",   priority: "High", value: "$9.2k",  color: "from-green-500 to-green-700",  dot: "bg-green-500"  },
  { name: "Amanda Torres",  initials: "AT", status: "In Contact",  priority: "Med",  value: "$6.5k",  color: "from-purple-500 to-purple-700", dot: "bg-amber"      },
  { name: "Robert Kim",     initials: "RK", status: "New",         priority: "Med",  value: "$12k",   color: "from-orange-400 to-orange-600", dot: "bg-blue-500"   },
];

const DUMMY_PIPELINE = [
  { stage: "New",        pct: 80, count: 19, color: "bg-blue-300" },
  { stage: "In Contact", pct: 55, count: 13, color: "bg-red-300"  },
  { stage: "Proposal",   pct: 35, count: 8,  color: "bg-emerald-300" },
  { stage: "Closing",    pct: 22, count: 5,  color: "bg-amber"    },
  { stage: "Nurture",    pct: 10, count: 2,  color: "bg-purple-300" },
];

const INITIAL_TASKS = [
  { id: 1, text: "Send proposal — David Chen",      time: "9:00 AM", done: true,  badge: "Done",   badgeCls: "bg-green-50 text-green-700"  },
  { id: 2, text: "Call Sarah Mitchell · closing docs", time: "2:30 PM", done: false, badge: "Urgent", badgeCls: "bg-red-50 text-red-600"     },
  { id: 3, text: "Discovery call · Amanda Torres",  time: "4:00 PM", done: false, badge: "Soon",   badgeCls: "bg-amber/10 text-[#824600]"  },
  { id: 4, text: "Update pipeline — Robert Kim",    time: "EOD",     done: false, badge: "Later",  badgeCls: "bg-surface text-muted"        },
];

// Mini calendar data
const CAL_DAYS = [
  [null,null,null,1,2,3,4],
  [5,6,7,8,9,10,11],
  [12,13,14,15,16,17,18],
  [19,20,21,22,23,24,25],
  [26,27,28,29,30,null,null],
];
const CAL_EVENT_DAYS = new Set([3, 15, 23]);

function OverviewTab({ me, onTabChange }: {
  me: { repCode: string; agentLevel: string; email: string; legalFullName?: string | null };
  onTabChange: (t: Tab) => void;
}) {
  const { data: summary } = trpc.commission.mySummary.useQuery();
  const { data: events }  = trpc.events.list.useQuery();
  const { data: videos }  = trpc.videos.list.useQuery();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [videoTab, setVideoTab] = useState("All");
  const [calMonth]        = useState("April 2026");
  const today = 13;

  const firstName = (me.legalFullName ?? me.email).split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const metrics = [
    { label: "Active Leads",        value: "47",                                          trend: "↑ 8 this week",    trendCls: "text-green-600",  color: "#2563eb", pct: 65 },
    { label: "Conversions",         value: "14",                                          trend: "↑ 3 vs last mo.",  trendCls: "text-green-600",  color: "#22c55e", pct: 45 },
    { label: "Pending Commission",  value: `$${(summary?.pending ?? 0).toFixed(0)}`,      trend: "⏱ Closes Apr 21",  trendCls: "text-amber",      color: "#FF8900", pct: 30 },
    { label: "Ready to Close",      value: `$${(summary?.total ?? 0).toFixed(0)}`,        trend: "↑ 45% vs last wk", trendCls: "text-green-600",  color: "#7c3aed", pct: 80 },
  ];

  const VIDEO_CATS = ["All", "Getting Started", "Sales Tips", "Product"];
  const featured = videos?.find((v) => v.featured) ?? videos?.[0];
  const listVideos = videos?.filter((v) => !v.featured && (videoTab === "All" || v.category === videoTab)).slice(0, 4) ?? [];

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((t) => t.id === id
      ? { ...t, done: !t.done, badge: !t.done ? "Done" : "Soon", badgeCls: !t.done ? "bg-green-50 text-green-700" : "bg-amber/10 text-[#824600]" }
      : t
    ));
  }

  return (
    <div className="space-y-4">

      {/* Welcome row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sora text-[18px] font-bold text-navy">{greeting}, {firstName} 👋</h2>
          <p className="text-[12px] text-muted mt-0.5">
            {DUMMY_LEADS.filter(l => l.status === "Closing").length} hot leads ready to close &middot; {events?.length ?? 0} upcoming events &middot; Commission closes in 8 days
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-1.5 shrink-0">
          <span className="text-[12px] text-muted">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-border shadow-card p-4 flex items-center justify-between hover:-translate-y-0.5 transition-transform cursor-default">
            <div>
              <p className="text-[11px] text-muted mb-1">{m.label}</p>
              <p className="font-sora text-[20px] font-bold text-navy leading-none">{m.value}</p>
              <p className={`text-[10px] mt-1 ${m.trendCls}`}>{m.trend}</p>
            </div>
            <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
              <circle cx="22" cy="22" r="16" fill="none" stroke="#f0f2f5" strokeWidth="4" />
              <circle cx="22" cy="22" r="16" fill="none" stroke={m.color} strokeWidth="4"
                strokeLinecap="round" strokeDasharray="100"
                strokeDashoffset={100 - m.pct}
                transform="rotate(-90 22 22)" />
            </svg>
          </div>
        ))}
      </div>

      {/* Two-column grid: main + right sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_284px] gap-4">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">

          {/* VIDEO WALKTHROUGHS */}
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <p className="font-sora text-[13px] font-semibold text-navy">Video Walkthroughs</p>
                <p className="text-[11px] text-muted mt-0.5">Training & guides from your team</p>
              </div>
              <button onClick={() => onTabChange("videos")} className="text-[12px] font-medium text-amber hover:opacity-75 transition">
                View all →
              </button>
            </div>

            {/* Video category tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-2">
              {VIDEO_CATS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVideoTab(cat)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full transition ${
                    videoTab === cat ? "bg-navy text-white" : "text-muted hover:text-navy"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured video */}
            {featured && (
              <div
                className="mx-4 mb-3 rounded-xl overflow-hidden cursor-pointer relative"
                style={{ background: `linear-gradient(135deg, ${featured.thumbnailColor ?? "#15283A"}, #0d1c28)` }}
                onClick={() => featured.videoUrl ? window.open(featured.videoUrl, "_blank") : onTabChange("videos")}
              >
                {/* Glow overlays */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,137,0,0.12), transparent 60%)" }} />
                </div>
                <div className="relative z-10 p-4 flex items-end" style={{ minHeight: 120 }}>
                  <div className="flex-1">
                    <span className="inline-block text-[9px] font-bold tracking-[1px] uppercase bg-amber text-white px-2 py-0.5 rounded-full mb-2">
                      {featured.featured ? "Featured · New" : featured.category}
                    </span>
                    <p className="font-sora text-[13px] font-bold text-white leading-snug mb-1 line-clamp-2">{featured.title}</p>
                    <p className="text-[10px] text-white/50">{featured.duration} · Posted by {featured.createdBy ?? "Admin"} · {featured.viewCount} views</p>
                    {/* Progress bar */}
                    <div className="h-[3px] bg-white/10 rounded-full mt-2 w-full">
                      <div className="h-full bg-amber rounded-full" style={{ width: "33%" }} />
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber/90 flex items-center justify-center ml-4 shrink-0 hover:bg-amber transition">
                    <Ic d={ICON.play as string} size={16} className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Video list */}
            <div className="divide-y divide-[#f5f5f5]">
              {(listVideos.length ? listVideos : videos?.slice(1, 5) ?? []).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface cursor-pointer transition-colors"
                  onClick={() => v.videoUrl ? window.open(v.videoUrl, "_blank") : onTabChange("videos")}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-[70px] h-[42px] rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${v.thumbnailColor ?? "#15283A"}, #0d1c28)` }}
                  >
                    <div className="w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center">
                      <Ic d={ICON.play as string} size={10} className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-navy truncate">{v.title}</p>
                    <p className="text-[10px] text-muted mt-0.5">{v.duration} · {v.category}</p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    v.featured ? "bg-amber/10 text-amber" : "bg-blue-50 text-blue-600"
                  }`}>
                    {v.featured ? "New" : "Watch"}
                  </span>
                </div>
              ))}
              {!videos?.length && (
                <p className="px-4 py-4 text-[12px] text-muted">No videos published yet.</p>
              )}
            </div>
          </div>

          {/* TWO-COL: Pipeline + Hot Leads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pipeline */}
            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div>
                  <p className="font-sora text-[13px] font-semibold text-navy">My Pipeline</p>
                  <p className="text-[11px] text-muted mt-0.5">47 leads by stage</p>
                </div>
                <button onClick={() => onTabChange("leads")} className="text-[12px] font-medium text-amber hover:opacity-75 transition">View all →</button>
              </div>
              <div className="p-4 space-y-2.5">
                {DUMMY_PIPELINE.map((row) => (
                  <div key={row.stage} className="flex items-center gap-2.5 cursor-pointer group">
                    <span className="text-[11px] text-muted w-[72px] shrink-0 group-hover:text-navy transition">{row.stage}</span>
                    <div className="flex-1 h-[28px] bg-surface rounded-[6px] overflow-hidden">
                      <div className={`h-full ${row.color} rounded-[6px] flex items-center px-2.5 transition-all`} style={{ width: `${row.pct}%` }}>
                        <span className="text-[10px] font-semibold text-white/90 whitespace-nowrap">{row.count}</span>
                      </div>
                    </div>
                    <span className="text-[12px] font-semibold text-navy w-5 text-right shrink-0">{row.count}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-4">
                <p className="text-[10px] text-muted uppercase tracking-wide">Total value</p>
                <p className="font-sora text-[22px] font-bold text-navy leading-tight">$237,000</p>
              </div>
            </div>

            {/* Hot Leads */}
            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div>
                  <p className="font-sora text-[13px] font-semibold text-navy">Hot Leads</p>
                  <p className="text-[11px] text-muted mt-0.5">Needs attention today</p>
                </div>
                <button onClick={() => onTabChange("leads")} className="text-[12px] font-medium text-amber hover:opacity-75 transition">View all →</button>
              </div>
              <div className="divide-y divide-[#f5f5f5]">
                {DUMMY_LEADS.map((lead) => (
                  <div key={lead.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface cursor-pointer transition-colors">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${lead.color} flex items-center justify-center font-sora font-bold text-[10px] text-white shrink-0`}>
                      {lead.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-navy">{lead.name}</p>
                      <p className="text-[10px] text-muted">{lead.status} · {lead.priority}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sora text-[12px] font-bold text-navy">{lead.value}</p>
                      <span className={`w-[6px] h-[6px] rounded-full ${lead.dot} inline-block mt-1`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-4">

          {/* Mini Calendar */}
          <div className="bg-white rounded-xl border border-border shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sora text-[13px] font-semibold text-navy">{calMonth}</p>
              <div className="flex gap-1">
                {["<", ">"].map((a) => (
                  <button key={a} className="w-6 h-6 rounded-md border border-border text-muted text-[11px] font-bold hover:border-navy transition flex items-center justify-center">
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="text-[10px] font-semibold text-muted pb-1">{d}</div>
              ))}
              {CAL_DAYS.flat().map((day, i) => (
                <div
                  key={i}
                  className={`relative h-7 w-full flex items-center justify-center text-[12px] rounded-lg cursor-pointer transition
                    ${!day ? "" : day === today ? "bg-navy text-white font-bold" : "text-navy hover:bg-surface"}
                  `}
                >
                  {day}
                  {day && CAL_EVENT_DAYS.has(day) && day !== today && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full bg-amber" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="font-sora text-[13px] font-semibold text-navy">Upcoming Events</p>
                <p className="text-[10px] text-muted mt-0.5">Admin-managed · View & join only</p>
              </div>
              <button onClick={() => onTabChange("events")} className="text-[12px] font-medium text-amber hover:opacity-75 transition">View all →</button>
            </div>
            <div className="divide-y divide-[#f5f5f5]">
              {(events ?? []).slice(0, 3).map((ev) => (
                <EventCard key={ev.id} ev={ev} compact />
              ))}
              {!events?.length && <p className="px-4 py-4 text-[12px] text-muted">No upcoming events.</p>}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="font-sora text-[13px] font-semibold text-navy">Today's Tasks</p>
              <button className="w-[26px] h-[26px] rounded-lg bg-navy flex items-center justify-center hover:bg-navy-light transition">
                <Ic d={ICON.plus as string} size={12} className="text-white" />
              </button>
            </div>
            <div className="divide-y divide-[#f5f5f5]">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface cursor-pointer transition-colors"
                  onClick={() => toggleTask(task.id)}
                >
                  {/* Checkbox */}
                  <div className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition ${
                    task.done ? "bg-navy border-navy" : "border-border hover:border-navy"
                  }`}>
                    {task.done && <Ic d={ICON.check as string} size={9} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-medium truncate ${task.done ? "line-through text-muted" : "text-navy"}`}>
                      {task.text}
                    </p>
                    <p className="text-[10px] text-muted">{task.time}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${task.badgeCls}`}>
                    {task.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
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
              <div key={row.level} className={`rounded-xl p-3 border text-center transition ${
                active ? "bg-navy border-navy shadow-md" : "bg-surface border-border"
              }`}>
                <p className={`text-[10px] mb-1 truncate ${active ? "text-white/60" : "text-muted"}`}>{row.level}</p>
                <p className="font-sora text-[20px] font-bold text-amber">{row.setup}</p>
                <p className={`text-[10px] ${active ? "text-white/50" : "text-muted"}`}>setup</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── EVENT CARD (used in overview + events tab) ───────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  purple: "bg-purple-100 text-purple-700",
  blue:   "bg-blue-100 text-blue-700",
  pink:   "bg-pink-100 text-pink-700",
  green:  "bg-green-100 text-green-700",
  amber:  "bg-amber/10 text-[#824600]",
};
const DATE_BOX_COLORS: Record<string, string> = {
  purple: "bg-blue-500",
  blue:   "bg-blue-500",
  pink:   "bg-pink-500",
  green:  "bg-green-500",
  amber:  "bg-amber",
};
const JOIN_BTN_COLORS: Record<string, string> = {
  zoom:      "bg-blue-600 hover:bg-blue-700",
  meet:      "bg-green-600 hover:bg-green-700",
  webinar:   "bg-amber hover:bg-[#824600]",
  in_person: "bg-navy hover:bg-navy-light",
};
const JOIN_LABELS: Record<string, string> = {
  zoom: "Join Zoom", meet: "Join Meeting", webinar: "Join Webinar", in_person: "View Details",
};

function EventCard({ ev, compact = false }: { ev: any; compact?: boolean }) {
  const d = new Date(ev.startsAt);
  const mon = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endStr  = ev.endsAt ? new Date(ev.endsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";
  const color   = ev.badgeColor ?? "blue";

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors cursor-default">
      {/* Date box */}
      <div className={`w-[38px] rounded-lg ${DATE_BOX_COLORS[color] ?? "bg-blue-500"} flex flex-col items-center py-1.5 shrink-0`}>
        <span className="text-[8px] font-bold uppercase text-white/80 leading-none">{mon}</span>
        <span className="font-sora text-[18px] font-bold text-white leading-none mt-0.5">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-navy leading-snug">{ev.title}</p>
        <p className="text-[10px] text-muted mt-0.5">
          {d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })} · {timeStr}{endStr ? ` – ${endStr}` : ""}
        </p>
        <p className="text-[10px] text-muted">{ev.attendeeCount} attending</p>
        {!compact && ev.description && (
          <p className="text-[11px] text-muted mt-1 line-clamp-2">{ev.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {ev.meetingUrl && (
            <a
              href={ev.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold text-white px-3 py-1 rounded-[6px] transition ${JOIN_BTN_COLORS[ev.platform] ?? "bg-navy"}`}
            >
              <Ic d={ICON.external as string} size={10} />
              {JOIN_LABELS[ev.platform] ?? "Join"}
            </a>
          )}
          {ev.badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE_COLORS[color] ?? "bg-blue-100 text-blue-700"}`}>
              {ev.badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── VIDEOS TAB ───────────────────────────────────────────────────────────────

function VideosTab() {
  const { data: videos, isLoading } = trpc.videos.list.useQuery();
  const incrementView = trpc.videos.incrementView.useMutation();
  const [activeTab, setActiveTab] = useState("All");
  const CATS = ["All", "Getting Started", "Sales Tips", "Product", "Admin Guide"];

  if (isLoading) return <CardLoader />;

  const filtered = videos?.filter((v) => activeTab === "All" || v.category === activeTab) ?? [];
  const featured = filtered.find((v) => v.featured) ?? filtered[0];
  const list = filtered.filter((v) => v.id !== featured?.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sora text-[17px] font-bold text-navy">Video Library</h2>
          <p className="text-[12px] text-muted mt-0.5">Training & guides from your team</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {CATS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`text-[12px] font-semibold px-4 py-1.5 rounded-full border transition ${
              activeTab === cat
                ? "bg-navy text-white border-navy"
                : "text-muted border-border hover:border-navy hover:text-navy"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <EmptyState icon={ICON.videos as string} text="No videos in this category yet." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
          {/* Featured */}
          {featured && (
            <div
              className="rounded-xl overflow-hidden cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${featured.thumbnailColor ?? "#15283A"}, #0d1c28)` }}
              onClick={() => { if (featured.videoUrl) { incrementView.mutate({ id: featured.id }); window.open(featured.videoUrl, "_blank"); } }}
            >
              <div className="relative p-6 flex items-end" style={{ minHeight: 200 }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 20%, rgba(255,137,0,0.12), transparent 60%)" }} />
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-bold tracking-[1.5px] uppercase bg-amber text-white px-2.5 py-1 rounded-full">
                      {featured.featured ? "Featured · New" : featured.category}
                    </span>
                  </div>
                  <p className="font-sora text-[18px] font-bold text-white leading-snug mb-1">{featured.title}</p>
                  <p className="text-[12px] text-white/50">{featured.duration} · {featured.createdBy ?? "Admin"} · {featured.viewCount} views</p>
                  <div className="h-[3px] bg-white/10 rounded-full mt-3 w-48">
                    <div className="h-full bg-amber rounded-full" style={{ width: "33%" }} />
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-amber/90 flex items-center justify-center shrink-0 ml-4 hover:bg-amber transition z-10">
                  <Ic d={ICON.play as string} size={20} className="text-white ml-1" />
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="bg-white rounded-xl border border-border shadow-card divide-y divide-[#f5f5f5]">
            {list.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface cursor-pointer transition-colors"
                onClick={() => { if (v.videoUrl) { incrementView.mutate({ id: v.id }); window.open(v.videoUrl, "_blank"); } }}
              >
                <div
                  className="w-[70px] h-[42px] rounded-lg flex items-center justify-center shrink-0 relative"
                  style={{ background: `linear-gradient(135deg, ${v.thumbnailColor ?? "#15283A"}, #0d1c28)` }}
                >
                  <div className="w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center">
                    <Ic d={ICON.play as string} size={10} className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-navy truncate">{v.title}</p>
                  <p className="text-[11px] text-muted">{v.duration} · {v.category}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Ic d={ICON.eye as string} size={12} className="text-light" />
                  <span className="text-[11px] text-muted">{v.viewCount}</span>
                </div>
              </div>
            ))}
            {!list.length && featured && (
              <p className="px-4 py-4 text-[12px] text-muted">Only one video in this category.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EVENTS TAB ───────────────────────────────────────────────────────────────

function EventsTab() {
  const { data: events, isLoading } = trpc.events.list.useQuery();

  if (isLoading) return <CardLoader />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-sora text-[17px] font-bold text-navy">Upcoming Events</h2>
        <p className="text-[12px] text-muted mt-0.5">Admin-managed · View & join only</p>
      </div>

      {!events?.length ? (
        <EmptyState icon={ICON.events as string} text="No upcoming events scheduled." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <EventCard ev={ev} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LEADS TAB ────────────────────────────────────────────────────────────────

// Pipeline stage badge colours
const STAGE_STYLE: Record<string, string> = {
  "New Lead":             "bg-blue-50 text-blue-700 border-blue-200",
  "Paid - SMB Lite":      "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Paid - SMB Standard":  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Paid - SMB Pro":       "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Onboarding Started":   "bg-amber/10 text-amber border-amber/30",
  "Onboarding Completed": "bg-amber/10 text-amber border-amber/30",
  "Account Deployed":     "bg-navy/5 text-navy border-navy/20",
};

function StageBadge({ stage }: { stage?: string | null }) {
  const label  = stage ?? "New Lead";
  const style  = STAGE_STYLE[label] ?? "bg-gray-50 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${style}`}>
      {label}
    </span>
  );
}

function LeadsTab() {
  const { data: myLeads, isLoading } = trpc.rep.myLeads.useQuery();
  if (isLoading) return <CardLoader />;

  // Stage funnel counts
  const stages = ["New Lead", "Paid - SMB Lite", "Paid - SMB Standard", "Paid - SMB Pro", "Onboarding Started", "Onboarding Completed", "Account Deployed"];
  const stageCounts = stages.map((s) => ({
    label: s,
    count: (myLeads ?? []).filter((l) => l.currentStage === s).length,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-sora text-[17px] font-bold text-navy">My Leads</h2>
        <p className="text-[12px] text-muted mt-0.5">{myLeads?.length ?? 0} leads in your pipeline</p>
      </div>

      {/* Pipeline funnel summary */}
      {!!myLeads?.length && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stageCounts.filter((s) => s.count > 0).map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-border p-3 shadow-card">
              <p className="text-[11px] text-muted mb-1">{s.label}</p>
              <p className="font-sora text-[22px] font-bold text-navy leading-none">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        {!myLeads?.length ? (
          <EmptyState icon={ICON.leads as string} text="No leads yet. Leads appear here once they come through your referral link and are added to the Wibiz pipeline." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["Name", "Business", "Email", "Pipeline Stage", "Score", "Plan", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-surface transition-colors cursor-default">
                    <td className="px-5 py-3 font-medium text-navy text-[13px] whitespace-nowrap">
                      {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-muted max-w-[130px] truncate">{lead.businessName || "—"}</td>
                    <td className="px-5 py-3 text-[12px] text-muted max-w-[170px] truncate">{lead.email || "—"}</td>
                    <td className="px-5 py-3"><StageBadge stage={lead.currentStage} /></td>
                    <td className="px-5 py-3 text-[12px] text-muted">{lead.s360AuditScore ?? "—"}</td>
                    <td className="px-5 py-3 text-[12px] text-muted max-w-[110px] truncate">{lead.s360PlanName ?? "—"}</td>
                    <td className="px-5 py-3 text-[11px] text-muted whitespace-nowrap">{fmtDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TEAM TAB ─────────────────────────────────────────────────────────────────

function TeamTab({ repCode }: { repCode: string }) {
  const { data: downline, isLoading } = trpc.rep.downline.useQuery({ repCode });
  if (isLoading) return <CardLoader />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-sora text-[17px] font-bold text-navy">My Team</h2>
        <p className="text-[12px] text-muted mt-0.5">{downline?.length ?? 0} agents in your direct downline</p>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        {!downline?.length ? (
          <EmptyState icon={ICON.team as string} text="No downline yet. Share your invite link to recruit agents." />
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
                      <span className="font-mono text-[11px] bg-amber/[0.08] text-[#824600] border border-amber/20 px-2 py-0.5 rounded-md font-semibold">{rep.repCode}</span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-navy font-medium">{rep.legalFullName ?? rep.email}</td>
                    <td className="px-5 py-3 text-[12px] text-muted">{rep.agentLevel}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        rep.isActive ? "bg-green-50 text-green-700" : "bg-surface text-muted"
                      }`}>{rep.isActive ? "Active" : "Inactive"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMMISSIONS TAB ──────────────────────────────────────────────────────────

function CommissionsTab() {
  const { data: commissions, isLoading } = trpc.commission.mine.useQuery();
  const { data: summary } = trpc.commission.mySummary.useQuery();
  if (isLoading) return <CardLoader />;

  const statusStyles: Record<string, string> = {
    pending:  "bg-[#FEF3C7] text-[#D97706]",
    approved: "bg-[#EFF6FF] text-[#1D4ED8]",
    paid:     "bg-[#F0FDF4] text-[#16A34A]",
    rejected: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-sora text-[17px] font-bold text-navy">Commissions</h2>
        <p className="text-[12px] text-muted mt-0.5">{commissions?.length ?? 0} commission records</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",   value: `$${(summary?.total   ?? 0).toFixed(2)}`, color: "border-navy/20 bg-navy/[0.04] text-navy"     },
          { label: "Pending", value: `$${(summary?.pending ?? 0).toFixed(2)}`, color: "border-amber/30 bg-amber/[0.07] text-[#824600]" },
          { label: "Paid",    value: `$${(summary?.paid    ?? 0).toFixed(2)}`, color: "border-green-200 bg-green-50 text-green-700"  },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 shadow-card ${s.color}`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-60 mb-1">{s.label}</p>
            <p className="font-sora text-[22px] font-bold leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        {!commissions?.length ? (
          <EmptyState icon={ICON.commissions as string} text="No commissions yet. Commissions are created when a lead converts." />
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
                    <td className="px-5 py-3 text-[12px] text-muted">{fmtDate(c.createdAt)}</td>
                    <td className="px-5 py-3 text-[13px] text-navy capitalize">{c.type}</td>
                    <td className="px-5 py-3 font-sora text-[14px] font-bold text-navy">${parseFloat(c.amount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-[12px] text-muted">{(parseFloat(c.rate) * 100).toFixed(0)}%</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${statusStyles[c.status ?? "pending"] ?? ""}`}>
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
    </div>
  );
}

// ─── CERTIFICATION TAB ────────────────────────────────────────────────────────

function CertificationTab() {
  const { data: status }    = trpc.certification.myStatus.useQuery();
  const { data: questions } = trpc.certification.getQuiz.useQuery(undefined, { enabled: !status?.certified });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result,  setResult]  = useState<{ passed: boolean; score: number; total: number } | null>(null);
  const submit   = trpc.certification.submitQuiz.useMutation({ onSuccess: (d) => setResult(d) });
  const activate = trpc.certification.activateKickstart.useMutation();

  if (status?.certified) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-card p-6 space-y-5 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber to-[#824600] flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICON.award as string} />
            </svg>
          </div>
          <div>
            <h3 className="font-sora text-[16px] font-bold text-navy">Wibiz Certified</h3>
            <p className="text-[13px] text-muted mt-0.5">
              Passed {status.passedAt ? fmtDate(status.passedAt) : ""} · Score: {status.score}/10
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
      <div className="bg-white rounded-xl border border-border shadow-card p-10 text-center max-w-lg mx-auto">
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
        <p className="font-sora text-[13px] font-semibold text-navy">Wibiz Certification Quiz</p>
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

// ─── INVITE TAB ───────────────────────────────────────────────────────────────

function InviteTab({ repCode }: { repCode: string }) {
  const associateLink = `${window.location.origin}/join-agent?ref=${repCode}&level=Associate`;
  const agencyLink    = `${window.location.origin}/join-agent?ref=${repCode}&level=Agency`;
  const referralLink  = `https://start.wibiz.ai/?ref=${repCode}`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-sora text-[17px] font-bold text-navy">Invite & Recruit</h2>
        <p className="text-[12px] text-muted mt-0.5">Share these links to grow your team and attribute leads</p>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-card p-5 space-y-3">
        <InviteLinkCard label="Invite an Associate" url={associateLink} />
        <InviteLinkCard label="Invite an Agency"    url={agencyLink} />
      </div>
      <div className="bg-white rounded-xl border border-border shadow-card p-5">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Your Wibiz Referral Link</p>
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
        ${copied ? "bg-green-50 text-green-700 border-green-200" : "bg-amber text-white border-transparent hover:bg-[#824600]"}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function AttributionBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    resolved:    "bg-green-50 text-green-700 border-green-200",
    unresolved:  "bg-amber/[0.08] text-[#824600] border-amber/25",
    no_rep_code: "bg-surface text-muted border-border",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize border font-medium ${map[status] ?? map.no_rep_code}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function EmptyState({ icon, text }: { icon: string | string[]; text: string }) {
  return (
    <div className="p-10 text-center">
      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mx-auto mb-3 text-muted">
        <Ic d={icon} size={18} />
      </div>
      <p className="text-[13px] text-muted">{text}</p>
    </div>
  );
}

function CardLoader() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-12 text-center">
      <div className="inline-block w-5 h-5 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
    </div>
  );
}
