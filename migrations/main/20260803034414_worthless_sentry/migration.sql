DROP POLICY "deleted_at" ON "anamnesis_field";--> statement-breakpoint
DROP POLICY "deleted_at" ON "anamnesis_field_validation";--> statement-breakpoint
DROP POLICY "deleted_at" ON "appointment";--> statement-breakpoint
DROP POLICY "deleted_at" ON "appointment_item";--> statement-breakpoint
DROP POLICY "deleted_at" ON "catalog_item";--> statement-breakpoint
DROP POLICY "deleted_at" ON "config";--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer_anamnesis";--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer_anamnesis_field";--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer";--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer_followup";--> statement-breakpoint
DROP POLICY "deleted_at" ON "employee";--> statement-breakpoint
DROP POLICY "deleted_at" ON "followup_item";--> statement-breakpoint
DROP POLICY "deleted_at" ON "person";--> statement-breakpoint
DROP POLICY "deleted_at" ON "person_phone";--> statement-breakpoint
ALTER TABLE "anamnesis_field" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "anamnesis_field_validation" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "appointment_item" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "catalog_item" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customer_anamnesis" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customer_followup" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "followup_item" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "person_phone" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
DROP INDEX "anamnesis_field_validation_tenant_id_anamnesis_field_id_index";--> statement-breakpoint
CREATE INDEX "anamnesis_field_validation_tenant_id_anamnesis_field_id_index" ON "anamnesis_field_validation" ("tenant_id","anamnesis_field_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "appointment_tenant_id_customer_id_index";--> statement-breakpoint
CREATE INDEX "appointment_tenant_id_customer_id_index" ON "appointment" ("tenant_id","customer_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "appointment_tenant_id_employee_id_index";--> statement-breakpoint
CREATE INDEX "appointment_tenant_id_employee_id_index" ON "appointment" ("tenant_id","employee_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "appointment_tenant_id_start_time_index";--> statement-breakpoint
CREATE INDEX "appointment_tenant_id_start_time_index" ON "appointment" ("tenant_id","start_time") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "appointment_item_tenant_id_appointment_id_index";--> statement-breakpoint
CREATE INDEX "appointment_item_tenant_id_appointment_id_index" ON "appointment_item" ("tenant_id","appointment_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "appointment_item_tenant_id_catalog_item_id_index";--> statement-breakpoint
CREATE INDEX "appointment_item_tenant_id_catalog_item_id_index" ON "appointment_item" ("tenant_id","catalog_item_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "catalog_item_tenant_id_item_type_index";--> statement-breakpoint
CREATE INDEX "catalog_item_tenant_id_item_type_index" ON "catalog_item" ("tenant_id","item_type") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "config_group_tenant_id_user_id_name_version_index";--> statement-breakpoint
CREATE UNIQUE INDEX "config_group_tenant_id_user_id_name_version_index" ON "config" ("group","tenant_id","user_id","name","version") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "config_group_tenant_id_user_id_name_index";--> statement-breakpoint
CREATE INDEX "config_group_tenant_id_user_id_name_index" ON "config" ("group","tenant_id","user_id","name") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "config_group_tenant_id_user_id_index";--> statement-breakpoint
CREATE INDEX "config_group_tenant_id_user_id_index" ON "config" ("group","tenant_id","user_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "customer_anamnesis_tenant_id_customer_id_index";--> statement-breakpoint
CREATE INDEX "customer_anamnesis_tenant_id_customer_id_index" ON "customer_anamnesis" ("tenant_id","customer_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "customer_anamnesis_field_tenant_id_customer_anamnesis_id_index";--> statement-breakpoint
CREATE INDEX "customer_anamnesis_field_tenant_id_customer_anamnesis_id_index" ON "customer_anamnesis_field" ("tenant_id","customer_anamnesis_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "customer_anamnesis_field_tenant_id_anamnesis_field_id_index";--> statement-breakpoint
CREATE INDEX "customer_anamnesis_field_tenant_id_anamnesis_field_id_index" ON "customer_anamnesis_field" ("tenant_id","anamnesis_field_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "customer_tenant_id_person_id_index";--> statement-breakpoint
CREATE INDEX "customer_tenant_id_person_id_index" ON "customer" ("tenant_id","person_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "customer_followup_tenant_id_customer_id_index";--> statement-breakpoint
CREATE INDEX "customer_followup_tenant_id_customer_id_index" ON "customer_followup" ("tenant_id","customer_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "employee_tenant_id_person_id_index";--> statement-breakpoint
CREATE INDEX "employee_tenant_id_person_id_index" ON "employee" ("tenant_id","person_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "followup_item_tenant_id_followup_id_index";--> statement-breakpoint
CREATE INDEX "followup_item_tenant_id_followup_id_index" ON "followup_item" ("tenant_id","followup_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "followup_item_tenant_id_catalog_item_id_index";--> statement-breakpoint
CREATE INDEX "followup_item_tenant_id_catalog_item_id_index" ON "followup_item" ("tenant_id","catalog_item_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "person_tenant_id_email_index";--> statement-breakpoint
CREATE INDEX "person_tenant_id_email_index" ON "person" ("tenant_id","email") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "customer_name_trgm_index";--> statement-breakpoint
CREATE INDEX "customer_name_trgm_index" ON "person" USING gin ("name" gin_trgm_ops) WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "person_phone_tenant_id_person_id_index";--> statement-breakpoint
CREATE INDEX "person_phone_tenant_id_person_id_index" ON "person_phone" ("tenant_id","person_id") WHERE "is_deleted" = false;--> statement-breakpoint
DROP INDEX "person_phone_tenant_id_phone_number_index";--> statement-breakpoint
CREATE INDEX "person_phone_tenant_id_phone_number_index" ON "person_phone" ("tenant_id","phone_number") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "anamnesis_field" AS PERMISSIVE FOR UPDATE TO public USING ("anamnesis_field"."is_deleted" = false) WITH CHECK ("anamnesis_field"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "anamnesis_field" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "anamnesis_field" AS PERMISSIVE FOR SELECT TO public USING ("anamnesis_field"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "anamnesis_field_validation" AS PERMISSIVE FOR UPDATE TO public USING ("anamnesis_field_validation"."is_deleted" = false) WITH CHECK ("anamnesis_field_validation"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "anamnesis_field_validation" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "anamnesis_field_validation" AS PERMISSIVE FOR SELECT TO public USING ("anamnesis_field_validation"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "appointment" AS PERMISSIVE FOR UPDATE TO public USING ("appointment"."is_deleted" = false) WITH CHECK ("appointment"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "appointment" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "appointment" AS PERMISSIVE FOR SELECT TO public USING ("appointment"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "appointment_item" AS PERMISSIVE FOR UPDATE TO public USING ("appointment_item"."is_deleted" = false) WITH CHECK ("appointment_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "appointment_item" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "appointment_item" AS PERMISSIVE FOR SELECT TO public USING ("appointment_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "catalog_item" AS PERMISSIVE FOR UPDATE TO public USING ("catalog_item"."is_deleted" = false) WITH CHECK ("catalog_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "catalog_item" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "catalog_item" AS PERMISSIVE FOR SELECT TO public USING ("catalog_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "config" AS PERMISSIVE FOR UPDATE TO public USING ("config"."is_deleted" = false) WITH CHECK ("config"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "config" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "config" AS PERMISSIVE FOR SELECT TO public USING ("config"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer_anamnesis" AS PERMISSIVE FOR UPDATE TO public USING ("customer_anamnesis"."is_deleted" = false) WITH CHECK ("customer_anamnesis"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer_anamnesis" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer_anamnesis" AS PERMISSIVE FOR SELECT TO public USING ("customer_anamnesis"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer_anamnesis_field" AS PERMISSIVE FOR UPDATE TO public USING ("customer_anamnesis_field"."is_deleted" = false) WITH CHECK ("customer_anamnesis_field"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer_anamnesis_field" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer_anamnesis_field" AS PERMISSIVE FOR SELECT TO public USING ("customer_anamnesis_field"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer" AS PERMISSIVE FOR UPDATE TO public USING ("customer"."is_deleted" = false) WITH CHECK ("customer"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer" AS PERMISSIVE FOR SELECT TO public USING ("customer"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer_followup" AS PERMISSIVE FOR UPDATE TO public USING ("customer_followup"."is_deleted" = false) WITH CHECK ("customer_followup"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer_followup" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer_followup" AS PERMISSIVE FOR SELECT TO public USING ("customer_followup"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "employee" AS PERMISSIVE FOR UPDATE TO public USING ("employee"."is_deleted" = false) WITH CHECK ("employee"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "employee" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "employee" AS PERMISSIVE FOR SELECT TO public USING ("employee"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "followup_item" AS PERMISSIVE FOR UPDATE TO public USING ("followup_item"."is_deleted" = false) WITH CHECK ("followup_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "followup_item" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "followup_item" AS PERMISSIVE FOR SELECT TO public USING ("followup_item"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "person" AS PERMISSIVE FOR UPDATE TO public USING ("person"."is_deleted" = false) WITH CHECK ("person"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "person" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "person" AS PERMISSIVE FOR SELECT TO public USING ("person"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "person_phone" AS PERMISSIVE FOR UPDATE TO public USING ("person_phone"."is_deleted" = false) WITH CHECK ("person_phone"."is_deleted" = false);--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "person_phone" AS PERMISSIVE FOR DELETE TO public USING (false);--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "person_phone" AS PERMISSIVE FOR SELECT TO public USING ("person_phone"."is_deleted" = false);