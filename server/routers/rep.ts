/**
 * routers/rep.ts
 * Agent CRUD, auth, and hierarchy.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, authedProcedure, adminProcedure } from "./trpc";
import {
  createRep,
  getRepByCode,
  getRepById,
  getRepByUsername,
  getDirectDownline,
  getFullDownline,
  updateRep,
  verifyRepPassword,
  setRepPassword,
} from "../db/queries/reps";
import { db } from "../db/client";
import { reps, AGENT_LEVELS } from "../db/schema";
import { desc } from "drizzle-orm";

export const repRouter = router({
  // ─── Auth ────────────────────────────────────────────────────────────────

  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const rep = await verifyRepPassword(input.username, input.password);
      if (!rep) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });

      (ctx.session as unknown as Record<string, unknown>).repCode = rep.repCode;
      (ctx.session as unknown as Record<string, unknown>).repId   = rep.id;

      return {
        repCode:   rep.repCode,
        agentLevel: rep.agentLevel,
        email:     rep.email,
        name:      rep.legalFullName,
        isTempPassword: !!rep.tempPasswordPlain,
      };
    }),

  logout: authedProcedure.mutation(async ({ ctx }) => {
    await new Promise<void>((resolve, reject) =>
      ctx.session.destroy((err) => (err ? reject(err) : resolve()))
    );
    return { ok: true };
  }),

  me: authedProcedure.query(async ({ ctx }) => {
    const rep = await getRepByCode(ctx.repCode);
    if (!rep) throw new TRPCError({ code: "NOT_FOUND" });
    const { passwordHash, tempPasswordPlain, ...safe } = rep;
    return safe;
  }),

  changePassword: authedProcedure
    .input(z.object({ newPassword: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      await setRepPassword(ctx.repCode, input.newPassword);
      return { ok: true };
    }),

  // ─── Hierarchy ───────────────────────────────────────────────────────────

  downline: authedProcedure
    .input(z.object({ repCode: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const target = input.repCode ?? ctx.repCode;
      return getDirectDownline(target);
    }),

  fullDownline: authedProcedure
    .input(z.object({ repCode: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const target = input.repCode ?? ctx.repCode;
      return getFullDownline(target);
    }),

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  list: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return db.query.reps.findMany({
        orderBy: [desc(reps.createdAt)],
        limit: input.limit,
      });
    }),

  get: adminProcedure
    .input(z.object({ repCode: z.string() }))
    .query(async ({ input }) => {
      const rep = await getRepByCode(input.repCode);
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });
      return rep;
    }),

  create: adminProcedure
    .input(
      z.object({
        email:         z.string().email(),
        legalFullName: z.string().optional(),
        phone:         z.string().optional(),
        businessName:  z.string().optional(),
        agentLevel:    z.enum(AGENT_LEVELS),
        uplineRepCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createRep(input);
    }),

  update: adminProcedure
    .input(
      z.object({
        repCode:       z.string(),
        legalFullName: z.string().optional(),
        phone:         z.string().optional(),
        businessName:  z.string().optional(),
        agentLevel:    z.enum(AGENT_LEVELS).optional(),
        uplineRepCode: z.string().optional(),
        isActive:      z.boolean().optional(),
        notes:         z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { repCode, ...data } = input;
      await updateRep(repCode, data);
      return { ok: true };
    }),
});
