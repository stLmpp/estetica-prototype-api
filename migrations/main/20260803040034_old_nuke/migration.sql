DROP POLICY "deleted_write_policy" ON "anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "anamnesis_field" AS RESTRICTIVE FOR UPDATE TO public USING ("anamnesis_field"."is_deleted" = false) WITH CHECK ("anamnesis_field"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "anamnesis_field" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "anamnesis_field" AS RESTRICTIVE FOR SELECT TO public USING ("anamnesis_field"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "anamnesis_field_validation";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "anamnesis_field_validation" AS RESTRICTIVE FOR UPDATE TO public USING ("anamnesis_field_validation"."is_deleted" = false) WITH CHECK ("anamnesis_field_validation"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "anamnesis_field_validation";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "anamnesis_field_validation" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "anamnesis_field_validation";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "anamnesis_field_validation" AS RESTRICTIVE FOR SELECT TO public USING ("anamnesis_field_validation"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "appointment";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "appointment" AS RESTRICTIVE FOR UPDATE TO public USING ("appointment"."is_deleted" = false) WITH CHECK ("appointment"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "appointment";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "appointment" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "appointment";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "appointment" AS RESTRICTIVE FOR SELECT TO public USING ("appointment"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "appointment_item";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "appointment_item" AS RESTRICTIVE FOR UPDATE TO public USING ("appointment_item"."is_deleted" = false) WITH CHECK ("appointment_item"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "appointment_item";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "appointment_item" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "appointment_item";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "appointment_item" AS RESTRICTIVE FOR SELECT TO public USING ("appointment_item"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "catalog_item";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "catalog_item" AS RESTRICTIVE FOR UPDATE TO public USING ("catalog_item"."is_deleted" = false) WITH CHECK ("catalog_item"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "catalog_item";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "catalog_item" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "catalog_item";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "catalog_item" AS RESTRICTIVE FOR SELECT TO public USING ("catalog_item"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "config";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "config" AS RESTRICTIVE FOR UPDATE TO public USING ("config"."is_deleted" = false) WITH CHECK ("config"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "config";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "config" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "config";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "config" AS RESTRICTIVE FOR SELECT TO public USING ("config"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "customer_anamnesis";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer_anamnesis" AS RESTRICTIVE FOR UPDATE TO public USING ("customer_anamnesis"."is_deleted" = false) WITH CHECK ("customer_anamnesis"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "customer_anamnesis";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer_anamnesis" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "customer_anamnesis";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer_anamnesis" AS RESTRICTIVE FOR SELECT TO public USING ("customer_anamnesis"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "customer_anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer_anamnesis_field" AS RESTRICTIVE FOR UPDATE TO public USING ("customer_anamnesis_field"."is_deleted" = false) WITH CHECK ("customer_anamnesis_field"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "customer_anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer_anamnesis_field" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "customer_anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer_anamnesis_field" AS RESTRICTIVE FOR SELECT TO public USING ("customer_anamnesis_field"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "customer";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer" AS RESTRICTIVE FOR UPDATE TO public USING ("customer"."is_deleted" = false) WITH CHECK ("customer"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "customer";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "customer";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer" AS RESTRICTIVE FOR SELECT TO public USING ("customer"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "customer_followup";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "customer_followup" AS RESTRICTIVE FOR UPDATE TO public USING ("customer_followup"."is_deleted" = false) WITH CHECK ("customer_followup"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "customer_followup";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "customer_followup" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "customer_followup";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "customer_followup" AS RESTRICTIVE FOR SELECT TO public USING ("customer_followup"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "employee";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "employee" AS RESTRICTIVE FOR UPDATE TO public USING ("employee"."is_deleted" = false) WITH CHECK ("employee"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "employee";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "employee" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "employee";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "employee" AS RESTRICTIVE FOR SELECT TO public USING ("employee"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "followup_item";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "followup_item" AS RESTRICTIVE FOR UPDATE TO public USING ("followup_item"."is_deleted" = false) WITH CHECK ("followup_item"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "followup_item";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "followup_item" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "followup_item";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "followup_item" AS RESTRICTIVE FOR SELECT TO public USING ("followup_item"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "person";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "person" AS RESTRICTIVE FOR UPDATE TO public USING ("person"."is_deleted" = false) WITH CHECK ("person"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "person";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "person" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "person";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "person" AS RESTRICTIVE FOR SELECT TO public USING ("person"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_write_policy" ON "person_phone";--> statement-breakpoint
CREATE POLICY "deleted_write_policy" ON "person_phone" AS RESTRICTIVE FOR UPDATE TO public USING ("person_phone"."is_deleted" = false) WITH CHECK ("person_phone"."is_deleted" = false);--> statement-breakpoint
DROP POLICY "deleted_delete_policy" ON "person_phone";--> statement-breakpoint
CREATE POLICY "deleted_delete_policy" ON "person_phone" AS RESTRICTIVE FOR DELETE TO public USING (false);--> statement-breakpoint
DROP POLICY "deleted_read_policy" ON "person_phone";--> statement-breakpoint
CREATE POLICY "deleted_read_policy" ON "person_phone" AS RESTRICTIVE FOR SELECT TO public USING ("person_phone"."is_deleted" = false);