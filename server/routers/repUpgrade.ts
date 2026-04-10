/**
 * routers/repUpgrade.ts
 * Agent level upgrade requests — Associate → Senior Associate, etc.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure, adminProcedure } from "./trpc";
import { db } from "../db/client";
import { repLevelUpgradeRequests, reps, AGENT_LEVELS } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getRepByCode, updateRep } from "../db/queries/reps";

export const repUpgradeRouter = router({
  // Agent requests own upgrade
  request: authedProcedure
    .input(
      z.object({
        requestedLevel:    z.enum(AGENT_LEVELS),
        nominatedByRepCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rep = await getRepByCode(ctx.repCode);
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });

      await db.insert(repLevelUpgradeRequests).values({
        repCode:              rep.repCode,
        currentLevel:         rep.agentLevel,
        requestedLevel:       input.requestedLevel,
        originalUplineRepCode: rep.uplineRepCode ?? undefined,
        nominatedByRepCode:   input.nominatedByRepCode,
      });

      return { ok: true };
    }),

  // Agent views own requests
  myRequests: authedProcedure.query(async ({ ctx }) => {
    return db.query.repLevelUpgradeRequests.findMany({
      where: eq(repLevelUpgradeRequests.repCode, ctx.repCode),
      orderBy: [desc(repLevelUpgradeRequests.createdAt)],
    });
  }),

  // Upline nominates a downline agent for promotion
  nominateAssociate: authedProcedure
    .input(
      z.object({
        associateRepCode: z.string(),
        requestedLevel:   z.enum(AGENT_LEVELS),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const nominee = await getRepByCode(input.associateRepCode);
      if (!nominee) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

      // Validate nominator is in the nominee's upline chain
      // (simplified check: direct upline only — expand if needed)
      if (nominee.uplineRepCode !== ctx.repCode) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Can only nominate your direct downline" });
      }

      await db.insert(repLevelUpgradeRequests).values({
        repCode:               nominee.repCode,
        currentLevel:          nominee.agentLevel,
        requestedLevel:        input.requestedLevel,
        originalUplineRepCode: nominee.uplineRepCode ?? undefined,
        nominatedByRepCode:    ctx.repCode,
      });

      return { ok: true };
    }),

  // Admin views all requests
  listAll: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }))
    .query(async ({ input }) => {
      return db.query.repLevelUpgradeRequests.findMany({
        where: input.status ? eq(repLevelUpgradeRequests.status, input.status) : undefined,
        orderBy: [desc(repLevelUpgradeRequests.createdAt)],
      });
    }),

  // Admin approves — updates rep level
  approve: adminProcedure
    .input(z.object({ id: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const request = await db.query.repLevelUpgradeRequests.findFirst({
        where: eq(repLevelUpgradeRequests.id, input.id),
      });
      if (!request) throw new TRPCError({ code: "NOT_FOUND" });
      if (request.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already processed" });
      }

      await updateRep(request.repCode, { agentLevel: request.requestedLevel });

      await db
        .update(repLevelUpgradeRequests)
        .set({ status: "approved", adminNotes: input.notes, reviewedAt: new Date() })
        .where(eq(repLevelUpgradeRequests.id, input.id));

      return { ok: true };
    }),

  // Admin rejects
  reject: adminProcedure
    .input(z.object({ id: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      await db
        .update(repLevelUpgradeRequests)
        .set({ status: "rejected", adminNotes: input.notes, reviewedAt: new Date() })
        .where(eq(repLevelUpgradeRequests.id, input.id));
      return { ok: true };
    }),
});
