ALTER POLICY "deleted_at" ON "anamnesis_field" TO public USING ("anamnesis_field"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "anamnesis_field_validation" TO public USING ("anamnesis_field_validation"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "appointment" TO public USING ("appointment"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "appointment_item" TO public USING ("appointment_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "catalog_item" TO public USING ("catalog_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "config" TO public USING ("config"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "customer_anamnesis" TO public USING ("customer_anamnesis"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "customer_anamnesis_field" TO public USING ("customer_anamnesis_field"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "customer" TO public USING ("customer"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "customer_followup" TO public USING ("customer_followup"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "employee" TO public USING ("employee"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "followup_item" TO public USING ("followup_item"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "person" TO public USING ("person"."deleted_at" IS NULL) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "deleted_at" ON "person_phone" TO public USING ("person_phone"."deleted_at" IS NULL) WITH CHECK (true);