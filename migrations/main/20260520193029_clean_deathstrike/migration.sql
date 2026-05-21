CREATE TYPE "anamnese_field_type" AS ENUM('TEXT', 'NUMBER', 'DATE', 'CHECKBOX', 'RADIO', 'SELECT');--> statement-breakpoint
CREATE TYPE "anamnese_field_validation_type" AS ENUM('required', 'minLength', 'maxLength', 'minValue', 'maxValue', 'pattern');--> statement-breakpoint
CREATE TYPE "catalog_item_type" AS ENUM('Produto', 'Serviço');--> statement-breakpoint
CREATE TYPE "marital_status" AS ENUM('Casado(a)', 'Solteiro(a)', 'Divorciado(a)', 'Viúvo(a)');--> statement-breakpoint
CREATE TYPE "phone_type" AS ENUM('Celular', 'Residencial', 'Trabalho');--> statement-breakpoint
CREATE TABLE "anamnese_field" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "anamnese_field_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"field_type" "anamnese_field_type" NOT NULL,
	"field_args" json,
	"label" varchar(128) NOT NULL,
	"extra_labels" json,
	"active" boolean NOT NULL,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anamnese_field_validation" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "anamnese_field_validation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"validation_type" "anamnese_field_validation_type" NOT NULL,
	"validation_args" json,
	"anamnese_field_id" integer NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_item" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "catalog_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"item_type" "catalog_item_type" NOT NULL,
	"name" varchar(256) NOT NULL,
	"default_price" numeric(10,2),
	"active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_anamnese" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_anamnese_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"customer_id" integer NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_anamnese_field" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_anamnese_field_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"customer_anamnese_id" integer NOT NULL,
	"anamnese_field_id" integer NOT NULL,
	"value" varchar(2048) NOT NULL,
	"extra_values" json
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
	"job_name" varchar(256),
	"marital_status" "marital_status",
	"email" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE "customer_followup" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_followup_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"text" text NOT NULL,
	"customer_id" integer NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_phone" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_phone_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"type" "phone_type" NOT NULL,
	"phone_number" varchar(12) NOT NULL,
	"customer_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followup_item" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "followup_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"followup_id" integer NOT NULL,
	"catalog_item_id" integer,
	"description" varchar(2048) NOT NULL,
	"price_applied" numeric(10,2) NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX "anamnese_field_validation_anamnese_field_id_index" ON "anamnese_field_validation" ("anamnese_field_id");--> statement-breakpoint
CREATE INDEX "catalog_item_item_type_index" ON "catalog_item" ("item_type");--> statement-breakpoint
CREATE INDEX "customer_anamnese_customer_id_index" ON "customer_anamnese" ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_anamnese_field_customer_anamnese_id_index" ON "customer_anamnese_field" ("customer_anamnese_id");--> statement-breakpoint
CREATE INDEX "customer_anamnese_field_anamnese_field_id_index" ON "customer_anamnese_field" ("anamnese_field_id");--> statement-breakpoint
CREATE INDEX "customer_email_index" ON "customer" ("email");--> statement-breakpoint
CREATE INDEX "customer_name_trgm_index" ON "customer" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "customer_followup_customer_id_index" ON "customer_followup" ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_phone_customer_id_index" ON "customer_phone" ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_phone_phone_number_index" ON "customer_phone" ("phone_number");--> statement-breakpoint
CREATE INDEX "followup_item_followup_id_index" ON "followup_item" ("followup_id");--> statement-breakpoint
CREATE INDEX "followup_item_catalog_item_id_index" ON "followup_item" ("catalog_item_id");--> statement-breakpoint
ALTER TABLE "anamnese_field_validation" ADD CONSTRAINT "anamnese_field_validation_vAksoN9R7QCH_fkey" FOREIGN KEY ("anamnese_field_id") REFERENCES "anamnese_field"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnese" ADD CONSTRAINT "customer_anamnese_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ADD CONSTRAINT "customer_anamnese_field_cTbveaiBx0ls_fkey" FOREIGN KEY ("customer_anamnese_id") REFERENCES "customer_anamnese"("id");--> statement-breakpoint
ALTER TABLE "customer_anamnese_field" ADD CONSTRAINT "customer_anamnese_field_pu6BG6rOHV2K_fkey" FOREIGN KEY ("anamnese_field_id") REFERENCES "anamnese_field"("id");--> statement-breakpoint
ALTER TABLE "customer_followup" ADD CONSTRAINT "customer_followup_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "customer_phone" ADD CONSTRAINT "customer_phone_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "followup_item" ADD CONSTRAINT "followup_item_followup_id_customer_followup_id_fkey" FOREIGN KEY ("followup_id") REFERENCES "customer_followup"("id");--> statement-breakpoint
ALTER TABLE "followup_item" ADD CONSTRAINT "followup_item_catalog_item_id_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_item"("id");