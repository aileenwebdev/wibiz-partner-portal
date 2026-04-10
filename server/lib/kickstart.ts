/**
 * kickstart.ts
 * Scale360 Kickstart provisioning.
 * Fires HMAC-SHA256 signed webhook after an agent passes Scale360 certification.
 */

import crypto from "crypto";
import axios from "axios";
import { env } from "../env";

export interface KickstartPayload {
  bc360_agent_id:     string;  // rep code
  email:              string;
  username:           string;
  temp_password:      string;
  legal_full_name:    string;
  scale360_certified: true;
  event:              "scale360.agent.provision";
}

/**
 * provisionKickstartAgent()
 * Called after Scale360 cert pass. No-ops if KICKSTART_ENABLED=false.
 */
export async function provisionKickstartAgent(input: {
  repCode: string;
  email: string;
  username: string;
  tempPassword: string;
  legalFullName: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!env.KICKSTART_ENABLED) {
    return { success: false, error: "Kickstart provisioning is disabled" };
  }

  if (!env.KICKSTART_WEBHOOK_URL || !env.KICKSTART_SYNC_SECRET) {
    return { success: false, error: "Kickstart not configured (missing URL or secret)" };
  }

  const payload: KickstartPayload = {
    bc360_agent_id:     input.repCode,
    email:              input.email,
    username:           input.username,
    temp_password:      input.tempPassword,
    legal_full_name:    input.legalFullName,
    scale360_certified: true,
    event:              "scale360.agent.provision",
  };

  const body = JSON.stringify(payload);
  const signature = signPayload(body, env.KICKSTART_SYNC_SECRET);

  try {
    await axios.post(env.KICKSTART_WEBHOOK_URL, payload, {
      headers: {
        "Content-Type":        "application/json",
        "X-Wibiz-Signature":   signature,
        "X-Wibiz-Timestamp":   String(Date.now()),
      },
      timeout: 15000,
    });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

/**
 * verifyKickstartSignature()
 * Used by the receiving Kickstart app to verify inbound payloads.
 */
export function verifyKickstartSignature(
  body: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expected = signPayload(body, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSignature));
}

function signPayload(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}
