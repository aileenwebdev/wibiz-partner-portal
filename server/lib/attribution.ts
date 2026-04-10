/**
 * attribution.ts
 * Core attribution resolution — ties an inbound lead to an agent.
 *
 * Flow:
 *   1. extractRepCode() from payload
 *   2. Look up rep in DB
 *   3. Upsert lead row (match on ghlContactId)
 *   4. Write referrer fields back to GHL contact
 *   5. Log result to attribution_log
 */

import { db } from "../db/client";
import {
  leads,
  attributionLog,
  webhookLogs,
  reps,
  leadActivity,
} from "../db/schema";
import { eq, and } from "drizzle-orm";
import { extractRepCode } from "./repCode";
import { ghlGetContact, ghlWriteAttribution } from "./ghl";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttributionResult {
  status: "resolved" | "unresolved" | "no_rep_code";
  leadId: number | null;
  repCode: string | null;
  repId: number | null;
  matchedField: string | null;
}

export interface InboundLeadPayload {
  // GHL contact identifiers
  ghlContactId?: string;
  contact_id?: string;

  // Contact info (may be partial)
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  company_name?: string;

  // Can contain anything GHL sends
  [key: string]: unknown;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * resolveAttribution()
 * Called from every inbound Scale360 webhook.
 * Handles the full attribution lifecycle for one lead.
 */
export async function resolveAttribution(
  payload: InboundLeadPayload,
  triggeredBy: string
): Promise<AttributionResult> {
  const ghlContactId = String(payload.ghlContactId ?? payload.contact_id ?? "");

  // Step 1 — extract rep code
  const match = extractRepCode(payload as Record<string, unknown>);

  if (!match) {
    // No rep code found at all — log and return
    const leadId = await upsertLead(ghlContactId, payload, null, null);
    await logAttribution({
      leadId,
      ghlContactId,
      attemptedRepCode: null,
      resolvedRepId: null,
      status: "no_rep_code",
      triggeredBy,
      rawField: null,
    });
    return { status: "no_rep_code", leadId, repCode: null, repId: null, matchedField: null };
  }

  // Step 2 — look up rep
  const rep = await db.query.reps.findFirst({
    where: eq(reps.repCode, match.code),
  });

  if (!rep) {
    // Code extracted but rep not found
    const leadId = await upsertLead(ghlContactId, payload, match.code, null);
    await logAttribution({
      leadId,
      ghlContactId,
      attemptedRepCode: match.code,
      resolvedRepId: null,
      status: "unresolved",
      triggeredBy,
      rawField: match.field,
      notes: `Rep code ${match.code} not found in DB`,
    });
    return { status: "unresolved", leadId, repCode: match.code, repId: null, matchedField: match.field };
  }

  // Step 3 — upsert lead
  const leadId = await upsertLead(ghlContactId, payload, match.code, rep.id);

  // Step 4 — write back to GHL
  if (ghlContactId) {
    await ghlWriteAttribution(
      ghlContactId,
      rep.repCode,
      rep.legalFullName ?? rep.email,
      rep.email,
      "resolved"
    ).catch((err) => console.error("[GHL] Write-back failed:", err.message));
  }

  // Step 5 — log
  await logAttribution({
    leadId,
    ghlContactId,
    attemptedRepCode: match.code,
    resolvedRepId: rep.id,
    status: "resolved",
    triggeredBy,
    rawField: match.field,
  });

  return { status: "resolved", leadId, repCode: match.code, repId: rep.id, matchedField: match.field };
}

// ─── Lead Upsert ─────────────────────────────────────────────────────────────

async function upsertLead(
  ghlContactId: string,
  payload: InboundLeadPayload,
  repCode: string | null,
  repId: number | null
): Promise<number | null> {
  if (!ghlContactId) return null;

  const existing = await db.query.leads.findFirst({
    where: eq(leads.ghlContactId, ghlContactId),
  });

  const firstName = String(payload.firstName ?? payload.first_name ?? "");
  const lastName  = String(payload.lastName  ?? payload.last_name  ?? "");
  const email     = String(payload.email ?? "");
  const phone     = String(payload.phone ?? "");
  const businessName = String(payload.businessName ?? payload.company_name ?? "");

  if (existing) {
    // Update attribution fields only — don't clobber contact data
    await db
      .update(leads)
      .set({
        repCode:          repCode ?? existing.repCode,
        repId:            repId   ?? existing.repId,
        attributionStatus: repId ? "resolved" : repCode ? "unresolved" : "no_rep_code",
        updatedAt:        new Date(),
      })
      .where(eq(leads.id, existing.id));
    return existing.id;
  }

  // Insert new
  const [result] = await db.insert(leads).values({
    ghlContactId,
    repCode,
    repId,
    firstName,
    lastName,
    email,
    phone,
    businessName,
    attributionStatus: repId ? "resolved" : repCode ? "unresolved" : "no_rep_code",
  });

  return (result as { insertId: number }).insertId ?? null;
}

// ─── Attribution Log ──────────────────────────────────────────────────────────

interface LogAttributionInput {
  leadId: number | null;
  ghlContactId: string;
  attemptedRepCode: string | null;
  resolvedRepId: number | null;
  status: "resolved" | "unresolved" | "no_rep_code";
  triggeredBy: string;
  rawField: string | null;
  notes?: string;
}

export async function logAttribution(input: LogAttributionInput): Promise<void> {
  await db.insert(attributionLog).values({
    leadId:          input.leadId ?? undefined,
    ghlContactId:    input.ghlContactId,
    attemptedRepCode: input.attemptedRepCode ?? undefined,
    resolvedRepId:   input.resolvedRepId ?? undefined,
    status:          input.status,
    triggeredBy:     input.triggeredBy,
    rawField:        input.rawField ?? undefined,
    notes:           input.notes,
  });
}

// ─── Webhook Log ─────────────────────────────────────────────────────────────

export async function logWebhookEvent(
  endpoint: string,
  payload: unknown,
  result: AttributionResult,
  matchedField?: string | null,
  error?: string
): Promise<void> {
  await db.insert(webhookLogs).values({
    endpoint,
    repCodeExtracted:  result.repCode ?? undefined,
    matchedField:      matchedField ?? result.matchedField ?? undefined,
    attributionStatus: result.status,
    ghlContactId:      String((payload as Record<string, unknown>).ghlContactId ?? (payload as Record<string, unknown>).contact_id ?? ""),
    payload:           payload as Record<string, unknown>,
    error,
  });
}

// ─── Resync (admin) ───────────────────────────────────────────────────────────

/**
 * resyncLeadAttribution()
 * Re-attempts attribution for a single lead that was previously unresolved.
 * Fetches the latest contact from GHL and re-runs the full flow.
 */
export async function resyncLeadAttribution(leadId: number): Promise<AttributionResult> {
  const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });
  if (!lead?.ghlContactId) {
    return { status: "unresolved", leadId, repCode: null, repId: null, matchedField: null };
  }

  // Fetch fresh contact from GHL
  const contact = await ghlGetContact(lead.ghlContactId);
  return resolveAttribution(
    { ...contact, ghlContactId: lead.ghlContactId } as InboundLeadPayload,
    "admin:resync"
  );
}

/**
 * manuallyAssignRep()
 * Admin override — directly assigns a rep to a lead.
 */
export async function manuallyAssignRep(leadId: number, repCode: string): Promise<void> {
  const rep = await db.query.reps.findFirst({ where: eq(reps.repCode, repCode) });
  if (!rep) throw new Error(`Rep not found: ${repCode}`);

  await db
    .update(leads)
    .set({
      repCode:          rep.repCode,
      repId:            rep.id,
      referrerAgentName:  rep.legalFullName ?? rep.email,
      referrerAgentEmail: rep.email,
      attributionStatus: "resolved",
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  await db.insert(leadActivity).values({
    leadId,
    action: "manual_attribution",
    performedBy: "admin",
    notes: `Manually assigned to ${repCode}`,
  });

  // Write to GHL if we have the contact ID
  const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });
  if (lead?.ghlContactId) {
    await ghlWriteAttribution(
      lead.ghlContactId,
      rep.repCode,
      rep.legalFullName ?? rep.email,
      rep.email,
      "resolved"
    ).catch(console.error);
  }
}
