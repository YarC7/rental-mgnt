ALTER TABLE "tenants" DROP CONSTRAINT "tenants_room_id_unique";--> statement-breakpoint
DROP INDEX "tenants_room_id_idx";--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "dob" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "gender" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "tenants_room_id_idx" ON "tenants" USING btree ("room_id");