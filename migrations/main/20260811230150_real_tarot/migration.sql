CREATE TABLE "employee_service" (
	"id" varchar(38) PRIMARY KEY DEFAULT prefixed_uuid('esvc'::text),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_by" varchar(64),
	"last_updated_by" varchar(64),
	"tenant_id" varchar(64) NOT NULL,
	"employee_id" varchar(38) NOT NULL,
	"catalog_item_id" varchar(38) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employee_service" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "employee_service_tenant_id_catalog_item_id_index" ON "employee_service" ("tenant_id","catalog_item_id") WHERE "is_deleted" = false;--> statement-breakpoint
ALTER TABLE "employee_service" ADD CONSTRAINT "employee_service_employee_id_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id");--> statement-breakpoint
ALTER TABLE "employee_service" ADD CONSTRAINT "employee_service_catalog_item_id_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_item"("id");--> statement-breakpoint
CREATE POLICY "tenancy" ON "employee_service" AS PERMISSIVE FOR ALL TO public USING ("employee_service"."tenant_id" = current_setting('tenant.id')) WITH CHECK ("employee_service"."tenant_id" = current_setting('tenant.id'));--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "employee_service" AS RESTRICTIVE FOR UPDATE TO public USING ("employee_service"."is_deleted" = false) WITH CHECK ("employee_service"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "employee_service" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "employee_service" AS RESTRICTIVE FOR SELECT TO public USING ("employee_service"."is_deleted" = false);