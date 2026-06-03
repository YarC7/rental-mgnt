import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.identityCard !== undefined) updateData.identityCard = body.identityCard;
    if (body.birthYear !== undefined) updateData.birthYear = body.birthYear;
    if (body.permanentAddress !== undefined) updateData.permanentAddress = body.permanentAddress;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.deposit !== undefined) updateData.deposit = Number(body.deposit);

    const updatedTenant = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, id))
      .returning();

    if (updatedTenant.length === 0) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTenant[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const tenantRecord = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (tenantRecord.length === 0) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const roomId = tenantRecord[0].roomId;

    const result = await db.transaction(async (tx) => {
      // 1. Delete tenant
      const deletedTenant = await tx.delete(tenants).where(eq(tenants.id, id)).returning();

      // 2. Set the room status to 'empty'
      await tx
        .update(rooms)
        .set({ status: "empty" })
        .where(eq(rooms.id, roomId));

      return deletedTenant[0];
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
