/**
 * webhooks/scale360.ts
 *
 * POST /api/scale360/webhook        — audit result inbound from Scale360
 * POST /api/scale360/payment-webhook — payment confirmed → triggers commission
 * POST /api/scale360/kickstart/provision — admin provision a Kickstart account
 */

import type { Request, Response } from "express";
import { resolveAttribution, logWebhookEvent } from "../lib/attribution";
import { db } from "../db/client";
import { leads, leadActivity } from "../db/schema";
import { eq } from "drizzle-orm";
import { createCommission } from "../db/queries/commissions";
import { getRepByCode } from "../db/queries/reps";
import { provisionKickstartAgent } from "../lib/kickstart";

// ─── Audit Webhook ────────────────────────────────────────────────────────────
// Fired by Scale360 when an audit is completed for a lead.
// Payload uses ALL_CAPS field names — map to s360* columns.

export async function handleScale360Webhook(req: Request, res: Response): Promise<void> {
  const payload = req.body as Record<string, unknown>;

  try {
    // 1. Attribution
    const result = await resolveAttribution(payload, "/api/scale360/webhook");

    // 2. Map audit fields onto the lead row
    if (result.leadId) {
      const auditUpdate: Partial<typeof leads.$inferInsert> = {
        updatedAt: new Date(),
      };

      // Helpers
      const str = (v: unknown) => (v != null && v !== "" ? String(v) : undefined);

      // Score / status — payload uses SCORE/STATUS (not AUDIT_SCORE/AUDIT_STATUS)
      const score  = str(payload.SCORE  ?? payload.AUDIT_SCORE  ?? payload.audit_score);
      const status = str(payload.STATUS ?? payload.AUDIT_STATUS ?? payload.audit_status);
      if (score)  auditUpdate.s360AuditScore  = score;
      if (status) auditUpdate.s360AuditStatus = status;

      // Plan
      if (str(payload.PLAN_NAME ?? payload.plan_name)) auditUpdate.s360PlanName  = str(payload.PLAN_NAME ?? payload.plan_name);
      if (str(payload.PLAN_DESC ?? payload.plan_desc)) auditUpdate.s360PlanDesc  = str(payload.PLAN_DESC ?? payload.plan_desc);
      if (str(payload.PLAN_PRICE))                     auditUpdate.s360PlanPrice = str(payload.PLAN_PRICE);

      // PDF + ROI
      if (str(payload.PDF_LINK  ?? payload.pdf_link))  auditUpdate.s360PdfLink  = str(payload.PDF_LINK ?? payload.pdf_link);
      if (str(payload.ROI       ?? payload.roi))       auditUpdate.s360Roi      = str(payload.ROI      ?? payload.roi);

      // Industry — payload uses INDUSTRY_NAME (not INDUSTRY)
      if (str(payload.INDUSTRY_NAME ?? payload.INDUSTRY ?? payload.industry)) {
        auditUpdate.s360Industry = str(payload.INDUSTRY_NAME ?? payload.INDUSTRY ?? payload.industry);
      }
      if (str(payload.INDUSTRY_INSIGHT))  auditUpdate.s360IndustryInsight  = str(payload.INDUSTRY_INSIGHT);
      if (str(payload.INDUSTRY_BENEFITS)) auditUpdate.s360IndustryBenefits = str(payload.INDUSTRY_BENEFITS);

      // Legacy employee count
      if (str(payload.EMPLOYEE_COUNT ?? payload.employee_count)) {
        auditUpdate.s360EmployeeCount = str(payload.EMPLOYEE_COUNT ?? payload.employee_count);
      }

      // Revenue loss / savings metrics
      if (str(payload.LOSS_YR))    auditUpdate.s360LossYr    = str(payload.LOSS_YR);
      if (str(payload.LOSS_MO))    auditUpdate.s360LossMo    = str(payload.LOSS_MO);
      if (str(payload.SAVED_HRS))  auditUpdate.s360SavedHrs  = str(payload.SAVED_HRS);
      if (str(payload.GHOST_YR))   auditUpdate.s360GhostYr   = str(payload.GHOST_YR);
      if (str(payload.AFTER_YR))   auditUpdate.s360AfterYr   = str(payload.AFTER_YR);
      if (str(payload.TIME_YR))    auditUpdate.s360TimeYr    = str(payload.TIME_YR);
      if (str(payload.BREAKEVEN))  auditUpdate.s360Breakeven = str(payload.BREAKEVEN);

      // Classification
      if (str(payload.ECONOMY_TIER))  auditUpdate.s360EconomyTier = str(payload.ECONOMY_TIER);
      if (str(payload.persona_id))    auditUpdate.s360PersonaId   = str(payload.persona_id);
      if (str(payload.multiplier))    auditUpdate.s360Multiplier  = str(payload.multiplier);

      // Source platform (overwrite only if provided)
      if (str(payload.SOURCE_PLATFORM ?? payload.source_platform)) {
        auditUpdate.sourcePlatform = str(payload.SOURCE_PLATFORM ?? payload.source_platform);
      }

      if (Object.keys(auditUpdate).length > 1) {
        auditUpdate.s360AuditReceivedAt = new Date();
        await db.update(leads).set(auditUpdate).where(eq(leads.id, result.leadId));
      }
    }

    await logWebhookEvent("/api/scale360/webhook", payload, result);
    res.json({ ok: true, status: result.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Scale360 Webhook]", msg);
    res.status(500).json({ error: msg });
  }
}

// ─── Payment Webhook ──────────────────────────────────────────────────────────
// Fired when a Scale360 lead's payment is confirmed.
// Moves lead to payment_received, creates commission record.

export async function handleScale360PaymentWebhook(req: Request, res: Response): Promise<void> {
  const payload = req.body as Record<string, unknown>;
  const ghlContactId = String(payload.ghlContactId ?? payload.contact_id ?? "");
  const baseFee      = parseFloat(String(payload.amount ?? payload.fee ?? "0"));

  try {
    // Find the lead
    const lead = await db.query.leads.findFirst({
      where: eq(leads.ghlContactId, ghlContactId),
    });

    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    // Update lead to payment_received
    await db
      .update(leads)
      .set({
        currentStage:       "payment_received",
        paymentAmount:      String(baseFee),
        paymentConfirmedAt: new Date(),
        updatedAt:          new Date(),
      })
      .where(eq(leads.id, lead.id));

    await db.insert(leadActivity).values({
      leadId:      lead.id,
      action:      "stage_change",
      fromStage:   lead.currentStage ?? undefined,
      toStage:     "payment_received",
      performedBy: "system",
      notes:       "Payment confirmed via webhook",
    });

    // Create commission if attributed
    if (lead.repCode && lead.repId && baseFee > 0) {
      const rep = await getRepByCode(lead.repCode);
      if (rep) {
        await createCommission({
          repCode:    rep.repCode,
          repId:      rep.id,
          leadId:     lead.id,
          type:       "setup",
          baseFee,
          agentLevel: rep.agentLevel,
        });
      }
    }

    res.json({ ok: true, leadId: lead.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Scale360 Payment Webhook]", msg);
    res.status(500).json({ error: msg });
  }
}

// ─── Kickstart Provision ──────────────────────────────────────────────────────
// Admin-triggered: provisions a Kickstart account for a certified agent.

export async function handleKickstartProvision(req: Request, res: Response): Promise<void> {
  const { repCode } = req.body as { repCode: string };

  if (!repCode) {
    res.status(400).json({ error: "repCode required" });
    return;
  }

  const rep = await getRepByCode(repCode);
  if (!rep) {
    res.status(404).json({ error: "Rep not found" });
    return;
  }

  const result = await provisionKickstartAgent({
    repCode:      rep.repCode,
    email:        rep.email,
    username:     rep.username ?? rep.email,
    tempPassword: rep.tempPasswordPlain ?? "changeme",
    legalFullName: rep.legalFullName ?? rep.email,
  });

  if (!result.success) {
    res.status(500).json({ error: result.error });
    return;
  }

  res.json({ ok: true });
}
