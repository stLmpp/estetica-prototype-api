ALTER TABLE "anamnese_field" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "anamnese_field" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "anamnese_field" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "anamnese_field" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "anamnese_field_validation" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "anamnese_field_validation" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "anamnese_field_validation" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "anamnese_field_validation" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "anamnese_field_validation" ALTER COLUMN "anamnese_field_id" SET DATA TYPE bigint USING "anamnese_field_id"::bigint;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "customer_id" SET DATA TYPE bigint USING "customer_id"::bigint;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "employee_id" SET DATA TYPE bigint USING "employee_id"::bigint;--> statement-breakpoint
ALTER TABLE "appointment_item" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "appointment_item" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "appointment_item" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "appointment_item" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "appointment_item" ALTER COLUMN "appointment_id" SET DATA TYPE bigint USING "appointment_id"::bigint;--> statement-breakpoint
ALTER TABLE "appointment_item" ALTER COLUMN "catalog_item_id" SET DATA TYPE bigint USING "catalog_item_id"::bigint;--> statement-breakpoint
ALTER TABLE "catalog_item" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "catalog_item" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "catalog_item" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "catalog_item" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "customer_anamnese" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese" ALTER COLUMN "customer_id" SET DATA TYPE bigint USING "customer_id"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ALTER COLUMN "customer_anamnese_id" SET DATA TYPE bigint USING "customer_anamnese_id"::bigint;--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ALTER COLUMN "anamnese_field_id" SET DATA TYPE bigint USING "anamnese_field_id"::bigint;--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "person_id" SET DATA TYPE bigint USING "person_id"::bigint;--> statement-breakpoint
ALTER TABLE "customer_followup" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "customer_followup" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "customer_followup" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer_followup" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "customer_followup" ALTER COLUMN "customer_id" SET DATA TYPE bigint USING "customer_id"::bigint;--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "person_id" SET DATA TYPE bigint USING "person_id"::bigint;--> statement-breakpoint
ALTER TABLE "followup_item" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "followup_item" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "followup_item" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "followup_item" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "followup_item" ALTER COLUMN "followup_id" SET DATA TYPE bigint USING "followup_id"::bigint;--> statement-breakpoint
ALTER TABLE "followup_item" ALTER COLUMN "catalog_item_id" SET DATA TYPE bigint USING "catalog_item_id"::bigint;--> statement-breakpoint
ALTER TABLE "person" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "person" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "person" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "person" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "person_phone" ALTER COLUMN "id" SET DATA TYPE bigint USING "id"::bigint;--> statement-breakpoint
ALTER TABLE "person_phone" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
ALTER TABLE "person_phone" ALTER COLUMN "created_by" SET DATA TYPE bigint USING "created_by"::bigint;--> statement-breakpoint
ALTER TABLE "person_phone" ALTER COLUMN "last_updated_by" SET DATA TYPE bigint USING "last_updated_by"::bigint;--> statement-breakpoint
ALTER TABLE "person_phone" ALTER COLUMN "person_id" SET DATA TYPE bigint USING "person_id"::bigint;