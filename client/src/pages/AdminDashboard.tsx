/**
 * AdminDashboard.tsx
 * Admin portal — agents, attribution, commissions, registrations, upgrades.
 */

import { useState } from "react";
import { trpc } from "../lib/trpc";

type Tab = "agents" | "attribution" | "webhooks" | "commissions" | "registrations" | "upgrades" | "verifications";

export default function AdminDashboard() {
  const [tab, setTab]         = useState<Tab>("agents");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { id: Tab; label: string }[] = [
    { id: "agents",        label: "Agents" },
    { id: "registrations", label: "Registrations" },
    { id: "upgrades",      label: "Upgrades" },
    { id: "commissions",   label: "Commissions" },
    { id: "attribution",   label: "Attribution" },
    { id: "webhooks",      label: "Webhooks" },
    { id: "verifications", label: "ID Verification" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3">
        <span className="font-semibold text-gray-900">Wibiz Partner Portal</span>
        <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Admin</span>
      </header>

      <div className="bg-white border-b px-6 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "agents"        && <AgentsTab />}
        {tab === "registrations" && <RegistrationsTab />}
        {tab === "upgrades"      && <UpgradesTab />}
        {tab === "commissions"   && <CommissionsTab />}
        {tab === "attribution"   && <AttributionTab />}
        {tab === "webhooks"      && <WebhooksTab />}
        {tab === "verifications" && <VerificationsTab />}
      </main>
    </div>
  );
}

// ─── Agents ───────────────────────────────────────────────────────────────────

function AgentsTab() {
  const { data: agents, isLoading } = trpc.rep.list.useQuery({ limit: 200 });

  if (isLoading) return <LoadingCard />;

  return (
    <AdminTable
      title="All Agents"
      headers={["Rep Code", "Name", "Level", "Email", "Upline", "Active"]}
      rows={(agents ?? []).map((r) => [
        <span className="font-mono text-orange-600">{r.repCode}</span>,
        r.legalFullName ?? "—",
        r.agentLevel,
        r.email,
        r.uplineRepCode ?? "—",
        <span className={`text-xs px-2 py-0.5 rounded-full ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
          {r.isActive ? "Active" : "Inactive"}
        </span>,
      ])}
    />
  );
}

// ─── Registrations ────────────────────────────────────────────────────────────

function RegistrationsTab() {
  const { data: requests, isLoading, refetch } = trpc.agentSelfReg.list.useQuery({ status: "pending" });
  const approve = trpc.agentSelfReg.approve.useMutation({ onSuccess: () => refetch() });
  const reject  = trpc.agentSelfReg.reject.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <LoadingCard />;

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900">Pending Registrations ({requests?.length ?? 0})</h3>
      </div>
      {!requests?.length ? (
        <p className="p-6 text-sm text-gray-400">No pending registrations.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Email", "Level", "Referred By", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{r.firstName} {r.lastName}</td>
                <td className="px-4 py-3 text-gray-500">{r.email}</td>
                <td className="px-4 py-3">{r.requestedLevel}</td>
                <td className="px-4 py-3 font-mono text-orange-600">{r.referredByRepCode ?? "—"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <ActionBtn label="Approve" color="green" onClick={() => approve.mutate({ id: r.id })} />
                  <ActionBtn label="Reject"  color="red"   onClick={() => reject.mutate({ id: r.id })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900">Pending Upgrades ({requests?.length ?? 0})</h3>
      </div>
      {!requests?.length ? (
        <p className="p-6 text-sm text-gray-400">No pending upgrades.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Rep Code", "Current", "Requested", "Nominated By", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-orange-600">{r.repCode}</td>
                <td className="px-4 py-3 text-gray-500">{r.currentLevel}</td>
                <td className="px-4 py-3 font-medium">{r.requestedLevel}</td>
                <td className="px-4 py-3 font-mono text-gray-400">{r.nominatedByRepCode ?? "—"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <ActionBtn label="Approve" color="green" onClick={() => approve.mutate({ id: r.id })} />
                  <ActionBtn label="Reject"  color="red"   onClick={() => reject.mutate({ id: r.id })} />
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
  const { data, isLoading, refetch } = trpc.commission.all.useQuery({});
  const updateStatus = trpc.commission.updateStatus.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <LoadingCard />;

  return (
    <AdminTable
      title="All Commissions"
      headers={["Rep Code", "Type", "Amount", "Rate", "Status", "Date", "Actions"]}
      rows={(data ?? []).map((c) => [
        <span className="font-mono text-orange-600">{c.repCode}</span>,
        <span className="capitalize">{c.type}</span>,
        `$${parseFloat(c.amount).toFixed(2)}`,
        `${(parseFloat(c.rate) * 100).toFixed(0)}%`,
        <StatusBadge status={c.status ?? "pending"} />,
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
        c.status === "pending"
          ? <ActionBtn label="Approve" color="blue" onClick={() => updateStatus.mutate({ id: c.id, status: "approved" })} />
          : c.status === "approved"
          ? <ActionBtn label="Mark Paid" color="green" onClick={() => updateStatus.mutate({ id: c.id, status: "paid" })} />
          : <span className="text-xs text-gray-400">—</span>,
      ])}
    />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Unresolved Leads ({issues?.length ?? 0})</h3>
        <button
          onClick={() => resyncAll.mutate()}
          disabled={resyncAll.isPending}
          className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-md hover:bg-orange-600 disabled:opacity-50"
        >
          {resyncAll.isPending ? "Resyncing…" : "Resync All"}
        </button>
      </div>

      {resyncAll.isSuccess && (
        <p className="text-sm text-green-600">
          Resolved {(resyncAll.data as { resolved: number }).resolved} of {(resyncAll.data as { attempted: number }).attempted}
        </p>
      )}

      <AdminTable
        title=""
        headers={["GHL Contact", "Email", "Rep Code", "Status", "Action"]}
        rows={(issues ?? []).map((l) => [
          <span className="font-mono text-xs text-gray-400">{l.ghlContactId ?? "—"}</span>,
          l.email ?? "—",
          l.repCode ?? <span className="text-red-400 text-xs">none</span>,
          <StatusBadge status={l.attributionStatus ?? "unresolved"} />,
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="BC-360"
              className="border rounded px-2 py-1 text-xs w-24"
              onBlur={(e) => setAssignTarget({ leadId: l.id, repCode: e.target.value })}
            />
            <ActionBtn
              label="Assign"
              color="blue"
              onClick={() => assignTarget?.leadId === l.id && assign.mutate(assignTarget)}
            />
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
    <AdminTable
      title="Webhook Logs (last 50)"
      headers={["Endpoint", "Rep Code", "Status", "GHL Contact", "Date"]}
      rows={(logs ?? []).map((l) => [
        <span className="font-mono text-xs text-gray-600">{l.endpoint}</span>,
        l.repCodeExtracted ?? <span className="text-gray-300">—</span>,
        <StatusBadge status={l.attributionStatus ?? "unresolved"} />,
        <span className="font-mono text-xs text-gray-400">{l.ghlContactId ?? "—"}</span>,
        l.createdAt ? new Date(l.createdAt).toLocaleString() : "—",
      ])}
    />
  );
}

// ─── ID Verification ──────────────────────────────────────────────────────────

function VerificationsTab() {
  const { data: sessions, isLoading, refetch } = trpc.agentVerification.list.useQuery();
  const review = trpc.agentVerification.review.useMutation({ onSuccess: () => refetch() });

  if (isLoading) return <LoadingCard />;

  return (
    <AdminTable
      title="Identity Verification"
      headers={["Rep Code", "Status", "Document", "Actions"]}
      rows={(sessions ?? []).map((s) => [
        <span className="font-mono text-orange-600">{s.repCode}</span>,
        <StatusBadge status={s.status} />,
        s.documentUrl
          ? <a href={s.documentUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline">View Doc</a>
          : <span className="text-gray-300 text-xs">—</span>,
        s.status === "submitted" ? (
          <div className="flex gap-2">
            <ActionBtn label="Approve" color="green" onClick={() => review.mutate({ repCode: s.repCode, status: "approved" })} />
            <ActionBtn label="Reject"  color="red"   onClick={() => review.mutate({ repCode: s.repCode, status: "rejected" })} />
          </div>
        ) : <span className="text-xs text-gray-300">—</span>,
      ])}
    />
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function AdminTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="bg-white rounded-lg border">
      {title && (
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
      )}
      {!rows.length ? (
        <p className="p-6 text-sm text-gray-400">No records.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs text-gray-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:    "bg-yellow-100 text-yellow-700",
    approved:   "bg-blue-100 text-blue-700",
    paid:       "bg-green-100 text-green-700",
    resolved:   "bg-green-100 text-green-700",
    rejected:   "bg-red-100 text-red-700",
    unresolved: "bg-yellow-100 text-yellow-700",
    no_rep_code:"bg-gray-100 text-gray-500",
    submitted:  "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function ActionBtn({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "green" | "red" | "blue";
  onClick: () => void;
}) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    red:   "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    blue:  "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  };
  return (
    <button
      onClick={onClick}
      className={`text-xs border px-2 py-1 rounded ${colors[color]}`}
    >
      {label}
    </button>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-lg border p-6 text-center text-sm text-gray-400">Loading…</div>
  );
}
