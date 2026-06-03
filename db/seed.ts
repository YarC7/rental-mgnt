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

  // 3. Insert Rooms
  await db.insert(rooms).values([
    { id: "a1", hostelId: "A", number: "101", price: 2500000, area: 25, status: "rented", description: "Phòng tầng 1, thoáng mát, vệ sinh khép kín" },
    { id: "a2", hostelId: "A", number: "102", price: 2500000, area: 25, status: "empty", description: "Phòng tầng 1, có gác lửng, kệ bếp" },
    { id: "a3", hostelId: "A", number: "201", price: 2800000, area: 28, status: "rented", description: "Phòng tầng 2, có ban công, tủ quần áo" },
    { id: "a4", hostelId: "A", number: "202", price: 2800000, area: 28, status: "empty", description: "Đang trống sạch sẽ" },
    { id: "a5", hostelId: "A", number: "301", price: 3000000, area: 30, status: "empty", description: "Phòng tầng 3, ban công rộng, có sẵn điều hòa" },
    { id: "b1", hostelId: "B", number: "B101", price: 3500000, area: 35, status: "rented", description: "Căn hộ dịch vụ cao cấp, đầy đủ nội thất" },
    { id: "b2", hostelId: "B", number: "B102", price: 3200000, area: 32, status: "empty", description: "Có máy giặt riêng, tủ lạnh, bếp điện âm" },
    { id: "b3", hostelId: "B", number: "B201", price: 3800000, area: 38, status: "empty", description: "View ban công cực đẹp, hướng Đông Nam" },
  ]);
  console.log("Inserted rooms.");

  // 4. Insert Tenants
  await db.insert(tenants).values([
    {
      id: "t1",
      hostelId: "A",
      name: "Nguyễn Văn A",
      phone: "0912345678",
      email: "vana@gmail.com",
      identityCard: "001099887766",
      birthYear: "1998",
      permanentAddress: "Hoàn Kiếm, Hà Nội",
      roomId: "a1",
      startDate: new Date("2026-01-15"),
      deposit: 2500000,
    },
    {
      id: "t2",
      hostelId: "A",
      name: "Trần Thị B",
      phone: "0987654321",
      email: "thib@gmail.com",
      identityCard: "002099776655",
      birthYear: "2000",
      permanentAddress: "Hải Châu, Đà Nẵng",
      roomId: "a3",
      startDate: new Date("2026-03-01"),
      deposit: 2800000,
    },
    {
      id: "t3",
      hostelId: "B",
      name: "Lê Văn C",
      phone: "0966778899",
      email: "vanc@gmail.com",
      identityCard: "003099665544",
      birthYear: "1997",
      permanentAddress: "Quận 3, TP Hồ Chí Minh",
      roomId: "b1",
      startDate: new Date("2026-02-10"),
      deposit: 3500000,
    },
  ]);
  console.log("Inserted tenants.");

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

  // 6. Insert Invoices
  await db.insert(invoices).values([
    {
      id: "i1",
      hostelId: "A",
      roomId: "a1",
      roomNumber: "101",
      tenantName: "Nguyễn Văn A",
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
      roomNumber: "B101",
      tenantName: "Lê Văn C",
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
