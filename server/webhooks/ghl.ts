/**
 * webhooks/ghl.ts
 * POST /api/ghl/webhook
 *
 * Main GHL webhook handler — receives ContactCreate, ContactUpdate,
 * AppointmentCreate events. Runs attribution on every contact event.
 */

import type { Request, Response } from "express";
import { resolveAttribution, logWebhookEvent } from "../lib/attribution";
import { db } from "../db/client";
import { trainingBookings } from "../db/schema";
import { getRepByGhlContactId } from "../db/queries/reps";
import { GHL_CALENDARS } from "../lib/ghl";

export async function handleGhlWebhook(req: Request, res: Response): Promise<void> {
  const payload = req.body as Record<string, unknown>;
  const eventType = String(payload.type ?? payload.event ?? "");

  try {
    if (eventType === "AppointmentCreate") {
      await handleAppointment(payload);
      res.json({ ok: true });
      return;
    }

    // ContactCreate / ContactUpdate — run attribution
    const result = await resolveAttribution(payload, "/api/ghl/webhook");
    await logWebhookEvent("/api/ghl/webhook", payload, result);

    res.json({ ok: true, status: result.status, repCode: result.repCode });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[GHL Webhook]", msg);
    res.status(500).json({ error: msg });
  }
}

async function handleAppointment(payload: Record<string, unknown>): Promise<void> {
  const ghlContactId = String(payload.contactId ?? payload.contact_id ?? "");
  const calendarId   = String(payload.calendarId ?? payload.calendar_id ?? "");
  const appointmentId = String(payload.id ?? "");

  if (!ghlContactId) return;

  const rep = await getRepByGhlContactId(ghlContactId);
  if (!rep) return;

  await db.insert(trainingBookings).values({
    repId:            rep.id,
    repCode:          rep.repCode,
    calendarId,
    ghlAppointmentId: appointmentId,
    scheduledAt:      payload.startTime ? new Date(String(payload.startTime)) : undefined,
  });
}
