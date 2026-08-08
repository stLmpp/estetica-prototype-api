CREATE TYPE "security_level_type" AS ENUM('ORG', 'GENERAL');--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "security_level_type" "security_level_type";