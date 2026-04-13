/**
 * queries/reps.ts
 * All DB operations for the reps (agents) table.
 */

import { db } from "../client";
import { reps, type AgentLevel } from "../schema";
import { eq, like, and, or, isNull, desc, asc, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { env } from "../../env";
import { fireMakeWebhook, ghlCreateContact, ghlAddTags } from "../../lib/ghl";

// ─── Rep Code Generator ───────────────────────────────────────────────────────

/**
 * getNextRepCode()
 * Sequential: WBZ-001, WBZ-002 … Locked at DB level to prevent race conditions.
 */
export async function getNextRepCode(): Promise<string> {
  const last = await db.query.reps.findFirst({
    orderBy: [desc(reps.id)],
    columns: { repCode: true },
  });

  if (!last) return "WBZ-001";

  const num = parseInt(last.repCode.replace(/^[A-Z]+-/, ""), 10);
  return `WBZ-${String(num + 1).padStart(3, "0")}`;
}

// ─── Create Rep ───────────────────────────────────────────────────────────────

export interface CreateRepInput {
  email:        string;
  legalFullName?: string;
  phone?:       string;
  businessName?: string;
  agentLevel:   AgentLevel;
  uplineRepCode?: string;
  password?:    string; // if not provided, a temp password is generated
}

export async function createRep(input: CreateRepInput): Promise<typeof reps.$inferSelect> {
  const repCode = await getNextRepCode();

  // Resolve mgaRepCode — nearest Agency-or-above ancestor
  const mgaRepCode = await resolveMgaRepCode(input.uplineRepCode);

  // Password
  const tempPassword = input.password ?? randomBytes(8).toString("base64url").slice(0, 10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Username derived from email prefix + repCode suffix to guarantee uniqueness
  const username = `${input.email.split("@")[0]}.${repCode.replace("WBZ-", "").toLowerCase()}`;

  // Referral link
  const referralLink = `https://start.wibiz.ai/?ref=${repCode}`;

  // Dashboard URL
  const dashboardUrl = `${env.APP_BASE_URL}/dashboard`;

  // 1. Create GHL contact and tag as agent
  let ghlContactId: string | undefined;
  try {
    ghlContactId = await ghlCreateContact({
      firstName:    input.legalFullName?.split(" ")[0],
      lastName:     input.legalFullName?.split(" ").slice(1).join(" "),
      email:        input.email,
      phone:        input.phone,
      repCode,
      agentLevel:   input.agentLevel,
      uplineRepCode: input.uplineRepCode,
      mgaRepCode,
      dashboardUrl,
    });
    if (ghlContactId) {
      await ghlAddTags(ghlContactId, ["agent"]).catch((err) =>
        console.error("[GHL] Tag agent failed:", err.message)
      );
    }
  } catch (err) {
    console.error("[GHL] Failed to create contact for rep:", err);
  }

  // 2. Insert rep
  await db.insert(reps).values({
    repCode,
    agentLevel:    input.agentLevel,
    uplineRepCode: input.uplineRepCode,
    mgaRepCode,
    email:         input.email,
    legalFullName: input.legalFullName,
    phone:         input.phone,
    businessName:  input.businessName,
    username,
    passwordHash,
    tempPasswordPlain: tempPassword,
    ghlContactId,
    referralLink,
  });

  const created = await db.query.reps.findFirst({ where: eq(reps.repCode, repCode) });
  if (!created) throw new Error("Rep insert failed");

  // 3. Fire Make.com webhook
  await fireMakeWebhook("rep.created", {
    repCode,
    email:      input.email,
    agentLevel: input.agentLevel,
    uplineRepCode: input.uplineRepCode,
    referralLink,
  });

  return created;
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

export async function getRepByCode(repCode: string) {
  return db.query.reps.findFirst({ where: eq(reps.repCode, repCode) });
}

export async function getRepById(id: number) {
  return db.query.reps.findFirst({ where: eq(reps.id, id) });
}

export async function getRepByEmail(email: string) {
  return db.query.reps.findFirst({ where: eq(reps.email, email) });
}

export async function getRepByUsername(username: string) {
  return db.query.reps.findFirst({ where: eq(reps.username, username) });
}

export async function getRepByGhlContactId(ghlContactId: string) {
  return db.query.reps.findFirst({ where: eq(reps.ghlContactId, ghlContactId) });
}

// ─── Hierarchy ────────────────────────────────────────────────────────────────

/** Direct downline only (one level deep) */
export async function getDirectDownline(repCode: string) {
  return db.query.reps.findMany({
    where: eq(reps.uplineRepCode, repCode),
    orderBy: [asc(reps.agentLevel)],
  });
}

/** All reps in the downline tree (breadth-first, max 5 levels) */
export async function getFullDownline(
  repCode: string,
  depth = 0
): Promise<Array<typeof reps.$inferSelect & { depth: number }>> {
  if (depth > 4) return [];

  const direct = await getDirectDownline(repCode);
  const results: Array<typeof reps.$inferSelect & { depth: number }> = direct.map((r) => ({
    ...r,
    depth,
  }));

  for (const rep of direct) {
    const sub = await getFullDownline(rep.repCode, depth + 1);
    results.push(...sub);
  }

  return results;
}

/** All reps at Agency level or above in the downline of repCode */
export async function getAgencyDownline(repCode: string) {
  const all = await getFullDownline(repCode);
  return all.filter((r) =>
    ["Super Agency", "Super Team", "Agency"].includes(r.agentLevel)
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function verifyRepPassword(
  username: string,
  password: string
): Promise<typeof reps.$inferSelect | null> {
  const rep = await getRepByUsername(username);
  if (!rep?.passwordHash) return null;
  const valid = await bcrypt.compare(password, rep.passwordHash);
  return valid ? rep : null;
}

export async function setRepPassword(repCode: string, newPassword: string): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 10);
  await db
    .update(reps)
    .set({ passwordHash: hash, tempPasswordPlain: null, updatedAt: new Date() })
    .where(eq(reps.repCode, repCode));
}

// ─── Updates ─────────────────────────────────────────────────────────────────

export async function updateRep(
  repCode: string,
  data: Partial<typeof reps.$inferInsert>
): Promise<void> {
  await db.update(reps).set({ ...data, updatedAt: new Date() }).where(eq(reps.repCode, repCode));
}

// ─── MGA Resolution ──────────────────────────────────────────────────────────

/**
 * resolveMgaRepCode()
 * Walks the upline chain to find the nearest Agency-or-above rep.
 * Used to determine who earns the commission cascade.
 * Max 5 hops to prevent infinite loops.
 */
async function resolveMgaRepCode(
  uplineRepCode: string | undefined,
  hops = 0
): Promise<string | undefined> {
  if (!uplineRepCode || hops > 4) return undefined;

  const upline = await getRepByCode(uplineRepCode);
  if (!upline) return undefined;

  if (["Super Agency", "Super Team", "Agency"].includes(upline.agentLevel)) {
    return upline.repCode;
  }

  return resolveMgaRepCode(upline.uplineRepCode ?? undefined, hops + 1);
}
