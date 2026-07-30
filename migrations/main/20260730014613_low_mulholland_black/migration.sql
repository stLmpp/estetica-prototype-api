ALTER TABLE "config" RENAME COLUMN "organization_id" TO "tenant_id";--> statement-breakpoint
DROP INDEX "config_organization_id_user_id_name_version_index";--> statement-breakpoint
DROP INDEX "config_organization_id_user_id_name_index";--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "group" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ALTER COLUMN "name" SET DATA TYPE varchar(64) USING "name"::varchar(64);--> statement-breakpoint
ALTER TABLE "config" ALTER COLUMN "display_name" SET DATA TYPE varchar(128) USING "display_name"::varchar(128);--> statement-breakpoint
CREATE UNIQUE INDEX "config_group_tenant_id_user_id_name_version_index" ON "config" ("group","tenant_id","user_id","name","version") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "config_group_tenant_id_user_id_name_index" ON "config" ("group","tenant_id","user_id","name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "config_group_tenant_id_user_id_index" ON "config" ("group","tenant_id","user_id") WHERE "deleted_at" IS NULL;