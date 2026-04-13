import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  json,
  mysqlEnum,
  decimal,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ─── Agent Levels ─────────────────────────────────────────────────────────────
export const AGENT_LEVELS = [
  "Super Agency",
  "Super Team",
  "Agency",
  "Senior Associate",
  "Associate",
] as const;
export type AgentLevel = (typeof AGENT_LEVELS)[number];

// ─── Commission Types ─────────────────────────────────────────────────────────
export const COMMISSION_TYPES = ["setup", "monthly", "bonus"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

// ─── Attribution Statuses ─────────────────────────────────────────────────────
export const ATTRIBUTION_STATUSES = ["resolved", "unresolved", "no_rep_code"] as const;

// ─── Reps (Agents) ────────────────────────────────────────────────────────────
export const reps = mysqlTable(
  "reps",
  {
    id: int("id").primaryKey().autoincrement(),
    repCode: varchar("rep_code", { length: 20 }).notNull().unique(),    // BC-360, BC-361 …
    agentLevel: mysqlEnum("agent_level", AGENT_LEVELS).notNull().default("Associate"),
    uplineRepCode: varchar("upline_rep_code", { length: 20 }),          // direct upline
    mgaRepCode: varchar("mga_rep_code", { length: 20 }),                // nearest Agency+ ancestor

    // Identity
    legalFullName: varchar("legal_full_name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 30 }),
    businessName: varchar("business_name", { length: 255 }),

    // Portal login
    username: varchar("username", { length: 100 }).unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    tempPasswordPlain: varchar("temp_password_plain", { length: 100 }),  // shown once on creation

    // GHL sync
    ghlContactId: varchar("ghl_contact_id", { length: 100 }).unique(),

    // Referral
    referralLink: varchar("referral_link", { length: 500 }),            // https://scale360.wibiz.ai/?ref=BC-360

    // Identity verification
    identityVerificationStatus: mysqlEnum("identity_verification_status", [
      "pending",
      "submitted",
      "approved",
      "rejected",
    ]).default("pending"),
    identityVerificationNotes: text("identity_verification_notes"),

    // Kickstart (Scale360 provisioning)
    kickstartUsername: varchar("kickstart_username", { length: 100 }),
    kickstartTempPassword: varchar("kickstart_temp_password", { length: 100 }),
    kickstartProvisionedAt: timestamp("kickstart_provisioned_at"),

    // Status
    isActive: boolean("is_active").default(true),
    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (t) => ({
    uplineIdx: index("idx_reps_upline").on(t.uplineRepCode),
    mgaIdx: index("idx_reps_mga").on(t.mgaRepCode),
    emailIdx: index("idx_reps_email").on(t.email),
    ghlIdx: index("idx_reps_ghl").on(t.ghlContactId),
  })
);

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = mysqlTable(
  "leads",
  {
    id: int("id").primaryKey().autoincrement(),

    // Attribution
    repCode: varchar("rep_code", { length: 20 }),
    repId: int("rep_id"),

    // GHL identifiers
    ghlContactId: varchar("ghl_contact_id", { length: 100 }).unique(),
    ghlOpportunityId: varchar("ghl_opportunity_id", { length: 100 }),

    // Contact info
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    businessName: varchar("business_name", { length: 255 }),

    // Pipeline stage
    currentStage: varchar("current_stage", { length: 100 }),
    pipelineId: varchar("pipeline_id", { length: 100 }),

    // Attribution resolved fields
    referrerAgentName: varchar("referrer_agent_name", { length: 255 }),
    referrerAgentEmail: varchar("referrer_agent_email", { length: 255 }),
    referrerAgentPhone: varchar("referrer_agent_phone", { length: 30 }),
    referrerAgentContactId: varchar("referrer_agent_contact_id", { length: 100 }),
    attributionStatus: mysqlEnum("attribution_status", ["resolved", "unresolved", "no_rep_code"]).default("unresolved"),

    // Scale360 audit results
    s360AuditScore: varchar("s360_audit_score", { length: 50 }),
    s360AuditStatus: varchar("s360_audit_status", { length: 100 }),
    s360PlanName: varchar("s360_plan_name", { length: 255 }),
    s360PdfLink: text("s360_pdf_link"),
    s360Roi: varchar("s360_roi", { length: 50 }),
    s360EmployeeCount: varchar("s360_employee_count", { length: 50 }),
    s360Industry: varchar("s360_industry", { length: 100 }),
    s360AuditReceivedAt: timestamp("s360_audit_received_at"),

    // Payment
    paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
    paymentConfirmedAt: timestamp("payment_confirmed_at"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (t) => ({
    repCodeIdx: index("idx_leads_rep_code").on(t.repCode),
    repIdIdx: index("idx_leads_rep_id").on(t.repId),
    ghlIdx: index("idx_leads_ghl_contact").on(t.ghlContactId),
    stageIdx: index("idx_leads_stage").on(t.currentStage),
  })
);

// ─── Commissions ──────────────────────────────────────────────────────────────
export const commissions = mysqlTable(
  "commissions",
  {
    id: int("id").primaryKey().autoincrement(),
    repId: int("rep_id").notNull(),
    repCode: varchar("rep_code", { length: 20 }).notNull(),
    leadId: int("lead_id").notNull(),
    type: mysqlEnum("type", COMMISSION_TYPES).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    rate: decimal("rate", { precision: 5, scale: 4 }).notNull(),        // e.g. 0.3000 = 30%
    baseFee: decimal("base_fee", { precision: 10, scale: 2 }),          // fee the rate was applied to
    status: mysqlEnum("status", ["pending", "approved", "paid", "rejected"]).default("pending"),
    notes: text("notes"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (t) => ({
    repIdx: index("idx_commissions_rep").on(t.repCode),
    leadIdx: index("idx_commissions_lead").on(t.leadId),
    statusIdx: index("idx_commissions_status").on(t.status),
  })
);

// ─── Attribution Log ──────────────────────────────────────────────────────────
export const attributionLog = mysqlTable(
  "attribution_log",
  {
    id: int("id").primaryKey().autoincrement(),
    leadId: int("lead_id"),
    ghlContactId: varchar("ghl_contact_id", { length: 100 }),
    attemptedRepCode: varchar("attempted_rep_code", { length: 20 }),
    resolvedRepId: int("resolved_rep_id"),
    status: mysqlEnum("status", ATTRIBUTION_STATUSES).notNull(),
    triggeredBy: varchar("triggered_by", { length: 100 }),              // webhook endpoint
    rawField: varchar("raw_field", { length: 100 }),                    // which alias matched
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    leadIdx: index("idx_attribution_lead").on(t.leadId),
    ghlIdx: index("idx_attribution_ghl").on(t.ghlContactId),
    repCodeIdx: index("idx_attribution_rep_code").on(t.attemptedRepCode),
  })
);

// ─── Webhook Logs ─────────────────────────────────────────────────────────────
export const webhookLogs = mysqlTable(
  "webhook_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    endpoint: varchar("endpoint", { length: 200 }).notNull(),
    repCodeExtracted: varchar("rep_code_extracted", { length: 20 }),
    matchedField: varchar("matched_field", { length: 100 }),
    attributionStatus: mysqlEnum("attribution_status", ATTRIBUTION_STATUSES),
    ghlContactId: varchar("ghl_contact_id", { length: 100 }),
    payload: json("payload"),
    error: text("error"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    endpointIdx: index("idx_webhook_logs_endpoint").on(t.endpoint),
    ghlIdx: index("idx_webhook_logs_ghl").on(t.ghlContactId),
  })
);

// ─── Agent Registration Requests (self-reg flow) ──────────────────────────────
export const agentRegistrationRequests = mysqlTable(
  "agent_registration_requests",
  {
    id: int("id").primaryKey().autoincrement(),
    referredByRepCode: varchar("referred_by_rep_code", { length: 20 }),
    requestedLevel: mysqlEnum("requested_level", AGENT_LEVELS).notNull().default("Associate"),

    // Applicant info
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    businessName: varchar("business_name", { length: 255 }),

    // Workflow
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
    assignedRepCode: varchar("assigned_rep_code", { length: 20 }),      // set on approval
    verifyLink: varchar("verify_link", { length: 500 }),                // ID verification URL
    w9Signed: boolean("w9_signed").default(false),
    agreementAccepted: boolean("agreement_accepted").default(false),

    adminNotes: text("admin_notes"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (t) => ({
    referrerIdx: index("idx_reg_requests_referrer").on(t.referredByRepCode),
    emailIdx: index("idx_reg_requests_email").on(t.email),
    statusIdx: index("idx_reg_requests_status").on(t.status),
  })
);

// ─── Rep Level Upgrade Requests ────────────────────────────────────────────────
export const repLevelUpgradeRequests = mysqlTable(
  "rep_level_upgrade_requests",
  {
    id: int("id").primaryKey().autoincrement(),
    repCode: varchar("rep_code", { length: 20 }).notNull(),
    currentLevel: mysqlEnum("current_level", AGENT_LEVELS).notNull(),
    requestedLevel: mysqlEnum("requested_level", AGENT_LEVELS).notNull(),

    // Hierarchy preservation — never changes after creation
    originalUplineRepCode: varchar("original_upline_rep_code", { length: 20 }),
    nominatedByRepCode: varchar("nominated_by_rep_code", { length: 20 }),

    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
    adminNotes: text("admin_notes"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    repCodeIdx: index("idx_upgrade_rep_code").on(t.repCode),
    statusIdx: index("idx_upgrade_status").on(t.status),
  })
);

// ─── Agent Verification Sessions (token-gated ID upload) ──────────────────────
export const agentVerificationSessions = mysqlTable(
  "agent_verification_sessions",
  {
    id: int("id").primaryKey().autoincrement(),
    repId: int("rep_id").notNull(),
    repCode: varchar("rep_code", { length: 20 }).notNull(),
    token: varchar("token", { length: 100 }).notNull().unique(),
    status: mysqlEnum("status", ["pending", "submitted", "reviewed"]).default("pending"),
    documentUrl: text("document_url"),                                  // S3 URL of uploaded ID
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (t) => ({
    tokenIdx: index("idx_verify_sessions_token").on(t.token),
    repIdx: index("idx_verify_sessions_rep").on(t.repId),
  })
);

// ─── Agreement Acceptances ────────────────────────────────────────────────────
export const agreementAcceptances = mysqlTable(
  "agreement_acceptances",
  {
    id: int("id").primaryKey().autoincrement(),
    repId: int("rep_id"),
    email: varchar("email", { length: 255 }),                           // for pre-registration accepts
    version: varchar("version", { length: 20 }).notNull().default("1.0"),
    ipAddress: varchar("ip_address", { length: 45 }),
    acceptedAt: timestamp("accepted_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    repIdx: index("idx_agreements_rep").on(t.repId),
  })
);

// ─── Certifications ───────────────────────────────────────────────────────────
export const certifications = mysqlTable(
  "certifications",
  {
    id: int("id").primaryKey().autoincrement(),
    repId: int("rep_id").notNull(),
    repCode: varchar("rep_code", { length: 20 }).notNull(),
    vertical: varchar("vertical", { length: 50 }).notNull().default("Scale360"),
    score: int("score").notNull(),                                      // number correct
    totalQuestions: int("total_questions").notNull(),
    passed: boolean("passed").notNull().default(false),
    passedAt: timestamp("passed_at"),
    // GHL sync
    ghlCertPipelineStageId: varchar("ghl_cert_pipeline_stage_id", { length: 100 }),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    repIdx: index("idx_certs_rep").on(t.repId),
    passedIdx: index("idx_certs_passed").on(t.passed),
  })
);

// ─── Training Bookings ────────────────────────────────────────────────────────
export const trainingBookings = mysqlTable(
  "training_bookings",
  {
    id: int("id").primaryKey().autoincrement(),
    repId: int("rep_id").notNull(),
    repCode: varchar("rep_code", { length: 20 }).notNull(),
    calendarId: varchar("calendar_id", { length: 100 }),
    ghlAppointmentId: varchar("ghl_appointment_id", { length: 100 }),
    scheduledAt: timestamp("scheduled_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    repIdx: index("idx_bookings_rep").on(t.repId),
  })
);

// ─── System Settings ──────────────────────────────────────────────────────────
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// ─── Lead Activity Log ────────────────────────────────────────────────────────
export const leadActivity = mysqlTable(
  "lead_activity",
  {
    id: int("id").primaryKey().autoincrement(),
    leadId: int("lead_id").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    fromStage: varchar("from_stage", { length: 100 }),
    toStage: varchar("to_stage", { length: 100 }),
    performedBy: varchar("performed_by", { length: 100 }),             // repCode or "system"
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    leadIdx: index("idx_activity_lead").on(t.leadId),
  })
);
