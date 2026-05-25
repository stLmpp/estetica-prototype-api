CREATE TABLE "employee" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"person_id" integer NOT NULL,
	"role" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "person_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(1024) NOT NULL,
	"birth_date" date,
	"address" varchar(1024),
	"zip_code" varchar(10),
	"neighborhood" varchar(256),
	"city" varchar(256),
	"state" varchar(256),
	"marital_status" "marital_status",
	"email" varchar(1024)
);
--> statement-breakpoint
ALTER TABLE "customer_phone" RENAME TO "person_phone";--> statement-breakpoint
ALTER TABLE "person_phone" RENAME COLUMN "customer_id" TO "person_id";--> statement-breakpoint
DROP INDEX "customer_email_index";--> statement-breakpoint
DROP INDEX "customer_name_trgm_index";--> statement-breakpoint
ALTER TABLE "person_phone" RENAME CONSTRAINT "customer_phone_customer_id_customer_id_fkey" TO "person_phone_person_id_person_id_fkey";--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "person_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "birth_date";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "zip_code";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "neighborhood";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "marital_status";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "email";--> statement-breakpoint
CREATE INDEX "customer_person_id_index" ON "customer" ("person_id");--> statement-breakpoint
CREATE INDEX "employee_person_id_index" ON "employee" ("person_id");--> statement-breakpoint
CREATE INDEX "person_email_index" ON "person" ("email");--> statement-breakpoint
CREATE INDEX "customer_name_trgm_index" ON "person" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_person_id_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id");--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_person_id_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id");--> statement-breakpoint
ALTER TABLE "person_phone" DROP CONSTRAINT "person_phone_person_id_person_id_fkey", ADD CONSTRAINT "person_phone_person_id_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id");