CREATE TYPE "public"."recipe_source" AS ENUM('llm', 'manual');--> statement-breakpoint
CREATE TYPE "public"."recipe_status" AS ENUM('saved', 'made');--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_email" text NOT NULL,
	"name" text NOT NULL,
	"ingredients" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"servings" integer NOT NULL,
	"prep_time" text NOT NULL,
	"cook_time" text NOT NULL,
	"search_query" text,
	"locale" text,
	"source" "recipe_source",
	"status" "recipe_status" DEFAULT 'saved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "recipes_owner_email_idx" ON "recipes" USING btree ("owner_email");--> statement-breakpoint
CREATE INDEX "recipes_owner_status_idx" ON "recipes" USING btree ("owner_email","status");