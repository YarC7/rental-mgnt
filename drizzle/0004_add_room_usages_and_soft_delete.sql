CREATE TABLE IF NOT EXISTS "room_usages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"month" text NOT NULL,
	"electricity_start" integer DEFAULT 0 NOT NULL,
	"electricity_end" integer DEFAULT 0 NOT NULL,
	"water_start" integer DEFAULT 0 NOT NULL,
	"water_end" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "room_usages" DROP CONSTRAINT IF EXISTS "room_usages_room_id_rooms_id_fk";--> statement-breakpoint
ALTER TABLE "room_usages" ADD CONSTRAINT "room_usages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP INDEX IF EXISTS "room_usages_room_id_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_usages_room_id_idx" ON "room_usages" USING btree ("room_id");