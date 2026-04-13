/**
 * routers/events.ts
 * Upcoming events — admin CRUD, agents view only.
 */

import { z } from "zod";
import { router, authedProcedure, adminProcedure } from "./trpc";
import { db } from "../db/client";
import { events } from "../db/schema";
import { eq, gte, asc, desc } from "drizzle-orm";

const eventInput = z.object({
  title:        z.string().min(1),
  description:  z.string().optional(),
  platform:     z.enum(["zoom", "meet", "webinar", "in_person"]).default("zoom"),
  meetingUrl:   z.string().url().optional().or(z.literal("")),
  badge:        z.string().default("Training"),
  badgeColor:   z.string().default("purple"),
  startsAt:     z.string(), // ISO string
  endsAt:       z.string().optional(),
  attendeeCount: z.number().default(0),
  isPublished:  z.boolean().default(true),
});

export const eventsRouter = router({
  // Agents: list upcoming published events
  list: authedProcedure.query(async () => {
    return db.query.events.findMany({
      where: eq(events.isPublished, true),
      orderBy: [asc(events.startsAt)],
    });
  }),

  // Admin: list all events
  listAll: adminProcedure.query(async () => {
    return db.query.events.findMany({
      orderBy: [desc(events.startsAt)],
    });
  }),

  // Admin: create event
  create: adminProcedure
    .input(eventInput)
    .mutation(async ({ input }) => {
      await db.insert(events).values({
        title:        input.title,
        description:  input.description,
        platform:     input.platform,
        meetingUrl:   input.meetingUrl || undefined,
        badge:        input.badge,
        badgeColor:   input.badgeColor,
        startsAt:     new Date(input.startsAt),
        endsAt:       input.endsAt ? new Date(input.endsAt) : undefined,
        attendeeCount: input.attendeeCount,
        isPublished:  input.isPublished,
      });
      return { ok: true };
    }),

  // Admin: update event
  update: adminProcedure
    .input(eventInput.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.update(events).set({
        title:        input.title,
        description:  input.description,
        platform:     input.platform,
        meetingUrl:   input.meetingUrl || undefined,
        badge:        input.badge,
        badgeColor:   input.badgeColor,
        startsAt:     new Date(input.startsAt),
        endsAt:       input.endsAt ? new Date(input.endsAt) : undefined,
        attendeeCount: input.attendeeCount,
        isPublished:  input.isPublished,
        updatedAt:    new Date(),
      }).where(eq(events.id, input.id));
      return { ok: true };
    }),

  // Admin: delete event
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(events).where(eq(events.id, input.id));
      return { ok: true };
    }),
});
