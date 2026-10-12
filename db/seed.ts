import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { hostels, rooms, tenants, services, invoices, roomUsages } from "./schema";

// ==========================================
// Seeded RNG (mulberry32) — same seed = same data every run
// ==========================================
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260708); // fixed seed = ngày viết seed này

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function randDate(startISO: string, endISO: string): Date {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return new Date(start + rng() * (end - start));
}
function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ==========================================
// Vietnamese name generator
// ==========================================
const FAMILY_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const MALE_MIDDLE = ["Văn", "Hữu", "Đức", "Minh", "Quang", "Thành", "Công", "Anh"];
const FEMALE_MIDDLE = ["Thị", "Ngọc", "Thu", "Kim", "Diệu", "Mai", "Hồng"];
const MALE_GIVEN = ["Nam", "Hùng", "Tuấn", "Dũng", "Long", "Sơn", "Khánh", "Phong", "Đạt", "Bình", "Kiên", "Hiếu", "Đăng", "Quân", "Vinh"];
const FEMALE_GIVEN = ["Hoa", "Lan", "Trang", "Linh", "Hương", "Nga", "Thảo", "Vy", "Hạnh", "Chi", "Yến", "Nhung", "Trinh", "My"];

const PROVINCES: Record<string, string> = {
  "Hà Nội": "001",
  "Hải Phòng": "031",
  "Đà Nẵng": "048",
  "TP Hồ Chí Minh": "079",
  "Cần Thơ": "092",
  "Nghệ An": "040",
  "Thanh Hóa": "038",
  "Bắc Ninh": "027",
};
const ADDRESS_LIST = Object.keys(PROVINCES);

function stripDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function genPerson(id: string) {
  const gender: "male" | "female" = rng() < 0.5 ? "male" : "female";
  const family = pick(FAMILY_NAMES);
  const middle = gender === "male" ? pick(MALE_MIDDLE) : pick(FEMALE_MIDDLE);
  const given = gender === "male" ? pick(MALE_GIVEN) : pick(FEMALE_GIVEN);
  const fullName = `${family} ${middle} ${given}`;

  const birthYear = randInt(1985, 2005);
  const birthMonth = randInt(1, 12);
  const birthDay = randInt(1, 28);
  const dob = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

  const address = pick(ADDRESS_LIST);
  const provinceCode = PROVINCES[address];
  // CCCD rule: thế kỷ 20 (1900-1999) nam=0 nữ=1; thế kỷ 21 (2000-2099) nam=2 nữ=3
  const centuryGenderDigit = birthYear < 2000 ? (gender === "male" ? "0" : "1") : gender === "male" ? "2" : "3";
  const yearSuffix = String(birthYear).slice(2);
  const sequence = String(randInt(0, 999999)).padStart(6, "0");
  const identityCard = `${provinceCode}${centuryGenderDigit}${yearSuffix}${sequence}`;

  const mobilePrefixes = ["090", "091", "093", "094", "096", "097", "098", "032", "033", "034", "035", "036", "037", "038", "039", "070", "079", "081", "083", "084"];
  const phone = `${pick(mobilePrefixes)}${String(randInt(1000000, 9999999)).padStart(7, "0")}`;

  const asciiName = stripDiacritics(fullName).toLowerCase().replace(/\s+/g, ".");
  const emailDomain = pick(["gmail.com", "yahoo.com", "outlook.com"]);
  const email = `${asciiName}${randInt(1, 99)}@${emailDomain}`;

  return {
    id,
    name: fullName,
    phone,
    email,
    identityCard,
    dob,
    gender: gender === "male" ? "Nam" : "Nữ",
    permanentAddress: address,
    identityCardIssueDate: toISODate(randDate(`${birthYear + 18}-01-01`, "2024-12-31")),
    birthYear: String(birthYear),
  };
}

// ==========================================
// Rate lookup — reads directly from services data, never hard-coded
// ==========================================
const servicesData: (typeof services.$inferInsert)[] = [
  { id: "s1", hostelId: "A", name: "Điện", price: 3000, unit: "kWh", status: "active", description: "Tính theo công tơ điện riêng" },
  { id: "s2", hostelId: "A", name: "Nước", price: 5000, unit: "m³", status: "active", description: "Tính theo khối lượng nước tiêu thụ" },
  { id: "s3", hostelId: "A", name: "Wifi", price: 20000, unit: "tháng/phòng", status: "active", description: "Internet gói 150Mbps" },
  { id: "s4", hostelId: "A", name: "Rác", price: 30000, unit: "tháng/phòng", status: "active", description: "Thu gom rác và dọn dẹp" },
  { id: "s5", hostelId: "B", name: "Điện", price: 4000, unit: "kWh", status: "active", description: "Tính theo công tơ điện riêng" },
  { id: "s6", hostelId: "B", name: "Nước", price: 18000, unit: "m³", status: "active", description: "Tính theo khối lượng nước tiêu thụ" },
  { id: "s7", hostelId: "B", name: "Wifi", price: 120000, unit: "tháng/phòng", status: "active", description: "Internet gói 150Mbps" },
  { id: "s8", hostelId: "B", name: "Rác", price: 150000, unit: "tháng/phòng", status: "active", description: "Thu gom rác và dọn dẹp" },
];

function rateFor(hostelId: string, name: string): number {
  const svc = servicesData.find((s) => s.hostelId === hostelId && s.name === name);
  if (!svc) throw new Error(`Không tìm thấy dịch vụ "${name}" cho hostel ${hostelId}`);
  return svc.price;
}

const RATE_NAMES = {
  A: { electricity: "Điện sinh hoạt", water: "Nước sạch", fixedA: "Internet / Wifi", fixedB: "Rác" },
  B: { electricity: "Điện kinh doanh", water: "Nước sinh hoạt B", fixedA: "Cáp quang tốc độ cao", fixedB: "Vệ sinh & Gửi xe máy" },
};

async function main() {
  console.log("Seeding started...");

  await db.delete(invoices);
  await db.delete(roomUsages);
  await db.delete(tenants);
  await db.delete(services);
  await db.delete(rooms);
  await db.delete(hostels);
  console.log("Cleaned old data.");

  await db.insert(hostels).values([
    { id: "A", name: "Nhà trọ A" },
    { id: "B", name: "Nhà trọ B" },
  ]);
  console.log("Inserted hostels.");

  const roomsData: (typeof rooms.$inferInsert)[] = [];
  const tenantsData: (typeof tenants.$inferInsert)[] = [];

  // Cấu hình mỗi dãy: số phòng, đơn giá, diện tích, khoảng ngày bắt đầu thuê
  const hostelConfigs = [
    { id: "A", count: 16, price: 2500000, area: 25, dateRange: ["2025-10-01", "2026-03-15"] as [string, string], desc: "Nhà trọ A" },
    { id: "B", count: 7, price: 3500000, area: 35, dateRange: ["2025-12-01", "2026-04-01"] as [string, string], desc: "Nhà trọ B - căn hộ dịch vụ" },
  ];

  for (const cfg of hostelConfigs) {
    for (let i = 1; i <= cfg.count; i++) {
      const roomNumber = i.toString();
      const roomId = `${cfg.id.toLowerCase()}${i}`;
      // ~30% phòng chỉ ở 1 người, còn lại ở ghép 2 người — sát thực tế hơn
      const occupancy = rng() < 0.3 ? 1 : 2;

      roomsData.push({
        id: roomId,
        hostelId: cfg.id,
        number: roomNumber,
        price: cfg.price,
        area: cfg.area,
        status: "rented",
        description: `Phòng số ${roomNumber} - ${cfg.desc}, sạch sẽ thoáng mát, vệ sinh khép kín`,
      });

      const moveInDate = randDate(cfg.dateRange[0], cfg.dateRange[1]);

      for (let p = 1; p <= occupancy; p++) {
        const person = genPerson(`t_${roomId}_${p}`);
        tenantsData.push({
          ...person,
          hostelId: cfg.id,
          roomId,
          startDate: moveInDate,
          deposit: p === 1 ? cfg.price : 0, // chủ phòng đóng cọc, người ở ghép không đóng thêm
          isPrimary: p === 1,
        });
      }
    }
  }

  // Vài tenant đã chuyển đi (để test lịch sử / bộ lọc deletedAt) — rải ở nhiều phòng khác nhau
  const movedOutRoomIds = ["a1", "a5", "a12", "b2"];
  for (const roomId of movedOutRoomIds) {
    const person = genPerson(`t_${roomId}_moved_out`);
    const hostelId = roomId.startsWith("a") ? "A" : "B";
    tenantsData.push({
      ...person,
      hostelId,
      roomId,
      startDate: new Date("2025-06-01"),
      deposit: 0,
      isPrimary: false,
      deletedAt: randDate("2026-02-01", "2026-04-30"),
    });
  }

  await db.insert(rooms).values(roomsData);
  console.log(`Inserted ${roomsData.length} rooms.`);

  await db.insert(tenants).values(tenantsData);
  console.log(`Inserted ${tenantsData.length} tenants.`);

  await db.insert(services).values(servicesData);
  console.log("Inserted services.");

  // ==========================================
  // Invoices + room usages — 3 tháng gần nhất, đơn giá lấy từ servicesData
  // ==========================================
  const invoicesData: (typeof invoices.$inferInsert)[] = [];
  const roomUsagesData: (typeof roomUsages.$inferInsert)[] = [];
  const months = ["2026-04", "2026-05", "2026-06"];

  for (const cfg of hostelConfigs) {
    const rates = RATE_NAMES[cfg.id as "A" | "B"];
    const elecRate = rateFor(cfg.id, rates.electricity);
    const waterRate = rateFor(cfg.id, rates.water);
    const fixedA = rateFor(cfg.id, rates.fixedA);
    const fixedB = rateFor(cfg.id, rates.fixedB);

    for (let i = 1; i <= cfg.count; i++) {
      const roomId = `${cfg.id.toLowerCase()}${i}`;
      const roomNumber = i.toString();
      const primaryTenant = tenantsData.find((t) => t.roomId === roomId && t.isPrimary);

      let prevElec = randInt(80, 300);
      let prevWater = randInt(8, 30);
      // Xác suất phòng này có nợ tồn từ tháng trước — mỗi phòng random độc lập, không đồng loạt
      let hasPendingDebt = false;

      for (let m = 0; m < months.length; m++) {
        const month = months[m];
        const elecUsed = randInt(60, 180);
        const waterUsed = randInt(4, 14);
        const currentElec = prevElec + elecUsed;
        const currentWater = prevWater + waterUsed;

        roomUsagesData.push({
          id: `ru_${roomId}_${m}`,
          roomId,
          month,
          electricityStart: prevElec,
          electricityEnd: currentElec,
          waterStart: prevWater,
          waterEnd: currentWater,
          createdAt: new Date(`${month}-28`),
        });

        const electricityCost = elecUsed * elecRate;
        const waterCost = waterUsed * waterRate;
        const otherServicesCost = fixedA + fixedB;
        const total = cfg.price + electricityCost + waterCost + otherServicesCost;

        // Trạng thái thanh toán: mỗi phòng ~15% khả năng còn nợ ở bất kỳ tháng nào,
        // tháng hiện tại (6/2026) tỷ lệ nợ cao hơn vì chưa tới hạn thu
        const isLatestMonth = m === months.length - 1;
        const unpaidChance = isLatestMonth ? 0.45 : 0.12;
        const status = rng() < unpaidChance ? "unpaid" : "paid";
        if (status === "unpaid") hasPendingDebt = true;

        invoicesData.push({
          id: `i_${roomId}_${m}`,
          hostelId: cfg.id,
          roomId,
          roomNumber,
          tenantName: primaryTenant?.name ?? `Phòng ${roomNumber}`,
          month,
          roomPrice: cfg.price,
          electricityCost,
          waterCost,
          otherServicesCost,
          total,
          status,
          createdAt: new Date(`${month}-30`),
        });

        prevElec = currentElec;
        prevWater = currentWater;
      }
    }
  }

  await db.insert(invoices).values(invoicesData);
  console.log(`Inserted ${invoicesData.length} invoices.`);

  await db.insert(roomUsages).values(roomUsagesData);
  console.log(`Inserted ${roomUsagesData.length} room usages.`);

  console.log("Seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:");
  console.error(err);
  process.exit(1);
});