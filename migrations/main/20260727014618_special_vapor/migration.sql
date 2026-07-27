CREATE TYPE "anamnesis_field_type" AS ENUM('TEXT', 'NUMBER', 'DATE', 'CHECKBOX', 'RADIO', 'SELECT');--> statement-breakpoint
CREATE TYPE "anamnesis_field_validation_type" AS ENUM('required', 'minLength', 'maxLength', 'minValue', 'maxValue', 'pattern');--> statement-breakpoint
CREATE TYPE "appointment_status" AS ENUM('Agendado', 'Concluído', 'Cancelado', 'Não compareceu');--> statement-breakpoint
CREATE TYPE "catalog_item_type" AS ENUM('Produto', 'Serviço');--> statement-breakpoint
CREATE TYPE "config_type" AS ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON');--> statement-breakpoint
CREATE TYPE "marital_status" AS ENUM('Casado(a)', 'Solteiro(a)', 'Divorciado(a)', 'Viúvo(a)');--> statement-breakpoint
CREATE TYPE "phone_type" AS ENUM('Celular', 'Residencial', 'Trabalho');--> statement-breakpoint
CREATE TABLE "anamnesis_field" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('anf'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"field_type" "anamnesis_field_type" NOT NULL,
	"field_args" jsonb,
	"label" varchar(128) NOT NULL,
	"extra_labels" jsonb,
	"active" boolean NOT NULL,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anamnesis_field" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "anamnesis_field_validation" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('anfv'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"validation_type" "anamnesis_field_validation_type" NOT NULL,
	"validation_args" jsonb,
	"anamnesis_field_id" varchar(38) NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anamnesis_field_validation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('apt'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"customer_id" varchar(38) NOT NULL,
	"employee_id" varchar(38) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" "appointment_status" NOT NULL,
	"notes" varchar(2048)
);
--> statement-breakpoint
ALTER TABLE "appointment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "appointment_item" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('apti'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"appointment_id" varchar(38) NOT NULL,
	"catalog_item_id" varchar(38) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_applied" numeric(10,2)
);
--> statement-breakpoint
ALTER TABLE "appointment_item" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog_item" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('citm'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"item_type" "catalog_item_type" NOT NULL,
	"name" varchar(256) NOT NULL,
	"default_price" numeric(10,2),
	"active" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog_item" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "config" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('cfg'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"organization_id" varchar(64) NOT NULL,
	"name" varchar(256) NOT NULL,
	"display_name" varchar(256) NOT NULL,
	"description" varchar(2048),
	"version" integer NOT NULL,
	"inactivated_at" timestamp,
	"user_id" varchar(64) NOT NULL,
	"value" text NOT NULL,
	"type" "config_type" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer_anamnesis" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('canm'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"customer_id" varchar(38) NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer_anamnesis_field" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('canmf'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"customer_anamnesis_id" varchar(38) NOT NULL,
	"anamnesis_field_id" varchar(38) NOT NULL,
	"value" varchar(2048) NOT NULL,
	"extra_values" jsonb
);
--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('cus'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"person_id" varchar(38) NOT NULL,
	"job_name" varchar(256)
);
--> statement-breakpoint
ALTER TABLE "customer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer_followup" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('cfup'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"text" text NOT NULL,
	"customer_id" varchar(38) NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_followup" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "employee" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('emp'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"person_id" varchar(38) NOT NULL,
	"role" varchar(256) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employee" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "followup_item" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('cfupi'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"followup_id" varchar(38) NOT NULL,
	"catalog_item_id" varchar(38),
	"description" varchar(2048) NOT NULL,
	"price_applied" numeric(10,2) NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "followup_item" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "person" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('per'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"name" varchar(1024) NOT NULL,
	"birth_date" date,
	"address" varchar(1024),
	"zip_code" varchar(10),
	"neighborhood" varchar(256),
	"city" varchar(256),
	"state" varchar(256),
	"marital_status" "marital_status",
	"email" varchar(1024),
	"user_id" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "person" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "person_phone" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('phon'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"type" "phone_type" NOT NULL,
	"phone_number" varchar(12) NOT NULL,
	"person_id" varchar(38) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "person_phone" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "anamnesis_field_validation_tenant_id_anamnesis_field_id_index" ON "anamnesis_field_validation" ("tenant_id","anamnesis_field_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "appointment_tenant_id_customer_id_index" ON "appointment" ("tenant_id","customer_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "appointment_tenant_id_employee_id_index" ON "appointment" ("tenant_id","employee_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "appointment_tenant_id_start_time_index" ON "appointment" ("tenant_id","start_time") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "appointment_item_tenant_id_appointment_id_index" ON "appointment_item" ("tenant_id","appointment_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "appointment_item_tenant_id_catalog_item_id_index" ON "appointment_item" ("tenant_id","catalog_item_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "catalog_item_tenant_id_item_type_index" ON "catalog_item" ("tenant_id","item_type") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "config_organization_id_user_id_name_version_index" ON "config" ("organization_id","user_id","name","version") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "config_organization_id_user_id_name_index" ON "config" ("organization_id","user_id","name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "customer_anamnesis_tenant_id_customer_id_index" ON "customer_anamnesis" ("tenant_id","customer_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "customer_anamnesis_field_tenant_id_customer_anamnesis_id_index" ON "customer_anamnesis_field" ("tenant_id","customer_anamnesis_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "customer_anamnesis_field_tenant_id_anamnesis_field_id_index" ON "customer_anamnesis_field" ("tenant_id","anamnesis_field_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "customer_tenant_id_person_id_index" ON "customer" ("tenant_id","person_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "customer_followup_tenant_id_customer_id_index" ON "customer_followup" ("tenant_id","customer_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "employee_tenant_id_person_id_index" ON "employee" ("tenant_id","person_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "followup_item_tenant_id_followup_id_index" ON "followup_item" ("tenant_id","followup_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "followup_item_tenant_id_catalog_item_id_index" ON "followup_item" ("tenant_id","catalog_item_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "person_tenant_id_email_index" ON "person" ("tenant_id","email") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "customer_name_trgm_index" ON "person" USING gin ("name" gin_trgm_ops) WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "person_phone_tenant_id_person_id_index" ON "person_phone" ("tenant_id","person_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "person_phone_tenant_id_phone_number_index" ON "person_phone" ("tenant_id","phone_number") WHERE "deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE "anamnesis_field_validation" ADD CONSTRAINT "anamnesis_field_validation_VdOkey2pE74M_fkey" FOREIGN KEY ("anamnesis_field_id") REFERENCES "anamnesis_field"("id");--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_employee_id_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id");--> statement-breakpoint
ALTER TABLE "appointment_item" ADD CONSTRAINT "appointment_item_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id");--> statement-breakpoint
ALTER TABLE "appointment_item" ADD CONSTRAINT "appointment_item_catalog_item_id_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_item"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD CONSTRAINT "customer_anamnesis_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ADD CONSTRAINT "customer_anamnesis_field_qokqThvHK7Vd_fkey" FOREIGN KEY ("customer_anamnesis_id") REFERENCES "customer_anamnesis"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ADD CONSTRAINT "customer_anamnesis_field_vVaIqSZtnPQX_fkey" FOREIGN KEY ("anamnesis_field_id") REFERENCES "anamnesis_field"("id");--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_person_id_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id");--> statement-breakpoint
ALTER TABLE "customer_followup" ADD CONSTRAINT "customer_followup_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_person_id_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id");--> statement-breakpoint
ALTER TABLE "followup_item" ADD CONSTRAINT "followup_item_followup_id_customer_followup_id_fkey" FOREIGN KEY ("followup_id") REFERENCES "customer_followup"("id");--> statement-breakpoint
ALTER TABLE "followup_item" ADD CONSTRAINT "followup_item_catalog_item_id_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_item"("id");--> statement-breakpoint
ALTER TABLE "person_phone" ADD CONSTRAINT "person_phone_person_id_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id");--> statement-breakpoint
CREATE POLICY "tenancy" ON "anamnesis_field" AS PERMISSIVE FOR ALL TO public USING ("anamnesis_field"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("anamnesis_field"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "anamnesis_field" AS PERMISSIVE FOR ALL TO "authenticated" USING ("anamnesis_field"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "anamnesis_field_validation" AS PERMISSIVE FOR ALL TO public USING ("anamnesis_field_validation"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("anamnesis_field_validation"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "anamnesis_field_validation" AS PERMISSIVE FOR ALL TO "authenticated" USING ("anamnesis_field_validation"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "appointment" AS PERMISSIVE FOR ALL TO public USING ("appointment"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("appointment"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "appointment" AS PERMISSIVE FOR ALL TO "authenticated" USING ("appointment"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "appointment_item" AS PERMISSIVE FOR ALL TO public USING ("appointment_item"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("appointment_item"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "appointment_item" AS PERMISSIVE FOR ALL TO "authenticated" USING ("appointment_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "catalog_item" AS PERMISSIVE FOR ALL TO public USING ("catalog_item"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("catalog_item"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "catalog_item" AS PERMISSIVE FOR ALL TO "authenticated" USING ("catalog_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "deleted_at" ON "config" AS PERMISSIVE FOR ALL TO "authenticated" USING ("config"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "customer_anamnesis" AS PERMISSIVE FOR ALL TO public USING ("customer_anamnesis"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("customer_anamnesis"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer_anamnesis" AS PERMISSIVE FOR ALL TO "authenticated" USING ("customer_anamnesis"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "customer_anamnesis_field" AS PERMISSIVE FOR ALL TO public USING ("customer_anamnesis_field"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("customer_anamnesis_field"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer_anamnesis_field" AS PERMISSIVE FOR ALL TO "authenticated" USING ("customer_anamnesis_field"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "customer" AS PERMISSIVE FOR ALL TO public USING ("customer"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("customer"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer" AS PERMISSIVE FOR ALL TO "authenticated" USING ("customer"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "customer_followup" AS PERMISSIVE FOR ALL TO public USING ("customer_followup"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("customer_followup"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer_followup" AS PERMISSIVE FOR ALL TO "authenticated" USING ("customer_followup"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "employee" AS PERMISSIVE FOR ALL TO public USING ("employee"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("employee"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "employee" AS PERMISSIVE FOR ALL TO "authenticated" USING ("employee"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "followup_item" AS PERMISSIVE FOR ALL TO public USING ("followup_item"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("followup_item"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "followup_item" AS PERMISSIVE FOR ALL TO "authenticated" USING ("followup_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "person" AS PERMISSIVE FOR ALL TO public USING ("person"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("person"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "person" AS PERMISSIVE FOR ALL TO "authenticated" USING ("person"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenancy" ON "person_phone" AS PERMISSIVE FOR ALL TO public USING ("person_phone"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("person_phone"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_at" ON "person_phone" AS PERMISSIVE FOR ALL TO "authenticated" USING ("person_phone"."deleted_at" IS NULL) WITH CHECK (true);