/**
 * routers/agentSelfReg.ts
 * Agent self-registration and invite flow.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, authedProcedure, adminProcedure } from "./trpc";
import { db } from "../db/client";
import {
  agentRegistrationRequests,
  agreementAcceptances,
  agentVerificationSessions,
  AGENT_LEVELS,
} from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getRepByCode, createRep, getFullDownline } from "../db/queries/reps";
import { nanoid } from "nanoid";
import { env } from "../env";

export const agentSelfRegRouter = router({
  // ─── Public: submit registration ─────────────────────────────────────────

  submit: publicProcedure
    .input(
      z.object({
        referredByRepCode: z.string().optional(),
        requestedLevel:    z.enum(AGENT_LEVELS).default("Associate"),
        firstName:         z.string().min(1),
        lastName:          z.string().min(1),
        email:             z.string().email(),
        phone:             z.string().optional(),
        businessName:      z.string().optional(),
        agreementAccepted: z.boolean(),
        w9Signed:          z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.agreementAccepted) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Agreement must be accepted" });
      }

      // Validate referrer exists
      if (input.referredByRepCode) {
        const referrer = await getRepByCode(input.referredByRepCode);
        if (!referrer) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid referral code" });
        }
      }

      // Log agreement acceptance
      await db.insert(agreementAcceptances).values({
        email:     input.email,
        version:   "1.0",
        ipAddress: ctx.req.ip,
      });

      // Insert registration request
      await db.insert(agentRegistrationRequests).values({
        referredByRepCode: input.referredByRepCode,
        requestedLevel:    input.requestedLevel,
        firstName:         input.firstName,
        lastName:          input.lastName,
        email:             input.email,
        phone:             input.phone,
        businessName:      input.businessName,
        w9Signed:          input.w9Signed,
        agreementAccepted: input.agreementAccepted,
      });

      return { ok: true };
    }),

  // ─── Public: get invite link for a rep ───────────────────────────────────

  getInviteLink: publicProcedure
    .input(z.object({ repCode: z.string(), level: z.enum(AGENT_LEVELS).default("Associate") }))
    .query(async ({ input }) => {
      const rep = await getRepByCode(input.repCode);
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        url: `${env.APP_BASE_URL}/join-agent?ref=${input.repCode}&level=${encodeURIComponent(input.level)}`,
      };
    }),

  // ─── Authed: view my downline registrations ───────────────────────────────

  myDownline: authedProcedure.query(async ({ ctx }) => {
    return getFullDownline(ctx.repCode);
  }),

  // ─── Admin: list all requests ─────────────────────────────────────────────

  list: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }))
    .query(async ({ input }) => {
      return db.query.agentRegistrationRequests.findMany({
        where: input.status ? eq(agentRegistrationRequests.status, input.status) : undefined,
        orderBy: [desc(agentRegistrationRequests.createdAt)],
      });
    }),

  // ─── Admin: approve registration → create rep ────────────────────────────

  approve: adminProcedure
    .input(
      z.object({
        id:         z.number(),
        agentLevel: z.enum(AGENT_LEVELS).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const request = await db.query.agentRegistrationRequests.findFirst({
        where: eq(agentRegistrationRequests.id, input.id),
      });
      if (!request) throw new TRPCError({ code: "NOT_FOUND" });
      if (request.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Request already processed" });
      }

      const rep = await createRep({
        email:         request.email,
        legalFullName: `${request.firstName} ${request.lastName}`,
        phone:         request.phone ?? undefined,
        businessName:  request.businessName ?? undefined,
        agentLevel:    input.agentLevel ?? request.requestedLevel,
        uplineRepCode: request.referredByRepCode ?? undefined,
      });

      // Generate verify link
      const token = nanoid(32);
      const verifyLink = `${env.APP_BASE_URL}/agent-verify?token=${token}`;

      await db.insert(agentVerificationSessions).values({
        repId:   rep.id,
        repCode: rep.repCode,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      await db
        .update(agentRegistrationRequests)
        .set({
          status:          "approved",
          assignedRepCode: rep.repCode,
          verifyLink,
          reviewedAt:      new Date(),
        })
        .where(eq(agentRegistrationRequests.id, input.id));

      return { repCode: rep.repCode, verifyLink };
    }),

  // ─── Admin: reject request ────────────────────────────────────────────────

  reject: adminProcedure
    .input(z.object({ id: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      await db
        .update(agentRegistrationRequests)
        .set({ status: "rejected", adminNotes: input.notes, reviewedAt: new Date() })
        .where(eq(agentRegistrationRequests.id, input.id));
      return { ok: true };
    }),
});
