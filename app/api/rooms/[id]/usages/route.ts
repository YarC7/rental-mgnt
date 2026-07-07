import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomUsages, tenants, rooms, invoices } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");

    let query = db.select().from(roomUsages).where(eq(roomUsages.roomId, roomId));

    if (tenantId) {
      const tenantRecord = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (tenantRecord.length === 0) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }

      const tenant = tenantRecord[0];
      // Format startDate to YYYY-MM
      const startMonth = new Date(tenant.startDate).toISOString().substring(0, 7);
      // Format deletedAt to YYYY-MM or default to far future
      const endMonth = tenant.deletedAt 
        ? new Date(tenant.deletedAt).toISOString().substring(0, 7)
        : "9999-12";

      query = db
        .select()
        .from(roomUsages)
        .where(
          and(
            eq(roomUsages.roomId, roomId),
            gte(roomUsages.month, startMonth),
            lte(roomUsages.month, endMonth)
          )
        );
    }

    const usages = await query;
    // Sort usages by month descending
    usages.sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json(usages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const { month, electricityStart, electricityEnd, waterStart, waterEnd } = body;

    if (!month) {
      return NextResponse.json({ error: "Month is required" }, { status: 400 });
    }

    // 1. Fetch Room info
    const roomRecord = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (roomRecord.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const room = roomRecord[0];

    const updateData = {
      electricityStart: Number(electricityStart),
      electricityEnd: Number(electricityEnd),
      waterStart: Number(waterStart),
      waterEnd: Number(waterEnd),
    };

    // 2. Perform Usage Upsert
    const existing = await db
      .select()
      .from(roomUsages)
      .where(and(eq(roomUsages.roomId, roomId), eq(roomUsages.month, month)))
      .limit(1);

    let savedUsage;
    if (existing.length > 0) {
      const updated = await db
        .update(roomUsages)
        .set(updateData)
        .where(eq(roomUsages.id, existing[0].id))
        .returning();
      savedUsage = updated[0];
    } else {
      const inserted = await db
        .insert(roomUsages)
        .values({
          id: `ru_${Date.now()}`,
          roomId,
          month,
          ...updateData,
        })
        .returning();
      savedUsage = inserted[0];
    }

    // 3. Find tenant(s) residing in the room during this month
    const roomTenants = await db
      .select()
      .from(tenants)
      .where(eq(tenants.roomId, roomId));

    // Filter tenants active in the given month (month format: YYYY-MM)
    const monthStart = new Date(month + "-01");
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);

    const activeTenants = roomTenants.filter((t) => {
      const start = new Date(t.startDate);
      const isBeforeOrDuring = start <= monthEnd;
      const isNotDeletedOrDeletedAfter = !t.deletedAt || new Date(t.deletedAt) >= monthStart;
      return isBeforeOrDuring && isNotDeletedOrDeletedAfter;
    });

    if (activeTenants.length > 0) {
      // Find primary occupant, otherwise choose the first one
      const primaryTenant = activeTenants.find((t) => t.isPrimary) || activeTenants[0];

      // Calculate invoice values
      const elecUsed = Math.max(0, savedUsage.electricityEnd - savedUsage.electricityStart);
      const waterUsed = Math.max(0, savedUsage.waterEnd - savedUsage.waterStart);

      const electricityCost = elecUsed * 3000;
      const waterCost = waterUsed * 5000;
      const otherServicesCost = 20000 + 30000; // Internet: 20000, Trash: 30000
      const total = room.price + electricityCost + waterCost + otherServicesCost;

      // Check if an invoice already exists for this room and month
      const existingInvoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.roomId, roomId), eq(invoices.month, month)))
        .limit(1);

      if (existingInvoice.length > 0) {
        // Update existing invoice
        await db
          .update(invoices)
          .set({
            tenantName: primaryTenant.name,
            roomPrice: room.price,
            electricityCost,
            waterCost,
            otherServicesCost,
            total,
          })
          .where(eq(invoices.id, existingInvoice[0].id));
      } else {
        // Insert new invoice
        await db.insert(invoices).values({
          id: `inv_${Date.now()}`,
          hostelId: room.hostelId,
          roomId,
          roomNumber: room.number,
          tenantName: primaryTenant.name,
          month,
          roomPrice: room.price,
          electricityCost,
          waterCost,
          otherServicesCost,
          total,
          status: "unpaid",
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json(savedUsage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
