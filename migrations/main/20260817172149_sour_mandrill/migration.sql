CREATE TYPE "customer_anamnesis_status" AS ENUM('Rascunho', 'Finalizado');--> statement-breakpoint
ALTER TYPE "anamnesis_field_type" ADD VALUE 'BOOLEAN' BEFORE 'CHECKBOX';--> statement-breakpoint
CREATE TABLE "anamnesis_form" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('anfo'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(2048),
	"active" boolean NOT NULL,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anamnesis_form" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "anamnesis_section" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('ansc'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"anamnesis_form_id" varchar(38) NOT NULL,
	"label" varchar(128) NOT NULL,
	"display_order" integer NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anamnesis_section" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "anamnesis_field" ADD COLUMN "anamnesis_form_id" varchar(38) NOT NULL;--> statement-breakpoint
ALTER TABLE "anamnesis_field" ADD COLUMN "anamnesis_section_id" varchar(38);--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD COLUMN "anamnesis_form_id" varchar(38) NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD COLUMN "appointment_id" varchar(38);--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD COLUMN "status" "customer_anamnesis_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD COLUMN "signed_by_name" varchar(256);--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD COLUMN "signed_at" timestamp;--> statement-breakpoint
CREATE INDEX "anamnesis_field_tenant_id_anamnesis_form_id_index" ON "anamnesis_field" ("tenant_id","anamnesis_form_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "anamnesis_field_tenant_id_anamnesis_section_id_index" ON "anamnesis_field" ("tenant_id","anamnesis_section_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "anamnesis_section_tenant_id_anamnesis_form_id_index" ON "anamnesis_section" ("tenant_id","anamnesis_form_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "customer_anamnesis_tenant_id_anamnesis_form_id_index" ON "customer_anamnesis" ("tenant_id","anamnesis_form_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "customer_anamnesis_tenant_id_appointment_id_index" ON "customer_anamnesis" ("tenant_id","appointment_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_anamnesis_field_tenant_id_customer_anamnesis_id_anamnesis_field_id_index" ON "customer_anamnesis_field" ("tenant_id","customer_anamnesis_id","anamnesis_field_id") WHERE "is_deleted" = false;--> statement-breakpoint
ALTER TABLE "anamnesis_field" ADD CONSTRAINT "anamnesis_field_anamnesis_form_id_anamnesis_form_id_fkey" FOREIGN KEY ("anamnesis_form_id") REFERENCES "anamnesis_form"("id");--> statement-breakpoint
ALTER TABLE "anamnesis_field" ADD CONSTRAINT "anamnesis_field_anamnesis_section_id_anamnesis_section_id_fkey" FOREIGN KEY ("anamnesis_section_id") REFERENCES "anamnesis_section"("id");--> statement-breakpoint
ALTER TABLE "anamnesis_section" ADD CONSTRAINT "anamnesis_section_anamnesis_form_id_anamnesis_form_id_fkey" FOREIGN KEY ("anamnesis_form_id") REFERENCES "anamnesis_form"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD CONSTRAINT "customer_anamnesis_anamnesis_form_id_anamnesis_form_id_fkey" FOREIGN KEY ("anamnesis_form_id") REFERENCES "anamnesis_form"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD CONSTRAINT "customer_anamnesis_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id");--> statement-breakpoint
CREATE POLICY "tenancy" ON "anamnesis_form" AS PERMISSIVE FOR ALL TO public USING ("anamnesis_form"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("anamnesis_form"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "anamnesis_form" AS RESTRICTIVE FOR UPDATE TO public USING ("anamnesis_form"."is_deleted" = false) WITH CHECK ("anamnesis_form"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "anamnesis_form" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "anamnesis_form" AS RESTRICTIVE FOR SELECT TO public USING ("anamnesis_form"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "tenancy" ON "anamnesis_section" AS PERMISSIVE FOR ALL TO public USING ("anamnesis_section"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("anamnesis_section"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "anamnesis_section" AS RESTRICTIVE FOR UPDATE TO public USING ("anamnesis_section"."is_deleted" = false) WITH CHECK ("anamnesis_section"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "anamnesis_section" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "anamnesis_section" AS RESTRICTIVE FOR SELECT TO public USING ("anamnesis_section"."is_deleted" = false);