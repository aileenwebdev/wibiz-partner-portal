/**
 * ghl.ts
 * GHL (Go High Level) API service layer — Scale360 scope only.
 *
 * All GHL IDs are constants sourced from the original BC360 codebase.
 * Swap via env vars if the GHL location changes.
 */

import axios from "axios";
import { env } from "../env";

// ─── Pipeline IDs ─────────────────────────────────────────────────────────────
export const GHL_PIPELINES = {
  scale360PartnerFunnel: env.GHL_SCALE360_PIPELINE_ID,       // mzgOuQhHmkDuixcpiSbj
  scale360Enterprise:    env.GHL_SCALE360_ENTERPRISE_PIPELINE_ID, // HmZA3KEdITefCLNZwg1H
  agentRegistration:     env.GHL_AGENT_REGISTRATION_PIPELINE_ID,  // vCKGDQraPNtxKrfwFgzo
  certification:         env.GHL_CERTIFICATION_PIPELINE_ID,        // NVuQYzsEUR3LSc7cUvEc
} as const;

// ─── Pipeline Stages ──────────────────────────────────────────────────────────
// Internal stage name → GHL stage name mapping for Scale360 pipelines
export const SCALE360_STAGES = [
  "new_lead",
  "audit_scheduled",
  "audit_complete",
  "proposal_sent",
  "payment_received",
  "active_client",
  "churned",
] as const;
export type Scale360Stage = (typeof SCALE360_STAGES)[number];

// Stage that triggers commission creation
export const PAYMENT_TRIGGER_STAGE: Scale360Stage = "payment_received";

// ─── Calendar IDs ─────────────────────────────────────────────────────────────
export const GHL_CALENDARS = {
  training: env.GHL_SCALE360_TRAINING_CALENDAR_ID,  // BNSDF3gHtSZuzgLMkijr
} as const;

// ─── GHL Custom Field Keys ────────────────────────────────────────────────────
// These are the field keys registered in the GHL location.
// Used for both reading inbound payloads and writing back to contacts.
export const GHL_FIELDS = {
  // Attribution write-back
  repCode:                "rep_code",
  bc360AgentId:           "bc360_agent_id",
  agentLevel:             "agent_level",
  uplineRepCode:          "upline_rep_code",
  mgaRepCode:             "mga_rep_code",
  referrerAgentEmail:     "referrer_agent_email",
  referrerAgentName:      "referrer_agent_name",
  referrerAgentPhone:     "referrer_agent_phone",
  referrerAgentContactId: "referrer_agent_contact_id",
  attributionStatus:      "attribution_status",

  // Upline info (for downline GHL contacts)
  uplineName:          "upline_name",
  uplineEmail:         "upline_email",
  uplinePhone:         "upline_phone",

  // Agent portal
  dashboardUrl:        "dashboard_url",
  verifyLink:          "verify_link",

  // Scale360 audit results
  s360AuditScore:      "s360_audit_score",
  s360AuditStatus:     "s360_audit_status",
  s360PlanName:        "s360_plan_name",
  s360PdfLink:         "s360_pdf_link",
  s360Roi:             "s360_roi",

  // Kickstart
  kickstartUsername:   "kickstart_username",
  kickstartTempPass:   "kickstart_temp_password",
} as const;

// ─── HTTP Client ──────────────────────────────────────────────────────────────
const ghlApi = axios.create({
  baseURL: "https://services.leadconnectorhq.com",
  headers: {
    Authorization: `Bearer ${env.GHL_PRIVATE_API_KEY}`,
    Version:       "2021-07-28",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── Contact CRUD ─────────────────────────────────────────────────────────────

export interface GhlContactInput {
  firstName?:       string;
  lastName?:        string;
  email?:           string;
  phone?:           string;
  // Agent fields
  repCode?:         string;
  agentLevel?:      string;
  uplineRepCode?:   string;
  uplineName?:      string;
  uplineEmail?:     string;
  uplinePhone?:     string;
  mgaRepCode?:      string;
  dashboardUrl?:    string;
  verifyLink?:      string;
  // Attribution fields
  referrerAgentEmail?:     string;
  referrerAgentName?:      string;
  referrerAgentPhone?:     string;
  referrerAgentContactId?: string;
  attributionStatus?:      string;
}

export async function ghlCreateContact(input: GhlContactInput): Promise<string> {
  const customFields = buildCustomFields(input);
  const res = await ghlApi.post(`/contacts/`, {
    locationId:   env.GHL_LOCATION_ID,
    firstName:    input.firstName,
    lastName:     input.lastName,
    email:        input.email,
    phone:        input.phone,
    customFields,
  });
  return res.data?.contact?.id as string;
}

export async function ghlUpdateContact(
  ghlContactId: string,
  fields: Partial<GhlContactInput>
): Promise<void> {
  const customFields = buildCustomFields(fields as GhlContactInput);
  await ghlApi.put(`/contacts/${ghlContactId}`, {
    customFields,
    ...(fields.firstName && { firstName: fields.firstName }),
    ...(fields.lastName  && { lastName:  fields.lastName  }),
    ...(fields.email     && { email:     fields.email     }),
    ...(fields.phone     && { phone:     fields.phone     }),
  });
}

export async function ghlGetContact(ghlContactId: string): Promise<Record<string, unknown>> {
  const res = await ghlApi.get(`/contacts/${ghlContactId}`);
  return res.data?.contact ?? {};
}

/**
 * Pull all contacts from GHL for the configured location.
 * Paginates automatically until all contacts are fetched (max 10 pages for safety).
 * Returns flat array of contact objects.
 */
export async function ghlListContacts(opts?: { tag?: string; limit?: number }): Promise<Record<string, unknown>[]> {
  const pageSize = 100;
  const maxPages = 10;
  const all: Record<string, unknown>[] = [];

  let startAfter: string | undefined;
  let startAfterId: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const params: Record<string, unknown> = {
      locationId: env.GHL_LOCATION_ID,
      limit: pageSize,
    };
    if (opts?.tag)          params.tags = opts.tag;
    if (startAfter)         params.startAfter = startAfter;
    if (startAfterId)       params.startAfterId = startAfterId;

    const res = await ghlApi.get("/contacts/", { params });
    const contacts: Record<string, unknown>[] = res.data?.contacts ?? [];
    all.push(...contacts);

    const meta = res.data?.meta ?? {};
    if (!meta.nextPageUrl && contacts.length < pageSize) break;
    if (contacts.length < pageSize) break;

    // GHL v2 pagination uses startAfter (timestamp) + startAfterId
    const last = contacts[contacts.length - 1] as Record<string, unknown>;
    startAfter   = String(last.dateAdded ?? "");
    startAfterId = String(last.id ?? "");

    if (opts?.limit && all.length >= opts.limit) break;
  }

  return all;
}

/**
 * Extract a flat key→value map from GHL contact's customFields array.
 * GHL returns: customFields: [{id, fieldKey, value}]
 */
export function flattenGhlCustomFields(contact: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const arr = contact.customFields as Array<{ fieldKey?: string; id?: string; value?: unknown }> | undefined;
  if (!Array.isArray(arr)) return out;
  for (const f of arr) {
    const key = (f.fieldKey ?? f.id ?? "").toLowerCase().replace(/\s+/g, "_");
    if (key && f.value != null && f.value !== "") {
      out[key] = String(f.value);
    }
  }
  return out;
}

/**
 * Pull all opportunities from a specific pipeline.
 * Returns flat array with stage name already resolved.
 */
export async function ghlListOpportunities(pipelineId: string): Promise<Record<string, unknown>[]> {
  const pageSize = 100;
  const maxPages = 20;
  const all: Record<string, unknown>[] = [];
  let startAfterId: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const params: Record<string, unknown> = {
      location_id: env.GHL_LOCATION_ID,
      pipeline_id: pipelineId,
      limit:       pageSize,
    };
    if (startAfterId) params.startAfterId = startAfterId;

    const res  = await ghlApi.get("/opportunities/search", { params });
    const opps: Record<string, unknown>[] = res.data?.opportunities ?? [];
    all.push(...opps);

    if (opps.length < pageSize) break;
    const last = opps[opps.length - 1] as Record<string, unknown>;
    startAfterId = String(last.id ?? "");
  }

  return all;
}

// ─── Attribution Write-back ───────────────────────────────────────────────────

export async function ghlWriteAttribution(
  ghlContactId: string,
  repCode: string,
  agentName: string,
  agentEmail: string,
  status: "resolved" | "unresolved" | "no_rep_code",
  agentPhone?: string | null,
  agentContactId?: string | null,
): Promise<void> {
  await ghlUpdateContact(ghlContactId, {
    referrerAgentName:      agentName,
    referrerAgentEmail:     agentEmail,
    referrerAgentPhone:     agentPhone    ?? undefined,
    referrerAgentContactId: agentContactId ?? undefined,
    attributionStatus:      status,
    repCode,
  });
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

/** Add tags to a GHL contact without replacing existing ones */
export async function ghlAddTags(ghlContactId: string, tags: string[]): Promise<void> {
  await ghlApi.post(`/contacts/${ghlContactId}/tags`, { tags });
}

// ─── Upline Sync ──────────────────────────────────────────────────────────────

export async function ghlSyncUplineFields(
  ghlContactId: string,
  upline: { name: string; email: string; phone?: string }
): Promise<void> {
  await ghlUpdateContact(ghlContactId, {
    uplineName:  upline.name,
    uplineEmail: upline.email,
    uplinePhone: upline.phone,
  });
}

// ─── Inbound Webhook ──────────────────────────────────────────────────────────

export async function sendToScale360InboundWebhook(payload: unknown): Promise<void> {
  if (!env.GHL_SCALE360_INBOUND_WEBHOOK_URL) return;
  await axios.post(env.GHL_SCALE360_INBOUND_WEBHOOK_URL, payload, { timeout: 10000 });
}

// ─── Make.com ─────────────────────────────────────────────────────────────────

export async function fireMakeWebhook(event: string, data: unknown): Promise<void> {
  if (!env.MAKE_WEBHOOK_URL) return;
  await axios.post(env.MAKE_WEBHOOK_URL, { event, data }, { timeout: 10000 }).catch(() => {
    // Non-blocking — log but don't throw
    console.warn("[Make] Webhook failed silently");
  });
}

// ─── Custom Field Builder ─────────────────────────────────────────────────────

function buildCustomFields(input: GhlContactInput): Array<{ key: string; field_value: string }> {
  const map: Array<[keyof typeof GHL_FIELDS, string | undefined]> = [
    ["repCode",                input.repCode],
    ["agentLevel",             input.agentLevel],
    ["uplineRepCode",          input.uplineRepCode],
    ["uplineName",             input.uplineName],
    ["mgaRepCode",             input.mgaRepCode],
    ["dashboardUrl",           input.dashboardUrl],
    ["verifyLink",             input.verifyLink],
    ["referrerAgentEmail",     input.referrerAgentEmail],
    ["referrerAgentName",      input.referrerAgentName],
    ["referrerAgentPhone",     input.referrerAgentPhone],
    ["referrerAgentContactId", input.referrerAgentContactId],
    ["attributionStatus",      input.attributionStatus],
  ];

  return map
    .filter(([, val]) => val != null && val !== "")
    .map(([key, val]) => ({ key: GHL_FIELDS[key], field_value: val! }));
}
