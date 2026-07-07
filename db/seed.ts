import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { hostels, rooms, tenants, services, invoices, roomUsages } from "./schema";

async function main() {
  console.log("Seeding started...");

  // 1. Clean existing data (in reverse order of foreign keys)
  await db.delete(invoices);
  await db.delete(roomUsages);
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
        isPrimary: true,
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
        isPrimary: false,
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
        isPrimary: true,
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
        isPrimary: false,
      }
    );
  }

  // Thêm một người thuê đã chuyển đi (soft deleted) để test bộ lọc lịch sử
  tenantsData.push({
    id: "t_a1_deleted_1",
    hostelId: "A",
    name: "Trần Thị Cựu Khách Phòng 1-A",
    phone: "0900111222",
    email: "cuu.khach1a@gmail.com",
    identityCard: "001099111222",
    dob: "1995-05-15",
    gender: "Nữ",
    birthYear: "1995",
    permanentAddress: "Hải Phòng",
    identityCardIssueDate: "2021-10-10",
    roomId: "a1",
    startDate: new Date("2025-09-01"),
    deposit: 0,
    isPrimary: false,
    deletedAt: new Date("2026-03-31"),
  });

  // Thực thi insert vào DB
  await db.insert(rooms).values(roomsData);
  console.log(`Inserted ${roomsData.length} rooms.`);

  await db.insert(tenants).values(tenantsData);
  console.log(`Inserted ${tenantsData.length} tenants.`);

  // 5. Insert Services
  await db.insert(services).values([
    { id: "s1", hostelId: "A", name: "Điện sinh hoạt", price: 3000, unit: "kWh", status: "active", description: "Tính theo công tơ điện riêng" },
    { id: "s2", hostelId: "A", name: "Nước sạch", price: 5000, unit: "m³", status: "active", description: "Tính theo khối lượng nước tiêu thụ" },
    { id: "s3", hostelId: "A", name: "Internet / Wifi", price: 20000, unit: "tháng/phòng", status: "active", description: "Internet gói 150Mbps" },
    { id: "s4", hostelId: "A", name: "Rác", price: 30000, unit: "tháng/phòng", status: "active", description: "Thu gom rác và dọn dẹp" },
    { id: "s5", hostelId: "B", name: "Điện kinh doanh", price: 4000, unit: "kWh", status: "active", description: "Điện khu dịch vụ cao cấp B" },
    { id: "s6", hostelId: "B", name: "Nước sinh hoạt B", price: 18000, unit: "m³", status: "active", description: "Nước máy thành phố" },
    { id: "s7", hostelId: "B", name: "Cáp quang tốc độ cao", price: 120000, unit: "tháng/phòng", status: "active", description: "Internet gói doanh nghiệp" },
    { id: "s8", hostelId: "B", name: "Vệ sinh & Gửi xe máy", price: 150000, unit: "tháng/phòng", status: "active", description: "Dịch vụ giữ xe kèm vệ sinh chung" },
  ]);
  console.log("Inserted services.");

  // 6. Insert Invoices (Hóa đơn mẫu đồng bộ với lịch sử điện nước và đơn giá mới)
  await db.insert(invoices).values([
    // Hostel A - Room a1
    {
      id: "i_a1_04",
      hostelId: "A",
      roomId: "a1",
      roomNumber: "1",
      tenantName: "Nguyễn Văn Khách Phòng 1-A",
      month: "2026-04",
      roomPrice: 2500000,
      electricityCost: 120 * 3000, // 100 -> 220 = 120 kWh
      waterCost: 8 * 5000,         // 10 -> 18 = 8 m3
      otherServicesCost: 20000 + 30000,
      total: 2500000 + (120 * 3000) + (8 * 5000) + 50000,
      status: "paid",
      createdAt: new Date("2026-04-30"),
    },
    {
      id: "i_a1_05",
      hostelId: "A",
      roomId: "a1",
      roomNumber: "1",
      tenantName: "Nguyễn Văn Khách Phòng 1-A",
      month: "2026-05",
      roomPrice: 2500000,
      electricityCost: 130 * 3000, // 220 -> 350 = 130 kWh
      waterCost: 9 * 5000,         // 18 -> 27 = 9 m3
      otherServicesCost: 20000 + 30000,
      total: 2500000 + (130 * 3000) + (9 * 5000) + 50000,
      status: "paid",
      createdAt: new Date("2026-05-30"),
    },
    {
      id: "i_a1_06",
      hostelId: "A",
      roomId: "a1",
      roomNumber: "1",
      tenantName: "Nguyễn Văn Khách Phòng 1-A",
      month: "2026-06",
      roomPrice: 2500000,
      electricityCost: 140 * 3000, // 350 -> 490 = 140 kWh
      waterCost: 10 * 5000,        // 27 -> 37 = 10 m3
      otherServicesCost: 20000 + 30000,
      total: 2500000 + (140 * 3000) + (10 * 5000) + 50000,
      status: "unpaid",
      createdAt: new Date("2026-06-30"),
    },
    // Hostel B - Room b1
    {
      id: "i_b1_04",
      hostelId: "B",
      roomId: "b1",
      roomNumber: "1",
      tenantName: "Lê Văn Khách Phòng 1-B",
      month: "2026-04",
      roomPrice: 3500000,
      electricityCost: 150 * 3000, // 200 -> 350 = 150 kWh
      waterCost: 13 * 5000,        // 15 -> 28 = 13 m3
      otherServicesCost: 20000 + 30000,
      total: 3500000 + (150 * 3000) + (13 * 5000) + 50000,
      status: "paid",
      createdAt: new Date("2026-04-30"),
    },
    {
      id: "i_b1_05",
      hostelId: "B",
      roomId: "b1",
      roomNumber: "1",
      tenantName: "Lê Văn Khách Phòng 1-B",
      month: "2026-05",
      roomPrice: 3500000,
      electricityCost: 160 * 3000, // 350 -> 510 = 160 kWh
      waterCost: 17 * 5000,        // 28 -> 45 = 17 m3
      otherServicesCost: 20000 + 30000,
      total: 3500000 + (160 * 3000) + (17 * 5000) + 50000,
      status: "paid",
      createdAt: new Date("2026-05-30"),
    },
    {
      id: "i_b1_06",
      hostelId: "B",
      roomId: "b1",
      roomNumber: "1",
      tenantName: "Lê Văn Khách Phòng 1-B",
      month: "2026-06",
      roomPrice: 3500000,
      electricityCost: 170 * 3000, // 510 -> 680 = 170 kWh
      waterCost: 20 * 5000,        // 45 -> 65 = 20 m3
      otherServicesCost: 20000 + 30000,
      total: 3500000 + (170 * 3000) + (20 * 5000) + 50000,
      status: "unpaid",
      createdAt: new Date("2026-06-30"),
    },
  ]);
  console.log("Inserted invoices.");

  // 7. Insert Room Usages (lịch sử điện nước mẫu)
  await db.insert(roomUsages).values([
    { id: "ru1", roomId: "a1", month: "2026-04", electricityStart: 100, electricityEnd: 220, waterStart: 10, waterEnd: 18 },
    { id: "ru2", roomId: "a1", month: "2026-05", electricityStart: 220, electricityEnd: 350, waterStart: 18, waterEnd: 27 },
    { id: "ru3", roomId: "a1", month: "2026-06", electricityStart: 350, electricityEnd: 490, waterStart: 27, waterEnd: 37 },
    { id: "ru4", roomId: "b1", month: "2026-04", electricityStart: 200, electricityEnd: 350, waterStart: 15, waterEnd: 28 },
    { id: "ru5", roomId: "b1", month: "2026-05", electricityStart: 350, electricityEnd: 510, waterStart: 28, waterEnd: 45 },
    { id: "ru6", roomId: "b1", month: "2026-06", electricityStart: 510, electricityEnd: 680, waterStart: 45, waterEnd: 65 },
  ]);
  console.log("Inserted room usages.");

  console.log("Seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:");
  console.error(err);
  process.exit(1);
});