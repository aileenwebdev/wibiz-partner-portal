/**
 * Client-safe constants — no server/drizzle imports.
 */

export const COMMISSION_SUMMARY = [
  { level: "Agency",           setup: "40%", monthly: "40%" },
  { level: "Senior Associate", setup: "30%", monthly: "30%" },
  { level: "Associate",        setup: "20%", monthly: "20%" },
] as const;

export const AGENT_LEVELS = [
  "Super Agency",
  "Super Team",
  "Agency",
  "Senior Associate",
  "Associate",
] as const;

export type AgentLevel = (typeof AGENT_LEVELS)[number];
