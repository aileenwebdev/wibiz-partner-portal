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
  getUnresolvedLeads,
  searchLeads,
} from "../db/queries/attribution";
import {
  resyncLeadAttribution,
  manuallyAssignRep,
} from "../lib/attribution";
import { db } from "../db/client";
import { leads } from "../db/schema";
import { desc } from "drizzle-orm";

export const attributionRouter = router({
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
