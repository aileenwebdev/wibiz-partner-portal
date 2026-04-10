/**
 * routers/commission.ts
 */

import { z } from "zod";
import { router, authedProcedure, adminProcedure } from "./trpc";
import {
  getCommissionsByRep,
  getCommissionSummaryByRep,
  getAllCommissions,
  updateCommissionStatus,
  deleteCommission,
} from "../db/queries/commissions";
import { COMMISSION_SUMMARY } from "../lib/commission";

export const commissionRouter = router({
  // Agent's own commissions
  mine: authedProcedure.query(async ({ ctx }) => {
    return getCommissionsByRep(ctx.repCode);
  }),

  mySummary: authedProcedure.query(async ({ ctx }) => {
    return getCommissionSummaryByRep(ctx.repCode);
  }),

  // Rate grid — public for display on join page
  grid: authedProcedure.query(() => COMMISSION_SUMMARY),

  // Admin
  all: adminProcedure
    .input(
      z.object({
        status:  z.string().optional(),
        repCode: z.string().optional(),
      })
    )
    .query(async ({ input }) => getAllCommissions(input)),

  updateStatus: adminProcedure
    .input(
      z.object({
        id:     z.number(),
        status: z.enum(["pending", "approved", "paid", "rejected"]),
        notes:  z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await updateCommissionStatus(input.id, input.status, input.notes);
      return { ok: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCommission(input.id);
      return { ok: true };
    }),
});
