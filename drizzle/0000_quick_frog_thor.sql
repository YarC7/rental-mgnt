CREATE TABLE "hostels" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"hostel_id" text NOT NULL,
	"room_id" text,
	"room_number" text NOT NULL,
	"tenant_name" text NOT NULL,
	"month" text NOT NULL,
	"room_price" integer NOT NULL,
	"electricity_cost" integer DEFAULT 0 NOT NULL,
	"water_cost" integer DEFAULT 0 NOT NULL,
	"other_services_cost" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"hostel_id" text NOT NULL,
	"number" text NOT NULL,
	"price" integer NOT NULL,
	"area" integer NOT NULL,
	"status" text DEFAULT 'empty' NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"hostel_id" text NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"unit" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"hostel_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"identity_card" text NOT NULL,
	"birth_year" text NOT NULL,
	"permanent_address" text NOT NULL,
	"room_id" text NOT NULL,
	"start_date" text NOT NULL,
	"deposit" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tenants_room_id_unique" UNIQUE("room_id")
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;