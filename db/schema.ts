import { pgTable, text, integer, timestamp, uniqueIndex, index, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. Hostels Table
// ==========================================
export const hostels = pgTable("hostels", {
  id: text("id").primaryKey(), // e.g. "A", "B"
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hostelsRelations = relations(hostels, ({ many }) => ({
  rooms: many(rooms),
  tenants: many(tenants),
  services: many(services),
  invoices: many(invoices),
}));

// ==========================================
// 2. Rooms Table
// ==========================================
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  price: integer("price").notNull(),
  area: integer("area").notNull(),
  status: text("status").$type<"empty" | "rented" | "maintenance">().notNull().default("empty"),
  description: text("description").notNull().default(""),
}, (table) => [
  index("rooms_hostel_id_idx").on(table.hostelId), // Thêm index để truy vấn phòng theo khu trọ nhanh hơn
]);

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hostel: one(hostels, {
    fields: [rooms.hostelId],
    references: [hostels.id],
  }),
  tenants: many(tenants),
  invoices: many(invoices),
  usages: many(roomUsages),
}));

// ==========================================
// 3. Tenants Table
// ==========================================
export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),           // Số điện thoại
  email: text("email").notNull().default(""),
  identityCard: text("identity_card").notNull(), // CCCD
  dob: text("dob").notNull().default(""),   // Ngày sinh
  gender: text("gender").notNull().default(""), // Giới tính
  birthYear: text("birth_year").notNull(),
  permanentAddress: text("permanent_address").notNull(),
  identityCardIssueDate: text("identity_card_issue_date"),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
  startDate: timestamp("start_date").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  deposit: integer("deposit").notNull().default(0),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("tenants_hostel_id_idx").on(table.hostelId),
  index("tenants_room_id_idx").on(table.roomId),
]);

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

// ==========================================
// 4. Services Table
// ==========================================
export const services = pgTable("services", {
  id: text("id").primaryKey(),
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  unit: text("unit").notNull(),
  status: text("status").$type<"active" | "inactive">().notNull().default("active"),
  description: text("description").notNull().default(""),
}, (table) => [
  index("services_hostel_id_idx").on(table.hostelId),
]);

export const servicesRelations = relations(services, ({ one }) => ({
  hostel: one(hostels, {
    fields: [services.hostelId],
    references: [hostels.id],
  }),
}));

// ==========================================
// 5. Invoices Table
// ==========================================
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  hostelId: text("hostel_id").notNull().references(() => hostels.id, { onDelete: "cascade" }),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }), // Giữ hóa đơn kể cả khi phòng bị xóa
  roomNumber: text("room_number").notNull(), // Tốt! Lưu snapshot đề phòng đổi số phòng
  tenantName: text("tenant_name").notNull(), // Tốt! Lưu snapshot đề phòng khách chuyển đi
  month: text("month").notNull(), // e.g. "2026-06"
  roomPrice: integer("room_price").notNull(),
  electricityCost: integer("electricity_cost").notNull().default(0),
  waterCost: integer("water_cost").notNull().default(0),
  otherServicesCost: integer("other_services_cost").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").$type<"unpaid" | "partial" | "paid">().notNull().default("unpaid"),
  createdAt: timestamp("created_at").defaultNow().notNull(), // Tối ưu: Thống nhất kiểu dữ liệu timestamp
}, (table) => [
  index("invoices_hostel_id_idx").on(table.hostelId),
  index("invoices_room_id_idx").on(table.roomId),
]);

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


// ==========================================
// 6. Payments Table
// ==========================================
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
  method: text("method").$type<"cash" | "bank_transfer" | "other">().notNull().default("cash"),
  note: text("note").notNull().default(""),
}, (table) => [
  index("payments_invoice_id_idx").on(table.invoiceId),
]);

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

// ==========================================
// 7. Room Usages Table
// ==========================================
export const roomUsages = pgTable("room_usages", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  month: text("month").notNull(), // e.g. "2026-07"
  electricityStart: integer("electricity_start").notNull().default(0),
  electricityEnd: integer("electricity_end").notNull().default(0),
  waterStart: integer("water_start").notNull().default(0),
  waterEnd: integer("water_end").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("room_usages_room_id_idx").on(table.roomId),
]);

export const roomUsagesRelations = relations(roomUsages, ({ one }) => ({
  room: one(rooms, {
    fields: [roomUsages.roomId],
    references: [rooms.id],
  }),
}));