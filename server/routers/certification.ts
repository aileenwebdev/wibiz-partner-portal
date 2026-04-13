/**
 * routers/certification.ts
 * Scale360 certification quiz — 10 questions, 80% passing threshold.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure, adminProcedure } from "./trpc";
import { db } from "../db/client";
import { certifications } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getRepByCode } from "../db/queries/reps";
import { provisionKickstartAgent } from "../lib/kickstart";

// ─── Quiz definition ──────────────────────────────────────────────────────────
// 10 questions, 8/10 = 80% to pass

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What does Scale360 primarily help businesses with?",
    options: [
      "Social media marketing",
      "AI automation and employee efficiency",
      "Accounting software",
      "Website design",
    ],
    correct: 1,
  },
  {
    id: 2,
    question: "What is the commission rate for an Associate on a Scale360 setup fee?",
    options: ["10%", "20%", "30%", "40%"],
    correct: 1,
  },
  {
    id: 3,
    question: "What is the commission rate for an Agency on a Scale360 setup fee?",
    options: ["20%", "30%", "40%", "50%"],
    correct: 2,
  },
  {
    id: 4,
    question: "What format are Wibiz Partner rep codes in?",
    options: ["WB-001", "BC-360", "AG-100", "REP-001"],
    correct: 1,
  },
  {
    id: 5,
    question: "What is the minimum passing score for the Scale360 certification?",
    options: ["70%", "75%", "80%", "90%"],
    correct: 2,
  },
  {
    id: 6,
    question: "What does the mgaRepCode represent?",
    options: [
      "The direct upline agent",
      "The nearest Agency-or-above ancestor for commission cascading",
      "The admin account",
      "The partner's GHL contact ID",
    ],
    correct: 1,
  },
  {
    id: 7,
    question: "Which agent level is directly above Senior Associate?",
    options: ["Super Team", "Agency", "Super Agency", "Associate"],
    correct: 1,
  },
  {
    id: 8,
    question: "What triggers a commission record to be created?",
    options: [
      "Lead submits audit form",
      "Lead books a consultation",
      "Payment is confirmed (lead reaches payment_received stage)",
      "Admin manually creates it",
    ],
    correct: 2,
  },
  {
    id: 9,
    question: "How are referral links formatted for Wibiz?",
    options: [
      "https://wibiz.ai/ref/WBZ-001",
      "https://start.wibiz.ai/?ref=WBZ-001",
      "https://portal.wibiz.ai/join?agent=WBZ-001",
      "https://wibiz.com/?partner=WBZ-001",
    ],
    correct: 1,
  },
  {
    id: 10,
    question: "What happens after an agent passes Wibiz certification?",
    options: [
      "They are automatically promoted to Agency",
      "They receive a 50% commission bonus",
      "Kickstart access can be provisioned for their account",
      "Nothing — certification is for display only",
    ],
    correct: 2,
  },
] as const;

const PASSING_SCORE = 8; // 8/10 = 80%

// ─── Router ───────────────────────────────────────────────────────────────────

export const certificationRouter = router({
  // Returns questions without correct answers
  getQuiz: authedProcedure.query(() => {
    return QUIZ_QUESTIONS.map(({ id, question, options }) => ({ id, question, options }));
  }),

  // Submit answers — returns score and pass/fail
  submitQuiz: authedProcedure
    .input(
      z.object({
        answers: z.record(z.string(), z.number()), // { "1": 2, "2": 0, ... }
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rep = await getRepByCode(ctx.repCode);
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });

      // Already certified?
      const existing = await db.query.certifications.findFirst({
        where: and(
          eq(certifications.repId, rep.id),
          eq(certifications.passed, true)
        ),
      });
      if (existing) {
        return { passed: true, score: existing.score, total: 10, alreadyCertified: true };
      }

      // Grade
      let correct = 0;
      for (const q of QUIZ_QUESTIONS) {
        if (input.answers[String(q.id)] === q.correct) correct++;
      }

      const passed = correct >= PASSING_SCORE;

      await db.insert(certifications).values({
        repId:          rep.id,
        repCode:        rep.repCode,
        vertical:       "Wibiz",
        score:          correct,
        totalQuestions: 10,
        passed,
        passedAt:       passed ? new Date() : undefined,
      });

      return { passed, score: correct, total: 10, alreadyCertified: false };
    }),

  // Check certification status for current rep
  myStatus: authedProcedure.query(async ({ ctx }) => {
    const rep = await getRepByCode(ctx.repCode);
    if (!rep) throw new TRPCError({ code: "NOT_FOUND" });

    const cert = await db.query.certifications.findFirst({
      where: and(
        eq(certifications.repId, rep.id),
        eq(certifications.passed, true)
      ),
    });

    return {
      certified: !!cert,
      passedAt:  cert?.passedAt,
      score:     cert?.score,
    };
  }),

  // Trigger Kickstart provisioning after cert pass
  activateKickstart: authedProcedure.mutation(async ({ ctx }) => {
    const rep = await getRepByCode(ctx.repCode);
    if (!rep) throw new TRPCError({ code: "NOT_FOUND" });

    // Verify certified
    const cert = await db.query.certifications.findFirst({
      where: and(eq(certifications.repId, rep.id), eq(certifications.passed, true)),
    });
    if (!cert) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Scale360 certification required" });
    }

    const result = await provisionKickstartAgent({
      repCode:      rep.repCode,
      email:        rep.email,
      username:     rep.username ?? rep.email,
      tempPassword: rep.tempPasswordPlain ?? "changeme",
      legalFullName: rep.legalFullName ?? rep.email,
    });

    return result;
  }),

  // Admin: all certification attempts
  adminList: adminProcedure.query(async () => {
    return db.query.certifications.findMany({
      orderBy: [desc(certifications.createdAt)],
    });
  }),
});
