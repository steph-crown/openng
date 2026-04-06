CREATE SCHEMA "staging";
--> statement-breakpoint
CREATE SCHEMA "ref";
--> statement-breakpoint
CREATE SCHEMA "analytics";
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"name" text,
	"tier" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_link_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"session_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_hash_unique" UNIQUE("session_token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ref"."lgas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"headquarters" text,
	"state_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_lgas_slug_state" UNIQUE("slug","state_id")
);
--> statement-breakpoint
CREATE TABLE "ref"."states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"capital" text NOT NULL,
	"slug" text NOT NULL,
	"code" text NOT NULL,
	"iso_code" text NOT NULL,
	"geo_zone" text NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"area_sq_km" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "states_name_unique" UNIQUE("name"),
	CONSTRAINT "states_slug_unique" UNIQUE("slug"),
	CONSTRAINT "states_code_unique" UNIQUE("code"),
	CONSTRAINT "states_iso_code_unique" UNIQUE("iso_code")
);
--> statement-breakpoint
CREATE TABLE "analytics"."usage_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"api_key_id" bigint,
	"resource" text NOT NULL,
	"version" text NOT NULL,
	"status" smallint NOT NULL,
	"duration_ms" smallint NOT NULL,
	"country" text,
	"ts" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_link_tokens" ADD CONSTRAINT "magic_link_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ref"."lgas" ADD CONSTRAINT "lgas_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "ref"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."usage_events" ADD CONSTRAINT "usage_events_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_api_keys_key_hash" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "idx_api_keys_user_id" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_magic_link_tokens_token_hash" ON "magic_link_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_magic_link_tokens_expires_at" ON "magic_link_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_sessions_session_token_hash" ON "sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");