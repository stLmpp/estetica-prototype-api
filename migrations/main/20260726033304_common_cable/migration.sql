CREATE TYPE "config_type" AS ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON');--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "value" text NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "type" "config_type" NOT NULL;