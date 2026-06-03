ALTER TABLE "invoices" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "start_date" SET DATA TYPE timestamp;--> statement-breakpoint
CREATE INDEX "invoices_hostel_id_idx" ON "invoices" USING btree ("hostel_id");--> statement-breakpoint
CREATE INDEX "invoices_room_id_idx" ON "invoices" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "rooms_hostel_id_idx" ON "rooms" USING btree ("hostel_id");--> statement-breakpoint
CREATE INDEX "services_hostel_id_idx" ON "services" USING btree ("hostel_id");--> statement-breakpoint
CREATE INDEX "tenants_hostel_id_idx" ON "tenants" USING btree ("hostel_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_room_id_idx" ON "tenants" USING btree ("room_id");