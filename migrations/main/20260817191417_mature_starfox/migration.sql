ALTER TABLE "anamnesis_field" DROP CONSTRAINT "anamnesis_field_previous_version_id_anamnesis_field_id_fkey";--> statement-breakpoint
ALTER TABLE "anamnesis_section" DROP CONSTRAINT "anamnesis_section_previous_version_id_anamnesis_section_id_fkey";--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ADD COLUMN "field_label" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ADD COLUMN "field_type" "anamnesis_field_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ADD COLUMN "field_options" jsonb;--> statement-breakpoint
ALTER TABLE "customer_anamnesis_field" ADD COLUMN "section_label" varchar(128);--> statement-breakpoint
ALTER TABLE "anamnesis_field" DROP COLUMN "previous_version_id";--> statement-breakpoint
ALTER TABLE "anamnesis_section" DROP COLUMN "previous_version_id";