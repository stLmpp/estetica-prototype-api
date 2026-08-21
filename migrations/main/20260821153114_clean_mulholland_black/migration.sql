ALTER TABLE "customer_followup" ADD COLUMN "appointment_id" varchar(38);--> statement-breakpoint
ALTER TABLE "customer_followup" ADD COLUMN "sale_id" varchar(38);--> statement-breakpoint
CREATE INDEX "customer_followup_tenant_id_appointment_id_index" ON "customer_followup" ("tenant_id","appointment_id") WHERE "is_deleted" = false;--> statement-breakpoint
CREATE INDEX "customer_followup_tenant_id_sale_id_index" ON "customer_followup" ("tenant_id","sale_id") WHERE "is_deleted" = false;--> statement-breakpoint
ALTER TABLE "customer_followup" ADD CONSTRAINT "customer_followup_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id");--> statement-breakpoint
ALTER TABLE "customer_followup" ADD CONSTRAINT "customer_followup_sale_id_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id");