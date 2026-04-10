/**
 * trpc.ts
 * tRPC base — context, middleware, and procedure builders.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import type { Request, Response } from "express";
import { z } from "zod";

// ─── Context ──────────────────────────────────────────────────────────────────

export interface TRPCContext {
  req:       Request;
  res:       Response;
  session:   Request["session"];
  repCode:   string | null;
  isAdmin:   boolean;
}

export function createContext({ req, res }: { req: Request; res: Response }): TRPCContext {
  const session = req.session as Request["session"] & {
    repCode?: string;
    isAdmin?: boolean;
  };

  return {
    req,
    res,
    session,
    repCode: session.repCode ?? null,
    isAdmin: session.isAdmin ?? false,
  };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const t = initTRPC.context<TRPCContext>().create();

export const router    = t.router;
export const publicProcedure = t.procedure;

// ─── Auth Middleware ──────────────────────────────────────────────────────────

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.repCode) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, repCode: ctx.repCode } });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.isAdmin) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const authedProcedure = t.procedure.use(isAuthed);
export const adminProcedure  = t.procedure.use(isAdmin);
