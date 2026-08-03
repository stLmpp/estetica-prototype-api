DROP POLICY "deleted_at" ON "anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "anamnesis_field" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("anamnesis_field"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "anamnesis_field_validation";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "anamnesis_field_validation" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("anamnesis_field_validation"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "appointment";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "appointment" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("appointment"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "appointment_item";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "appointment_item" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("appointment_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "catalog_item";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "catalog_item" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("catalog_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "config";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "config" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("config"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer_anamnesis";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer_anamnesis" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("customer_anamnesis"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer_anamnesis_field";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer_anamnesis_field" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("customer_anamnesis_field"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("customer"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "customer_followup";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "customer_followup" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("customer_followup"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "employee";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "employee" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("employee"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "followup_item";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "followup_item" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("followup_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "person";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "person" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("person"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
DROP POLICY "deleted_at" ON "person_phone";--> statement-breakpoint
CREATE POLICY "deleted_at" ON "person_phone" AS RESTRICTIVE FOR ALL TO "authenticated" USING ("person_phone"."deleted_at" IS NULL) WITH CHECK (true);