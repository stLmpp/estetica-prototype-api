CREATE TYPE "appointment_status" AS ENUM('Agendado', 'Concluído', 'Cancelado', 'Não compareceu');--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "appointment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" integer,
	"last_updated_by" integer,
	"customer_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" "appointment_status" NOT NULL,
	"notes" varchar(2048)
);
--> statement-breakpoint
CREATE TABLE "appointment_item" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "appointment_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" integer,
	"last_updated_by" integer,
	"appointment_id" integer NOT NULL,
	"catalog_item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_applied" numeric(10,2)
);
--> statement-breakpoint
CREATE INDEX "appointment_customer_id_index" ON "appointment" ("customer_id");--> statement-breakpoint
CREATE INDEX "appointment_employee_id_index" ON "appointment" ("employee_id");--> statement-breakpoint
CREATE INDEX "appointment_start_time_index" ON "appointment" ("start_time");--> statement-breakpoint
CREATE INDEX "appointment_item_appointment_id_index" ON "appointment_item" ("appointment_id");--> statement-breakpoint
CREATE INDEX "appointment_item_catalog_item_id_index" ON "appointment_item" ("catalog_item_id");--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_employee_id_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id");--> statement-breakpoint
ALTER TABLE "appointment_item" ADD CONSTRAINT "appointment_item_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id");--> statement-breakpoint
ALTER TABLE "appointment_item" ADD CONSTRAINT "appointment_item_catalog_item_id_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_item"("id");