/**
 * routers/attribution.ts
 * Admin-only attribution management.
 */

import { z } from "zod";
import { router, adminProcedure } from "./trpc";
import {
  getAttributionLogs,
  getAttributionIssues,
  getWebhookLogs,
  getAllLeads,
  getUnresolvedLeads,
  searchLeads,
} from "../db/queries/attribution";
import {
  resolveAttribution,
  resyncLeadAttribution,
  manuallyAssignRep,
} from "../lib/attribution";
import { ghlListContacts, ghlListOpportunities, flattenGhlCustomFields } from "../lib/ghl";
import { env } from "../env";
import { db } from "../db/client";
import { leads } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const attributionRouter = router({
  // All leads in DB — primary admin view
  allLeads: adminProcedure
    .input(z.object({ limit: z.number().default(500) }))
    .query(async ({ input }) => getAllLeads(input.limit)),

  // Pull Wibiz pipeline opportunities + tagged contacts from GHL — upsert all into DB
  syncFromGhl: adminProcedure.mutation(async () => {
    const pipelineId = env.GHL_WIBIZ_PIPELINE_ID;
    let synced = 0;
    let resolved = 0;
    const errors: string[] = [];

    // ── Step 1: sync pipeline opportunities (these are the canonical leads) ──
    const opps = await ghlListOpportunities(pipelineId);

    for (const opp of opps) {
      try {
        const contact  = (opp.contact  ?? {}) as Record<string, unknown>;
        const stage    = (opp.pipelineStage ?? {}) as Record<string, unknown>;
        const stageName = String(stage.name ?? opp.pipelineStageName ?? "New Lead");
        const contactId = String(opp.contactId ?? contact.id ?? "");
        const customFields = flattenGhlCustomFields(contact);

        const payload = {
          ghlContactId: contactId,
          contact_id:   contactId,
          firstName:    String(contact.firstName ?? ""),
          lastName:     String(contact.lastName  ?? ""),
          email:        String(contact.email ?? ""),
          phone:        String(contact.phone ?? ""),
          businessName: String(contact.companyName ?? ""),
          REF_ID:       customFields["ref_id"] ?? customFields["rep_code"] ?? "",
          ...customFields,
        };

        const result = await resolveAttribution(payload, "admin:ghl-sync:pipeline");
        synced++;
        if (result.status === "resolved") resolved++;

        // Stamp pipeline info onto the lead row
        if (result.leadId) {
          await db.update(leads).set({
            pipelineId,
            currentStage:     stageName,
            ghlOpportunityId: String(opp.id ?? ""),
            updatedAt:        new Date(),
          }).where(eq(leads.id, result.leadId));
        }
      } catch (err) {
        errors.push(String((err as Error).message ?? err));
      }
    }

    // ── Step 2: sync contacts tagged "lead" not yet in DB ──
    const contacts = await ghlListContacts({ tag: "lead" });
    let contactSynced = 0;

    for (const contact of contacts) {
      try {
        const customFields = flattenGhlCustomFields(contact);
        const payload = {
          ghlContactId:  String(contact.id ?? ""),
          contact_id:    String(contact.id ?? ""),
          firstName:     String(contact.firstName ?? ""),
          lastName:      String(contact.lastName  ?? ""),
          email:         String(contact.email ?? ""),
          phone:         String(contact.phone ?? ""),
          businessName:  String(contact.companyName ?? ""),
          REF_ID:        customFields["ref_id"] ?? customFields["rep_code"] ?? "",
          ...customFields,
        };
        const result = await resolveAttribution(payload, "admin:ghl-sync:contacts");
        contactSynced++;
        if (result.status === "resolved") resolved++;
      } catch (err) {
        errors.push(String((err as Error).message ?? err));
      }
    }

    return {
      pipeline:  { total: opps.length,     synced },
      contacts:  { total: contacts.length, synced: contactSynced },
      resolved,
      errors:    errors.slice(0, 10),
    };
  }),

  logs: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => getAttributionLogs(input.limit)),

  issues: adminProcedure.query(() => getAttributionIssues()),

  webhookLogs: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => getWebhookLogs(input.limit)),

  unresolvedLeads: adminProcedure.query(() => getUnresolvedLeads()),

  searchLeads: adminProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => searchLeads(input.query)),

  resyncOne: adminProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ input }) => resyncLeadAttribution(input.leadId)),

  resyncAll: adminProcedure.mutation(async () => {
    const unresolved = await getUnresolvedLeads();
    const results = await Promise.allSettled(
      unresolved.map((l) => resyncLeadAttribution(l.id))
    );
    const resolved = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "resolved"
    ).length;
    return { attempted: unresolved.length, resolved };
  }),

  assignRep: adminProcedure
    .input(z.object({ leadId: z.number(), repCode: z.string() }))
    .mutation(async ({ input }) => {
      await manuallyAssignRep(input.leadId, input.repCode);
      return { ok: true };
    }),
});
