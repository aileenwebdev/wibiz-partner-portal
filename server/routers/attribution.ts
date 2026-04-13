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
import { ghlListContacts, flattenGhlCustomFields } from "../lib/ghl";
import { db } from "../db/client";
import { leads } from "../db/schema";
import { desc } from "drizzle-orm";

export const attributionRouter = router({
  // All leads in DB — primary admin view
  allLeads: adminProcedure
    .input(z.object({ limit: z.number().default(500) }))
    .query(async ({ input }) => getAllLeads(input.limit)),

  // Pull all GHL contacts tagged "lead" and upsert into DB
  syncFromGhl: adminProcedure.mutation(async () => {
    const contacts = await ghlListContacts({ tag: "lead" });
    let synced = 0;
    let resolved = 0;
    const errors: string[] = [];

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
          // Try REF_ID from custom fields (multiple possible key names)
          REF_ID:        customFields["ref_id"] ?? customFields["rep_code"] ?? customFields["bc360_agent_id"] ?? "",
          // Pass all custom fields through for field mapping
          ...customFields,
        };

        const result = await resolveAttribution(payload, "admin:ghl-sync");
        synced++;
        if (result.status === "resolved") resolved++;
      } catch (err) {
        errors.push(String((err as Error).message ?? err));
      }
    }

    return { total: contacts.length, synced, resolved, errors: errors.slice(0, 10) };
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
