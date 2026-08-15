CREATE TYPE "payment_method" AS ENUM('Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix');--> statement-breakpoint
CREATE TYPE "sale_status" AS ENUM('Pendente', 'Pago', 'Cancelado', 'Estornado');--> statement-breakpoint
CREATE TYPE "sale_transaction_type" AS ENUM('Pagamento', 'Estorno');--> statement-breakpoint
CREATE TABLE "sale" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('sale'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"customer_id" varchar(38) NOT NULL,
	"employee_id" varchar(38) NOT NULL,
	"appointment_id" varchar(38),
	"status" "sale_status" NOT NULL,
	"total_amount" numeric(10,2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sale" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sale_item" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('slit'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"sale_id" varchar(38) NOT NULL,
	"catalog_item_id" varchar(38) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_applied" numeric(10,2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sale_item" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sale_transaction" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('sltx'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"sale_id" varchar(38) NOT NULL,
	"type" "sale_transaction_type" NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"amount" numeric(10,2) NOT NULL,
	"installment_number" smallint,
	"installment_count" smallint,
	"due_date" date,
	"received_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "sale_transaction" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "sale_tenant_id_customer_id_index" ON "sale" ("tenant_id","customer_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sale_tenant_id_employee_id_index" ON "sale" ("tenant_id","employee_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sale_tenant_id_appointment_id_index" ON "sale" ("tenant_id","appointment_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sale_tenant_id_status_index" ON "sale" ("tenant_id","status") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sale_item_tenant_id_sale_id_index" ON "sale_item" ("tenant_id","sale_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sale_item_tenant_id_catalog_item_id_index" ON "sale_item" ("tenant_id","catalog_item_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sale_transaction_tenant_id_sale_id_index" ON "sale_transaction" ("tenant_id","sale_id") WHERE "is_deleted" = false;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_employee_id_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id");--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_sale_id_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id");--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_catalog_item_id_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_item"("id");--> statement-breakpoint
ALTER TABLE "sale_transaction" ADD CONSTRAINT "sale_transaction_sale_id_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id");--> statement-breakpoint
CREATE POLICY "tenancy" ON "sale" AS PERMISSIVE FOR ALL TO public USING ("sale"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("sale"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "sale" AS RESTRICTIVE FOR UPDATE TO public USING ("sale"."is_deleted" = false) WITH CHECK ("sale"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "sale" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "sale" AS RESTRICTIVE FOR SELECT TO public USING ("sale"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "tenancy" ON "sale_item" AS PERMISSIVE FOR ALL TO public USING ("sale_item"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("sale_item"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "sale_item" AS RESTRICTIVE FOR UPDATE TO public USING ("sale_item"."is_deleted" = false) WITH CHECK ("sale_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "sale_item" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "sale_item" AS RESTRICTIVE FOR SELECT TO public USING ("sale_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "tenancy" ON "sale_transaction" AS PERMISSIVE FOR ALL TO public USING ("sale_transaction"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("sale_transaction"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "sale_transaction" AS RESTRICTIVE FOR UPDATE TO public USING ("sale_transaction"."is_deleted" = false) WITH CHECK ("sale_transaction"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "sale_transaction" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "sale_transaction" AS RESTRICTIVE FOR SELECT TO public USING ("sale_transaction"."is_deleted" = false);