/**
 * commission.ts
 * Scale360-only commission grid and calculation logic.
 *
 * Rates are applied to the deal fee at the time of payment.
 * Both setup (one-time) and monthly (recurring) use the same rate per level.
 */

import type { AgentLevel, CommissionType } from "../db/schema";

// ─── Commission Grid ──────────────────────────────────────────────────────────
// Source: docs/features/commissions.md + server/ghl.ts COMMISSION_GRID.Scale360

export const COMMISSION_GRID: Record<AgentLevel, Record<CommissionType, number>> = {
  "Super Agency":      { setup: 0.40, monthly: 0.40, bonus: 0 },
  "Super Team":        { setup: 0.40, monthly: 0.40, bonus: 0 },
  "Agency":            { setup: 0.40, monthly: 0.40, bonus: 0 },
  "Senior Associate":  { setup: 0.30, monthly: 0.30, bonus: 0 },
  "Associate":         { setup: 0.20, monthly: 0.20, bonus: 0 },
};

export interface CommissionResult {
  amount: number;       // dollar amount
  rate: number;         // decimal rate applied (e.g. 0.30)
  baseFee: number;      // fee the rate was applied to
  type: CommissionType;
  agentLevel: AgentLevel;
}

/**
 * calculateCommission()
 * Returns the commission amount for a given agent level, fee, and type.
 * Rounds to 2 decimal places.
 */
export function calculateCommission(
  agentLevel: AgentLevel,
  baseFee: number,
  type: CommissionType = "setup"
): CommissionResult {
  const rate = COMMISSION_GRID[agentLevel][type];
  const amount = Math.round(baseFee * rate * 100) / 100;
  return { amount, rate, baseFee, type, agentLevel };
}

/**
 * getLevelRate()
 * Quick lookup — returns the rate decimal for a level + type.
 */
export function getLevelRate(agentLevel: AgentLevel, type: CommissionType = "setup"): number {
  return COMMISSION_GRID[agentLevel][type];
}

/**
 * displayRate()
 * Returns a human-readable percentage string: "30%"
 */
export function displayRate(agentLevel: AgentLevel, type: CommissionType = "setup"): string {
  return `${(COMMISSION_GRID[agentLevel][type] * 100).toFixed(0)}%`;
}

/**
 * COMMISSION_SUMMARY
 * Static display data for the agent dashboard commission table.
 */
export const COMMISSION_SUMMARY: Array<{
  level: AgentLevel;
  setup: string;
  monthly: string;
}> = [
  { level: "Agency",           setup: "40%", monthly: "40%" },
  { level: "Senior Associate", setup: "30%", monthly: "30%" },
  { level: "Associate",        setup: "20%", monthly: "20%" },
];
