# GHL Custom Field Map — Wibiz Partner Portal

Required fields in GHL location `4NIo95IzKUVayysfr0PX`.
Register these via `scripts/register-ghl-fields.ts` or manually in GHL.

## Agent Fields (written to GHL contact on rep.created)

| Field Key               | Type   | Purpose |
|------------------------|--------|---------|
| `rep_code`              | Text   | Agent rep code (BC-XXX) — primary attribution key |
| `bc360_agent_id`        | Text   | Alias for rep_code — kept for BC360 webhook compatibility |
| `agent_level`           | Text   | Associate / Senior Associate / Agency / Super Team / Super Agency |
| `upline_rep_code`       | Text   | Direct upline's rep code |
| `mga_rep_code`          | Text   | Nearest Agency-or-above ancestor (commission cascade key) |
| `dashboard_url`         | Text   | Agent's portal URL |
| `verify_link`           | Text   | One-time ID verification URL |
| `upline_name`           | Text   | Upline agent's full name |
| `upline_email`          | Text   | Upline agent's email |
| `upline_phone`          | Text   | Upline agent's phone |
| `kickstart_username`    | Text   | Kickstart platform username (set after provisioning) |
| `kickstart_temp_password` | Text | Kickstart temp password (shown once) |

## Attribution Fields (written to GHL contact on lead attribution)

| Field Key                | Type   | Purpose |
|--------------------------|--------|---------|
| `referrer_agent_email`   | Text   | Attributed agent's email |
| `referrer_agent_name`    | Text   | Attributed agent's name |
| `attribution_status`     | Text   | resolved / unresolved / no_rep_code |

## Scale360 Audit Fields (written from /api/scale360/webhook payload)

| Field Key          | GHL Source Field | Purpose |
|--------------------|-----------------|---------|
| `s360_audit_score` | `AUDIT_SCORE`   | Audit score |
| `s360_audit_status`| `AUDIT_STATUS`  | Audit pass/fail status |
| `s360_plan_name`   | `PLAN_NAME`     | Recommended plan |
| `s360_pdf_link`    | `PDF_LINK`      | Audit report PDF URL |
| `s360_roi`         | `ROI`           | Projected ROI |

## Attribution Extraction Order

The `extractRepCode()` function checks these aliases in order:

1. `rep_code`
2. `bc360_agent_id`
3. `agent_id`
4. `referrer_agent_id`
5. `ref_id`
6. `affiliate_ref_id`
7. `affiliate_red_id` (typo variant — keep for compatibility)
8. `repcode`
9. `rep_id`
10. Tag with prefix `rep:BC-XXX`
11. `url_params.ref`

## Pipelines

| Name | GHL Pipeline ID |
|------|----------------|
| Scale360 Partner Funnel | `mzgOuQhHmkDuixcpiSbj` |
| Scale360 Enterprise     | `HmZA3KEdITefCLNZwg1H` |
| Agent Registration      | `vCKGDQraPNtxKrfwFgzo` |
| Certification           | `NVuQYzsEUR3LSc7cUvEc` |

## Webhook Endpoints (register in GHL workflows)

| Event | Endpoint |
|-------|----------|
| ContactCreate / ContactUpdate | `POST /api/ghl/webhook` |
| Scale360 Audit Complete       | `POST /api/scale360/webhook` |
| Scale360 Payment Confirmed    | `POST /api/scale360/payment-webhook` |
