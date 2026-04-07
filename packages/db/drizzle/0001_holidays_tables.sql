CREATE TABLE "holidays" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"day_of_week" text NOT NULL,
	"category" text NOT NULL,
	"schedule_kind" text NOT NULL,
	"year" integer NOT NULL,
	"is_confirmed" boolean DEFAULT true NOT NULL,
	"observance_note" text,
	"source_url" text NOT NULL,
	"source_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staging"."holidays" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"day_of_week" text NOT NULL,
	"category" text NOT NULL,
	"schedule_kind" text NOT NULL,
	"year" integer NOT NULL,
	"is_confirmed" boolean DEFAULT true NOT NULL,
	"observance_note" text,
	"source_url" text NOT NULL,
	"source_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_valid" boolean,
	"validation_note" text,
	"flagged" boolean,
	"flagged_reason" text,
	"migrated_at" timestamp with time zone,
	"import_batch_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_holidays_name_date" ON "holidays" USING btree ("name","date");--> statement-breakpoint
CREATE INDEX "idx_holidays_year" ON "holidays" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_holidays_date" ON "holidays" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_holidays_category" ON "holidays" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_holidays_schedule_kind" ON "holidays" USING btree ("schedule_kind");--> statement-breakpoint
CREATE INDEX "idx_holidays_is_confirmed" ON "holidays" USING btree ("is_confirmed");--> statement-breakpoint
CREATE INDEX "idx_staging_holidays_import_batch_id" ON "staging"."holidays" USING btree ("import_batch_id");--> statement-breakpoint
CREATE INDEX "idx_staging_holidays_batch_name_date" ON "staging"."holidays" USING btree ("import_batch_id","name","date");