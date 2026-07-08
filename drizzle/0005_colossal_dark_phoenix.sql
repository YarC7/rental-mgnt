ALTER TABLE "invoices" DROP CONSTRAINT "invoices_hostel_id_hostels_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_room_month_unique" ON "invoices" USING btree ("room_id","month");--> statement-breakpoint
CREATE UNIQUE INDEX "room_usages_room_month_unique" ON "room_usages" USING btree ("room_id","month");--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_hostel_number_unique" ON "rooms" USING btree ("hostel_id","number");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_room_primary_unique" ON "tenants" USING btree ("room_id","is_primary") WHERE "tenants"."deleted_at" IS NULL AND "tenants"."is_primary" = true;