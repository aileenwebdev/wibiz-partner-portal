/**
 * queries/commissions.ts
 */

import { db } from "../client";
import { commissions, leads, reps } from "../schema";
import { eq, desc, and, sum, count } from "drizzle-orm";
import { calculateCommission } from "../../lib/commission";
import type { AgentLevel, CommissionType } from "../schema";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCommission(input: {
  repCode:   string;
  repId:     number;
  leadId:    number;
  type:      CommissionType;
  baseFee:   number;
  agentLevel: AgentLevel;
  notes?:    string;
}) {
  const result = calculateCommission(input.agentLevel, input.baseFee, input.type);

  await db.insert(commissions).values({
    repCode:  input.repCode,
    repId:    input.repId,
    leadId:   input.leadId,
    type:     input.type,
    amount:   String(result.amount),
    rate:     String(result.rate),
    baseFee:  String(result.baseFee),
    status:   "pending",
    notes:    input.notes,
  });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getCommissionsByRep(repCode: string) {
  return db.query.commissions.findMany({
    where: eq(commissions.repCode, repCode),
    orderBy: [desc(commissions.createdAt)],
  });
}

export async function getCommissionSummaryByRep(repCode: string) {
  const rows = await getCommissionsByRep(repCode);
  const total   = rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const pending  = rows.filter((r) => r.status === "pending").reduce((s, r) => s + parseFloat(r.amount), 0);
  const paid     = rows.filter((r) => r.status === "paid").reduce((s, r) => s + parseFloat(r.amount), 0);
  return { total, pending, paid, count: rows.length };
}

export async function getAllCommissions(filters?: { status?: string; repCode?: string }) {
  const conditions = [];
  if (filters?.repCode) conditions.push(eq(commissions.repCode, filters.repCode));
  if (filters?.status)  conditions.push(eq(commissions.status, filters.status as "pending" | "approved" | "paid" | "rejected"));

  return db.query.commissions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(commissions.createdAt)],
  });
}

// ─── Status Updates ───────────────────────────────────────────────────────────

export async function updateCommissionStatus(
  id: number,
  status: "pending" | "approved" | "paid" | "rejected",
  notes?: string
) {
  await db
    .update(commissions)
    .set({
      status,
      notes,
      ...(status === "paid" ? { paidAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(commissions.id, id));
}

export async function deleteCommission(id: number) {
  await db.delete(commissions).where(eq(commissions.id, id));
}
