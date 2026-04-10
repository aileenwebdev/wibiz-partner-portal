/**
 * repCode.ts
 * Canonical rep code extraction from GHL webhook payloads.
 *
 * Checks 12 possible field aliases in priority order — covers all known
 * GHL field names, typos, and tag/URL-param fallbacks used in Scale360.
 */

export interface RepCodeMatch {
  code: string;
  field: string; // which alias matched — for logging
}

/**
 * extractRepCode()
 * Pass the raw webhook payload (or GHL contact custom fields object).
 * Returns the first valid BC-XXX code found, or null.
 */
export function extractRepCode(payload: Record<string, unknown>): RepCodeMatch | null {
  const customFields = flattenCustomFields(payload);

  // Priority-ordered alias list
  const directAliases: string[] = [
    "rep_code",
    "bc360_agent_id",
    "agent_id",
    "referrer_agent_id",
    "ref_id",
    "affiliate_ref_id",
    "affiliate_red_id", // intentional typo variant seen in GHL payloads
    "repcode",
    "rep_id",
  ];

  for (const alias of directAliases) {
    const val = customFields[alias] ?? (payload as Record<string, unknown>)[alias];
    if (val && isValidRepCode(String(val))) {
      return { code: normalizeRepCode(String(val)), field: alias };
    }
  }

  // Tag prefix: "rep:BC-360"
  const tags = extractTags(payload);
  for (const tag of tags) {
    const match = tag.match(/^rep:(.+)/i);
    if (match && isValidRepCode(match[1])) {
      return { code: normalizeRepCode(match[1]), field: "tag:rep:" };
    }
  }

  // URL params: ?ref=BC-360
  const urlParams = extractUrlParams(payload);
  if (urlParams.ref && isValidRepCode(urlParams.ref)) {
    return { code: normalizeRepCode(urlParams.ref), field: "url_params.ref" };
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** BC-360 format — case-insensitive, normalised to uppercase */
function isValidRepCode(val: string): boolean {
  return /^BC-\d+$/i.test(val.trim());
}

function normalizeRepCode(val: string): string {
  return val.trim().toUpperCase();
}

/**
 * GHL sends custom fields either as:
 *   - { customFields: [ { id, name, value }, ... ] }
 *   - { customData: { field_key: value, ... } }
 *   - flat keys on root
 * Returns a flat key→value map.
 */
function flattenCustomFields(payload: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};

  // Array format: customFields[]
  const arr = (payload.customFields ?? payload.custom_fields) as
    | Array<{ name?: string; key?: string; value?: unknown }>
    | undefined;
  if (Array.isArray(arr)) {
    for (const f of arr) {
      const key = (f.name ?? f.key ?? "").toLowerCase().replace(/\s+/g, "_");
      if (key && f.value != null) out[key] = String(f.value);
    }
  }

  // Object format: customData{}
  const obj = (payload.customData ?? payload.custom_data) as
    | Record<string, unknown>
    | undefined;
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (v != null) out[k.toLowerCase()] = String(v);
    }
  }

  return out;
}

function extractTags(payload: Record<string, unknown>): string[] {
  const tags = payload.tags;
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string") return [tags];
  return [];
}

function extractUrlParams(payload: Record<string, unknown>): Record<string, string> {
  const p = (payload.url_params ?? payload.urlParams) as
    | Record<string, unknown>
    | undefined;
  if (!p || typeof p !== "object") return {};
  return Object.fromEntries(
    Object.entries(p).map(([k, v]) => [k, String(v)])
  );
}
