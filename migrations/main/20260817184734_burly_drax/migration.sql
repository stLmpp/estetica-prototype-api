ALTER TABLE "anamnesis_field" ADD COLUMN "previous_version_id" varchar(38);--> statement-breakpoint
ALTER TABLE "anamnesis_section" ADD COLUMN "previous_version_id" varchar(38);--> statement-breakpoint
ALTER TABLE "anamnesis_field" ADD CONSTRAINT "anamnesis_field_previous_version_id_anamnesis_field_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "anamnesis_field"("id");--> statement-breakpoint
ALTER TABLE "anamnesis_section" ADD CONSTRAINT "anamnesis_section_previous_version_id_anamnesis_section_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "anamnesis_section"("id");