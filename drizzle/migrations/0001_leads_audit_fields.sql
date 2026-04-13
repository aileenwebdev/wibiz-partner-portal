-- Migration: add audit fields + source_platform to leads table
ALTER TABLE `leads`
  ADD COLUMN `source_platform`       varchar(100)  NULL AFTER `business_name`,
  ADD COLUMN `s360_plan_desc`        text          NULL AFTER `s360_plan_name`,
  ADD COLUMN `s360_plan_price`       varchar(50)   NULL AFTER `s360_plan_desc`,
  ADD COLUMN `s360_industry_insight` text          NULL AFTER `s360_industry`,
  ADD COLUMN `s360_industry_benefits` text         NULL AFTER `s360_industry_insight`,
  ADD COLUMN `s360_loss_yr`          varchar(50)   NULL AFTER `s360_industry_benefits`,
  ADD COLUMN `s360_loss_mo`          varchar(50)   NULL AFTER `s360_loss_yr`,
  ADD COLUMN `s360_saved_hrs`        varchar(50)   NULL AFTER `s360_loss_mo`,
  ADD COLUMN `s360_ghost_yr`         varchar(50)   NULL AFTER `s360_saved_hrs`,
  ADD COLUMN `s360_after_yr`         varchar(50)   NULL AFTER `s360_ghost_yr`,
  ADD COLUMN `s360_time_yr`          varchar(50)   NULL AFTER `s360_after_yr`,
  ADD COLUMN `s360_breakeven`        varchar(50)   NULL AFTER `s360_time_yr`,
  ADD COLUMN `s360_economy_tier`     varchar(100)  NULL AFTER `s360_breakeven`,
  ADD COLUMN `s360_persona_id`       varchar(100)  NULL AFTER `s360_economy_tier`,
  ADD COLUMN `s360_multiplier`       varchar(50)   NULL AFTER `s360_persona_id`;
