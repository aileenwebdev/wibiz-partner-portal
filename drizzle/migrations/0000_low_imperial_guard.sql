CREATE TABLE `agent_registration_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referred_by_rep_code` varchar(20),
	`requested_level` enum('Super Agency','Super Team','Agency','Senior Associate','Associate') NOT NULL DEFAULT 'Associate',
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(30),
	`business_name` varchar(255),
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`assigned_rep_code` varchar(20),
	`verify_link` varchar(500),
	`w9_signed` boolean DEFAULT false,
	`agreement_accepted` boolean DEFAULT false,
	`admin_notes` text,
	`reviewed_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_registration_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_verification_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_id` int NOT NULL,
	`rep_code` varchar(20) NOT NULL,
	`token` varchar(100) NOT NULL,
	`status` enum('pending','submitted','reviewed') DEFAULT 'pending',
	`document_url` text,
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_verification_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_verification_sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `agreement_acceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_id` int,
	`email` varchar(255),
	`version` varchar(20) NOT NULL DEFAULT '1.0',
	`ip_address` varchar(45),
	`accepted_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `agreement_acceptances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attribution_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int,
	`ghl_contact_id` varchar(100),
	`attempted_rep_code` varchar(20),
	`resolved_rep_id` int,
	`status` enum('resolved','unresolved','no_rep_code') NOT NULL,
	`triggered_by` varchar(100),
	`raw_field` varchar(100),
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `attribution_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_id` int NOT NULL,
	`rep_code` varchar(20) NOT NULL,
	`vertical` varchar(50) NOT NULL DEFAULT 'Scale360',
	`score` int NOT NULL,
	`total_questions` int NOT NULL,
	`passed` boolean NOT NULL DEFAULT false,
	`passed_at` timestamp,
	`ghl_cert_pipeline_stage_id` varchar(100),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_id` int NOT NULL,
	`rep_code` varchar(20) NOT NULL,
	`lead_id` int NOT NULL,
	`type` enum('setup','monthly','bonus') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`rate` decimal(5,4) NOT NULL,
	`base_fee` decimal(10,2),
	`status` enum('pending','approved','paid','rejected') DEFAULT 'pending',
	`notes` text,
	`paid_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`from_stage` varchar(100),
	`to_stage` varchar(100),
	`performed_by` varchar(100),
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `lead_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_code` varchar(20),
	`rep_id` int,
	`ghl_contact_id` varchar(100),
	`ghl_opportunity_id` varchar(100),
	`first_name` varchar(100),
	`last_name` varchar(100),
	`email` varchar(255),
	`phone` varchar(30),
	`business_name` varchar(255),
	`current_stage` varchar(100),
	`pipeline_id` varchar(100),
	`referrer_agent_name` varchar(255),
	`referrer_agent_email` varchar(255),
	`referrer_agent_phone` varchar(30),
	`referrer_agent_contact_id` varchar(100),
	`attribution_status` enum('resolved','unresolved','no_rep_code') DEFAULT 'unresolved',
	`s360_audit_score` varchar(50),
	`s360_audit_status` varchar(100),
	`s360_plan_name` varchar(255),
	`s360_pdf_link` text,
	`s360_roi` varchar(50),
	`s360_employee_count` varchar(50),
	`s360_industry` varchar(100),
	`s360_audit_received_at` timestamp,
	`payment_amount` decimal(10,2),
	`payment_confirmed_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_ghl_contact_id_unique` UNIQUE(`ghl_contact_id`)
);
--> statement-breakpoint
CREATE TABLE `rep_level_upgrade_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_code` varchar(20) NOT NULL,
	`current_level` enum('Super Agency','Super Team','Agency','Senior Associate','Associate') NOT NULL,
	`requested_level` enum('Super Agency','Super Team','Agency','Senior Associate','Associate') NOT NULL,
	`original_upline_rep_code` varchar(20),
	`nominated_by_rep_code` varchar(20),
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`admin_notes` text,
	`reviewed_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `rep_level_upgrade_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_code` varchar(20) NOT NULL,
	`agent_level` enum('Super Agency','Super Team','Agency','Senior Associate','Associate') NOT NULL DEFAULT 'Associate',
	`upline_rep_code` varchar(20),
	`mga_rep_code` varchar(20),
	`legal_full_name` varchar(255),
	`email` varchar(255) NOT NULL,
	`phone` varchar(30),
	`business_name` varchar(255),
	`username` varchar(100),
	`password_hash` varchar(255),
	`temp_password_plain` varchar(100),
	`ghl_contact_id` varchar(100),
	`referral_link` varchar(500),
	`identity_verification_status` enum('pending','submitted','approved','rejected') DEFAULT 'pending',
	`identity_verification_notes` text,
	`kickstart_username` varchar(100),
	`kickstart_temp_password` varchar(100),
	`kickstart_provisioned_at` timestamp,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reps_id` PRIMARY KEY(`id`),
	CONSTRAINT `reps_rep_code_unique` UNIQUE(`rep_code`),
	CONSTRAINT `reps_email_unique` UNIQUE(`email`),
	CONSTRAINT `reps_username_unique` UNIQUE(`username`),
	CONSTRAINT `reps_ghl_contact_id_unique` UNIQUE(`ghl_contact_id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `training_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rep_id` int NOT NULL,
	`rep_code` varchar(20) NOT NULL,
	`calendar_id` varchar(100),
	`ghl_appointment_id` varchar(100),
	`scheduled_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `training_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`endpoint` varchar(200) NOT NULL,
	`rep_code_extracted` varchar(20),
	`matched_field` varchar(100),
	`attribution_status` enum('resolved','unresolved','no_rep_code'),
	`ghl_contact_id` varchar(100),
	`payload` json,
	`error` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_reg_requests_referrer` ON `agent_registration_requests` (`referred_by_rep_code`);--> statement-breakpoint
CREATE INDEX `idx_reg_requests_email` ON `agent_registration_requests` (`email`);--> statement-breakpoint
CREATE INDEX `idx_reg_requests_status` ON `agent_registration_requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_verify_sessions_token` ON `agent_verification_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `idx_verify_sessions_rep` ON `agent_verification_sessions` (`rep_id`);--> statement-breakpoint
CREATE INDEX `idx_agreements_rep` ON `agreement_acceptances` (`rep_id`);--> statement-breakpoint
CREATE INDEX `idx_attribution_lead` ON `attribution_log` (`lead_id`);--> statement-breakpoint
CREATE INDEX `idx_attribution_ghl` ON `attribution_log` (`ghl_contact_id`);--> statement-breakpoint
CREATE INDEX `idx_attribution_rep_code` ON `attribution_log` (`attempted_rep_code`);--> statement-breakpoint
CREATE INDEX `idx_certs_rep` ON `certifications` (`rep_id`);--> statement-breakpoint
CREATE INDEX `idx_certs_passed` ON `certifications` (`passed`);--> statement-breakpoint
CREATE INDEX `idx_commissions_rep` ON `commissions` (`rep_code`);--> statement-breakpoint
CREATE INDEX `idx_commissions_lead` ON `commissions` (`lead_id`);--> statement-breakpoint
CREATE INDEX `idx_commissions_status` ON `commissions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_activity_lead` ON `lead_activity` (`lead_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_rep_code` ON `leads` (`rep_code`);--> statement-breakpoint
CREATE INDEX `idx_leads_rep_id` ON `leads` (`rep_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_ghl_contact` ON `leads` (`ghl_contact_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_stage` ON `leads` (`current_stage`);--> statement-breakpoint
CREATE INDEX `idx_upgrade_rep_code` ON `rep_level_upgrade_requests` (`rep_code`);--> statement-breakpoint
CREATE INDEX `idx_upgrade_status` ON `rep_level_upgrade_requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_reps_upline` ON `reps` (`upline_rep_code`);--> statement-breakpoint
CREATE INDEX `idx_reps_mga` ON `reps` (`mga_rep_code`);--> statement-breakpoint
CREATE INDEX `idx_reps_email` ON `reps` (`email`);--> statement-breakpoint
CREATE INDEX `idx_reps_ghl` ON `reps` (`ghl_contact_id`);--> statement-breakpoint
CREATE INDEX `idx_bookings_rep` ON `training_bookings` (`rep_id`);--> statement-breakpoint
CREATE INDEX `idx_webhook_logs_endpoint` ON `webhook_logs` (`endpoint`);--> statement-breakpoint
CREATE INDEX `idx_webhook_logs_ghl` ON `webhook_logs` (`ghl_contact_id`);