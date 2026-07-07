import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, rooms } from "@/db/schema";
import { eq, and, ne, isNull } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.identityCard !== undefined) updateData.identityCard = body.identityCard;
    if (body.dob !== undefined) updateData.dob = body.dob;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birthYear !== undefined) updateData.birthYear = body.birthYear;
    if (body.permanentAddress !== undefined) updateData.permanentAddress = body.permanentAddress;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.deposit !== undefined) updateData.deposit = Number(body.deposit);
    if (body.roomId !== undefined) updateData.roomId = body.roomId;
    if (body.identityCardIssueDate !== undefined) updateData.identityCardIssueDate = body.identityCardIssueDate;
    if (body.isPrimary !== undefined) updateData.isPrimary = body.isPrimary;

    // Get old tenant record to know their current roomId
    const oldTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (oldTenant.length === 0) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const oldRoomId = oldTenant[0].roomId;

    const result = await db.transaction(async (tx) => {
      const updatedTenant = await tx
        .update(tenants)
        .set(updateData)
        .where(eq(tenants.id, id))
        .returning();

      // If this tenant is now primary, update all other tenants in the same room to non-primary
      if (updateData.isPrimary === true) {
        const currentRoomId = updatedTenant[0].roomId;
        if (currentRoomId) {
          await tx
            .update(tenants)
            .set({ isPrimary: false })
            .where(and(eq(tenants.roomId, currentRoomId), ne(tenants.id, id)));
        }
      }

      // If the tenant was in a room and has been unlinked or moved
      if (oldRoomId && (body.roomId === null || body.roomId === "" || body.roomId !== oldRoomId)) {
        // Check if there are other tenants in the old room
        const remainingTenants = await tx
          .select()
          .from(tenants)
          .where(eq(tenants.roomId, oldRoomId));

        if (remainingTenants.length === 0) {
          // Set room status to 'empty'
          await tx
            .update(rooms)
            .set({ status: "empty" })
            .where(eq(rooms.id, oldRoomId));
        }
      }

      return updatedTenant[0];
    });

    return NextResponse.json(result);
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
      // 1. Soft-delete tenant: set deletedAt and clear isPrimary (keep roomId for history)
      const deletedTenant = await tx
        .update(tenants)
        .set({ deletedAt: new Date(), isPrimary: false })
        .where(eq(tenants.id, id))
        .returning();

      // 2. Set the room status to 'empty' if no remaining tenants are in that room
      if (roomId) {
        const remainingTenants = await tx
          .select()
          .from(tenants)
          .where(and(eq(tenants.roomId, roomId), isNull(tenants.deletedAt)));

        if (remainingTenants.length === 0) {
          await tx
            .update(rooms)
            .set({ status: "empty" })
            .where(eq(rooms.id, roomId));
        }
      }

      return deletedTenant[0];
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
