/**
 * routers/agentVerification.ts
 * Token-gated identity verification portal.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, adminProcedure } from "./trpc";
import { db } from "../db/client";
import { agentVerificationSessions, reps } from "../db/schema";
import { eq } from "drizzle-orm";
import { updateRep } from "../db/queries/reps";
import { nanoid } from "nanoid";
import { env } from "../env";

export const agentVerificationRouter = router({
  // Admin generates a new verify link for a rep
  generateLink: adminProcedure
    .input(z.object({ repCode: z.string() }))
    .mutation(async ({ input }) => {
      const rep = await db.query.reps.findFirst({
        where: eq(reps.repCode, input.repCode),
      });
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });

      const token = nanoid(32);
      const verifyLink = `${env.APP_BASE_URL}/agent-verify?token=${token}`;

      await db.insert(agentVerificationSessions).values({
        repId:   rep.id,
        repCode: rep.repCode,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return { verifyLink, token };
    }),

  // Public: fetch session by token (for the verify portal page)
  getSession: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await db.query.agentVerificationSessions.findFirst({
        where: eq(agentVerificationSessions.token, input.token),
      });

      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired link" });
      if (session.expiresAt && session.expiresAt < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Verification link has expired" });
      }

      return {
        repCode: session.repCode,
        status:  session.status,
      };
    }),

  // Public: submit document URL (after S3 upload)
  submitDocument: publicProcedure
    .input(z.object({ token: z.string(), documentUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const session = await db.query.agentVerificationSessions.findFirst({
        where: eq(agentVerificationSessions.token, input.token),
      });
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .update(agentVerificationSessions)
        .set({ documentUrl: input.documentUrl, status: "submitted", updatedAt: new Date() })
        .where(eq(agentVerificationSessions.token, input.token));

      await updateRep(session.repCode, { identityVerificationStatus: "submitted" });

      return { ok: true };
    }),

  // Admin: list all sessions
  list: adminProcedure.query(async () => {
    return db.query.agentVerificationSessions.findMany();
  }),

  // Admin: approve/reject identity
  review: adminProcedure
    .input(
      z.object({
        repCode: z.string(),
        status:  z.enum(["approved", "rejected"]),
        notes:   z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await updateRep(input.repCode, {
        identityVerificationStatus: input.status,
        identityVerificationNotes:  input.notes,
      });
      return { ok: true };
    }),
});
