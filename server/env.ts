import "dotenv/config";

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // App
  APP_BASE_URL: optional("APP_BASE_URL", "http://localhost:3000"),
  SESSION_SECRET: required("SESSION_SECRET"),
  PORT: parseInt(optional("PORT", "3000"), 10),

  // Database
  DATABASE_URL: required("DATABASE_URL"),

  // GHL
  GHL_PRIVATE_API_KEY: optional("GHL_PRIVATE_API_KEY"), // set in Railway dashboard
  GHL_LOCATION_ID: optional("GHL_LOCATION_ID", "4NIo95IzKUVayysfr0PX"),

  // Scale360 pipelines
  GHL_SCALE360_PIPELINE_ID: optional("GHL_SCALE360_PIPELINE_ID", "mzgOuQhHmkDuixcpiSbj"),
  GHL_SCALE360_ENTERPRISE_PIPELINE_ID: optional("GHL_SCALE360_ENTERPRISE_PIPELINE_ID", "HmZA3KEdITefCLNZwg1H"),
  GHL_SCALE360_INBOUND_WEBHOOK_URL: optional("GHL_SCALE360_INBOUND_WEBHOOK_URL"),

  // GHL agent pipelines
  GHL_AGENT_REGISTRATION_PIPELINE_ID: optional("GHL_AGENT_REGISTRATION_PIPELINE_ID", "vCKGDQraPNtxKrfwFgzo"),
  GHL_CERTIFICATION_PIPELINE_ID: optional("GHL_CERTIFICATION_PIPELINE_ID", "NVuQYzsEUR3LSc7cUvEc"),

  // GHL calendars
  GHL_SCALE360_TRAINING_CALENDAR_ID: optional("GHL_SCALE360_TRAINING_CALENDAR_ID", "BNSDF3gHtSZuzgLMkijr"),

  // Make.com
  MAKE_WEBHOOK_URL: optional("MAKE_WEBHOOK_URL"),

  // Kickstart
  KICKSTART_ENABLED: optional("KICKSTART_ENABLED", "false") === "true",
  KICKSTART_WEBHOOK_URL: optional("KICKSTART_WEBHOOK_URL"),
  KICKSTART_SYNC_SECRET: optional("KICKSTART_SYNC_SECRET"),

  // DocuSeal
  DOCUSEAL_API_KEY: optional("DOCUSEAL_API_KEY"),
  DOCUSEAL_W9_TEMPLATE_ID: optional("DOCUSEAL_W9_TEMPLATE_ID"),

  // S3
  S3_BUCKET: optional("S3_BUCKET"),
  S3_REGION: optional("S3_REGION", "us-east-1"),
  AWS_ACCESS_KEY_ID: optional("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: optional("AWS_SECRET_ACCESS_KEY"),
} as const;
