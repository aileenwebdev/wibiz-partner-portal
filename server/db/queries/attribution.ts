/**
 * queries/attribution.ts
 */

import { db } from "../client";
import { attributionLog, webhookLogs, leads } from "../schema";
import { eq, desc, and, ne, isNull, like, or } from "drizzle-orm";

// ─── Attribution Log ──────────────────────────────────────────────────────────

export async function getAttributionLogs(limit = 100) {
  return db.query.attributionLog.findMany({
    orderBy: [desc(attributionLog.createdAt)],
    limit,
  });
}

/** Unresolved + no_rep_code entries — the "issues" admin view */
export async function getAttributionIssues() {
  return db.query.attributionLog.findMany({
    where: ne(attributionLog.status, "resolved"),
    orderBy: [desc(attributionLog.createdAt)],
  });
}

// ─── Webhook Logs ─────────────────────────────────────────────────────────────

export async function getWebhookLogs(limit = 100) {
  return db.query.webhookLogs.findMany({
    orderBy: [desc(webhookLogs.createdAt)],
    limit,
  });
}

// ─── Leads (for admin attribution view) ──────────────────────────────────────

export async function getUnresolvedLeads() {
  return db.query.leads.findMany({
    where: ne(leads.attributionStatus, "resolved"),
    orderBy: [desc(leads.createdAt)],
  });
}

export async function searchLeads(query: string) {
  // Simple email/name search — extend with full-text if needed
  return db.query.leads.findMany({
    where: or(
      like(leads.email, `%${query}%`),
      like(leads.firstName, `%${query}%`),
      like(leads.lastName, `%${query}%`),
      like(leads.ghlContactId, `%${query}%`)
    ),
    limit: 50,
    orderBy: [desc(leads.createdAt)],
  });
}
