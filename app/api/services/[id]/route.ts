import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;

    const updatedService = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, id))
      .returning();

    if (updatedService.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(updatedService[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deletedService = await db.delete(services).where(eq(services.id, id)).returning();

    if (deletedService.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(deletedService[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
