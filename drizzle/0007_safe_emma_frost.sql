ALTER TABLE "tenants" ADD COLUMN "residence_status" text DEFAULT 'unregistered' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "residence_registered_at" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "residence_expires_at" text DEFAULT '' NOT NULL;