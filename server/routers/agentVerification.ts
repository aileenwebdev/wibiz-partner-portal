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
import { updateRep, getRepByCode } from "../db/queries/reps";
import { randomBytes } from "node:crypto";
import { env } from "../env";
import { ghlAddTags, ghlUpdateContact } from "../lib/ghl";

export const agentVerificationRouter = router({
  // Admin generates a new verify link for a rep
  generateLink: adminProcedure
    .input(z.object({ repCode: z.string() }))
    .mutation(async ({ input }) => {
      const rep = await db.query.reps.findFirst({
        where: eq(reps.repCode, input.repCode),
      });
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });

      const token = randomBytes(24).toString("base64url");
      const verifyLink = `${env.APP_BASE_URL}/agent-verify?token=${token}`;

      await db.insert(agentVerificationSessions).values({
        repId:   rep.id,
        repCode: rep.repCode,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Write verify link to GHL so automation can email it
      if (rep.ghlContactId) {
        await ghlUpdateContact(rep.ghlContactId, { verifyLink }).catch((err) =>
          console.error("[GHL] verifyLink write failed:", err.message)
        );
      }

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

      // Tag in GHL so automation can notify admin
      const rep = await getRepByCode(session.repCode);
      if (rep?.ghlContactId) {
        await ghlAddTags(rep.ghlContactId, ["agent-id-submitted"]).catch((err) =>
          console.error("[GHL] tag agent-id-submitted failed:", err.message)
        );
      }

      return { ok: true };
    }),

  // Admin: list all sessions (with constructed verify link)
  list: adminProcedure.query(async () => {
    const sessions = await db.query.agentVerificationSessions.findMany();
    return sessions.map((s) => ({
      ...s,
      verifyLink: `${env.APP_BASE_URL}/agent-verify?token=${s.token}`,
    }));
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

      // Tag in GHL for automation
      const rep = await getRepByCode(input.repCode);
      if (rep?.ghlContactId) {
        const tag = input.status === "approved" ? "agent-verified" : "agent-id-rejected";
        await ghlAddTags(rep.ghlContactId, [tag]).catch((err) =>
          console.error(`[GHL] tag ${tag} failed:`, err.message)
        );
      }

      return { ok: true };
    }),
});
