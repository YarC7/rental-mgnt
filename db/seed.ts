import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { hostels, rooms, tenants, services, invoices } from "./schema";

async function main() {
  console.log("Seeding started...");

  // 1. Clean existing data (in reverse order of foreign keys)
  await db.delete(invoices);
  await db.delete(tenants);
  await db.delete(services);
  await db.delete(rooms);
  await db.delete(hostels);

  console.log("Cleaned old data.");

  // 2. Insert Hostels
  await db.insert(hostels).values([
    { id: "A", name: "Nhà trọ A" },
    { id: "B", name: "Nhà trọ B" },
  ]);
  console.log("Inserted hostels.");

  // 3. Generate Rooms Data
  const roomsData: (typeof rooms.$inferInsert)[] = [];
  const tenantsData: (typeof tenants.$inferInsert)[] = [];

  // --- Hostel A: 16 phòng (1 -> 16), mỗi phòng 2 người ---
  for (let i = 1; i <= 16; i++) {
    const roomNumber = i.toString(); // "1", "2", ..., "16"
    const roomId = `a${i}`;
    
    roomsData.push({
      id: roomId,
      hostelId: "A",
      number: roomNumber,
      price: 2500000,
      area: 25,
      status: "rented",
      description: `Phòng số ${roomNumber} - Nhà trọ A, sạch sẽ thoáng mát, vệ sinh khép kín`,
    });

    // 2 người ở phòng này
    tenantsData.push(
      {
        id: `t_a${i}_1`,
        hostelId: "A",
        name: `Nguyễn Văn Khách Phòng ${roomNumber}-A`,
        phone: `0912345${i.toString().padStart(3, "0")}`,
        email: `khach.phong${roomNumber}a@gmail.com`,
        identityCard: `001099000${i.toString().padStart(3, "0")}`,
        birthYear: "1999",
        permanentAddress: "Hà Nội",
        roomId: roomId,
        startDate: new Date("2026-01-15"),
        deposit: 2500000,
      },
      {
        id: `t_a${i}_2`,
        hostelId: "A",
        name: `Trần Thị Khách Phòng ${roomNumber}-B`,
        phone: `0987654${i.toString().padStart(3, "0")}`,
        email: `khach.phong${roomNumber}b@gmail.com`,
        identityCard: `002099000${i.toString().padStart(3, "0")}`,
        birthYear: "2001",
        permanentAddress: "Đà Nẵng",
        roomId: roomId,
        startDate: new Date("2026-01-15"),
        deposit: 0,
      }
    );
  }

  // --- Hostel B: 7 phòng (1 -> 7), mỗi phòng 2 người ---
  for (let i = 1; i <= 7; i++) {
    const roomNumber = i.toString(); // "1", "2", ..., "7"
    const roomId = `b${i}`;

    roomsData.push({
      id: roomId,
      hostelId: "B",
      number: roomNumber,
      price: 3500000,
      area: 35,
      status: "rented",
      description: `Căn hộ dịch vụ cao cấp - Phòng số ${roomNumber} - Nhà trọ B`,
    });

    // 2 người ở phòng này
    tenantsData.push(
      {
        id: `t_b${i}_1`,
        hostelId: "B",
        name: `Lê Văn Khách Phòng ${roomNumber}-B`, // Hậu tố -B để phân biệt với khách bên nhà A
        phone: `0966778${i.toString().padStart(3, "0")}`,
        email: `khach.b.phong${roomNumber}a@gmail.com`,
        identityCard: `003099000${i.toString().padStart(3, "0")}`,
        birthYear: "1997",
        permanentAddress: "TP Hồ Chí Minh",
        roomId: roomId,
        startDate: new Date("2026-02-10"),
        deposit: 3500000,
      },
      {
        id: `t_b${i}_2`,
        hostelId: "B",
        name: `Phạm Minh Khách Phòng ${roomNumber}-B`,
        phone: `0933445${i.toString().padStart(3, "0")}`,
        email: `khach.b.phong${roomNumber}b@gmail.com`,
        identityCard: `004099000${i.toString().padStart(3, "0")}`,
        birthYear: "1998",
        permanentAddress: "Cần Thơ",
        roomId: roomId,
        startDate: new Date("2026-02-10"),
        deposit: 0,
      }
    );
  }

  // Thực thi insert vào DB
  await db.insert(rooms).values(roomsData);
  console.log(`Inserted ${roomsData.length} rooms.`);

  await db.insert(tenants).values(tenantsData);
  console.log(`Inserted ${tenantsData.length} tenants.`);

  // 5. Insert Services
  await db.insert(services).values([
    { id: "s1", hostelId: "A", name: "Điện sinh hoạt", price: 3500, unit: "kWh", status: "active", description: "Tính theo công tơ điện riêng" },
    { id: "s2", hostelId: "A", name: "Nước sạch", price: 15000, unit: "m³", status: "active", description: "Tính theo khối lượng nước tiêu thụ" },
    { id: "s3", hostelId: "A", name: "Internet / Wifi", price: 50000, unit: "tháng/phòng", status: "active", description: "Internet gói 150Mbps" },
    { id: "s4", hostelId: "A", name: "Dịch vụ vệ sinh & Rác", price: 30000, unit: "tháng/phòng", status: "active", description: "Thu gom rác và dọn dẹp" },
    { id: "s5", hostelId: "B", name: "Điện kinh doanh", price: 4000, unit: "kWh", status: "active", description: "Điện khu dịch vụ cao cấp B" },
    { id: "s6", hostelId: "B", name: "Nước sinh hoạt B", price: 18000, unit: "m³", status: "active", description: "Nước máy thành phố" },
    { id: "s7", hostelId: "B", name: "Cáp quang tốc độ cao", price: 120000, unit: "tháng/phòng", status: "active", description: "Internet gói doanh nghiệp" },
    { id: "s8", hostelId: "B", name: "Vệ sinh & Gửi xe máy", price: 150000, unit: "tháng/phòng", status: "active", description: "Dịch vụ giữ xe kèm vệ sinh chung" },
  ]);
  console.log("Inserted services.");

  // 6. Insert Invoices (Hóa đơn mẫu của phòng 1 khu A và phòng 1 khu B)
  await db.insert(invoices).values([
    {
      id: "i1",
      hostelId: "A",
      roomId: "a1",
      roomNumber: "1",
      tenantName: "Nguyễn Văn Khách Phòng 1-A",
      month: "2026-05",
      roomPrice: 2500000,
      electricityCost: 45 * 3500,
      waterCost: 8 * 15000,
      otherServicesCost: 100000 + 50000,
      total: 2500000 + (45 * 3500) + (8 * 15000) + 150000,
      status: "paid",
      createdAt: new Date("2026-05-30"),
    },
    {
      id: "i3",
      hostelId: "B",
      roomId: "b1",
      roomNumber: "1",
      tenantName: "Lê Văn Khách Phòng 1-B",
      month: "2026-05",
      roomPrice: 3500000,
      electricityCost: 80 * 4000,
      waterCost: 15 * 18000,
      otherServicesCost: 120000 + 150000,
      total: 3500000 + (80 * 4000) + (15 * 18000) + 270000,
      status: "paid",
      createdAt: new Date("2026-05-30"),
    },
  ]);
  console.log("Inserted invoices.");

  console.log("Seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:");
  console.error(err);
  process.exit(1);
});