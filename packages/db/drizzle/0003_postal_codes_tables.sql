CREATE TABLE "postal_codes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"state_id" integer NOT NULL,
	"state_slug" text NOT NULL,
	"lga_id" integer,
	"lga_slug" text,
	"area_name" text NOT NULL,
	"post_office_name" text,
	"postal_code" text NOT NULL,
	"region_digit" integer NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"confidence" text NOT NULL,
	"source_kind" text NOT NULL,
	"source_url" text NOT NULL,
	"source_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staging"."postal_codes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"state_slug" text NOT NULL,
	"lga" text NOT NULL,
	"lga_slug" text,
	"area_name" text NOT NULL,
	"post_office_name" text,
	"postal_code" text NOT NULL,
	"region_digit" integer NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"confidence" text NOT NULL,
	"source_kind" text NOT NULL,
	"source_url" text NOT NULL,
	"source_date" date NOT NULL,
	"notes" text,
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
ALTER TABLE "postal_codes" ADD CONSTRAINT "postal_codes_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "ref"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postal_codes" ADD CONSTRAINT "postal_codes_lga_id_lgas_id_fk" FOREIGN KEY ("lga_id") REFERENCES "ref"."lgas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_postal_codes_state_lga_area_code" ON "postal_codes" USING btree ("state_id","lga_id","area_name","postal_code");--> statement-breakpoint
CREATE INDEX "idx_postal_codes_state_id" ON "postal_codes" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_postal_codes_state_slug" ON "postal_codes" USING btree ("state_slug");--> statement-breakpoint
CREATE INDEX "idx_postal_codes_state_lga" ON "postal_codes" USING btree ("state_id","lga_id");--> statement-breakpoint
CREATE INDEX "idx_postal_codes_state_lga_slug" ON "postal_codes" USING btree ("state_slug","lga_slug");--> statement-breakpoint
CREATE INDEX "idx_postal_codes_postal_code" ON "postal_codes" USING btree ("postal_code");--> statement-breakpoint
CREATE INDEX "idx_postal_codes_area_name" ON "postal_codes" USING btree ("area_name");--> statement-breakpoint
CREATE INDEX "idx_postal_codes_state_area_name" ON "postal_codes" USING btree ("state_slug","area_name");--> statement-breakpoint
CREATE INDEX "idx_staging_postal_codes_import_batch_id" ON "staging"."postal_codes" USING btree ("import_batch_id");--> statement-breakpoint
CREATE INDEX "idx_staging_postal_codes_state_slug" ON "staging"."postal_codes" USING btree ("state_slug");--> statement-breakpoint
CREATE INDEX "idx_staging_postal_codes_lga_slug" ON "staging"."postal_codes" USING btree ("lga_slug");--> statement-breakpoint
CREATE INDEX "idx_staging_postal_codes_postal_code" ON "staging"."postal_codes" USING btree ("postal_code");