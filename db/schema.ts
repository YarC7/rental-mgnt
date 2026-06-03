import { pgTable, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Hostels Table
export const hostels = pgTable("hostels", {
  id: text("id").primaryKey(), // e.g. "A", "B"
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Hostels relations
export const hostelsRelations = relations(hostels, ({ many }) => ({
  rooms: many(rooms),
  tenants: many(tenants),
  services: many(services),
  invoices: many(invoices),
}));

// 2. Rooms Table
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(), // r_1717...
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  price: integer("price").notNull(),
  area: integer("area").notNull(),
  status: text("status").$type<"empty" | "rented" | "maintenance">().notNull().default("empty"),
  description: text("description").notNull().default(""),
});

// Rooms relations
export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hostel: one(hostels, {
    fields: [rooms.hostelId],
    references: [hostels.id],
  }),
  tenant: one(tenants, {
    fields: [rooms.id],
    references: [tenants.roomId],
  }),
  invoices: many(invoices),
}));

// 3. Tenants Table
export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(), // t_1717...
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  identityCard: text("identity_card").notNull(),
  birthYear: text("birth_year").notNull(),
  permanentAddress: text("permanent_address").notNull(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }).unique(),
  startDate: text("start_date").notNull(),
  deposit: integer("deposit").notNull().default(0),
});

// Tenants relations
export const tenantsRelations = relations(tenants, ({ one }) => ({
  hostel: one(hostels, {
    fields: [tenants.hostelId],
    references: [hostels.id],
  }),
  room: one(rooms, {
    fields: [tenants.roomId],
    references: [rooms.id],
  }),
}));

// 4. Services Table
export const services = pgTable("services", {
  id: text("id").primaryKey(), // s_1717...
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  unit: text("unit").notNull(),
  status: text("status").$type<"active" | "inactive">().notNull().default("active"),
  description: text("description").notNull().default(""),
});

// Services relations
export const servicesRelations = relations(services, ({ one }) => ({
  hostel: one(hostels, {
    fields: [services.hostelId],
    references: [hostels.id],
  }),
}));

// 5. Invoices Table
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(), // i_1717...
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
  roomNumber: text("room_number").notNull(),
  tenantName: text("tenant_name").notNull(),
  month: text("month").notNull(), // e.g. "2026-06"
  roomPrice: integer("room_price").notNull(),
  electricityCost: integer("electricity_cost").notNull().default(0),
  waterCost: integer("water_cost").notNull().default(0),
  otherServicesCost: integer("other_services_cost").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").$type<"paid" | "unpaid">().notNull().default("unpaid"),
  createdAt: text("created_at").notNull(),
});

// Invoices relations
export const invoicesRelations = relations(invoices, ({ one }) => ({
  hostel: one(hostels, {
    fields: [invoices.hostelId],
    references: [hostels.id],
  }),
  room: one(rooms, {
    fields: [invoices.roomId],
    references: [rooms.id],
  }),
}));
