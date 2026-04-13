/**
 * routers/videos.ts
 * Training videos — admin CRUD, agents view only.
 */

import { z } from "zod";
import { router, authedProcedure, adminProcedure } from "./trpc";
import { db } from "../db/client";
import { videos } from "../db/schema";
import { eq, asc, desc } from "drizzle-orm";

const videoInput = z.object({
  title:          z.string().min(1),
  category:       z.string().default("Getting Started"),
  duration:       z.string().optional(),
  videoUrl:       z.string().optional(),
  thumbnailColor: z.string().default("#15283A"),
  featured:       z.boolean().default(false),
  isPublished:    z.boolean().default(true),
  createdBy:      z.string().default("Admin"),
});

export const videosRouter = router({
  // Agents: list all published videos
  list: authedProcedure.query(async () => {
    return db.query.videos.findMany({
      where: eq(videos.isPublished, true),
      orderBy: [desc(videos.featured), desc(videos.createdAt)],
    });
  }),

  // Admin: list all videos
  listAll: adminProcedure.query(async () => {
    return db.query.videos.findMany({
      orderBy: [desc(videos.createdAt)],
    });
  }),

  // Admin: create video
  create: adminProcedure
    .input(videoInput)
    .mutation(async ({ input }) => {
      await db.insert(videos).values(input);
      return { ok: true };
    }),

  // Admin: update video
  update: adminProcedure
    .input(videoInput.extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(videos).set({ ...data, updatedAt: new Date() }).where(eq(videos.id, id));
      return { ok: true };
    }),

  // Admin: delete video
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(videos).where(eq(videos.id, input.id));
      return { ok: true };
    }),

  // Admin: increment view count (also usable by agents)
  incrementView: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const video = await db.query.videos.findFirst({ where: eq(videos.id, input.id) });
      if (video) {
        await db.update(videos).set({ viewCount: (video.viewCount ?? 0) + 1 }).where(eq(videos.id, input.id));
      }
      return { ok: true };
    }),
});
