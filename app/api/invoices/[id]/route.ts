import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;

    const updatedInvoice = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();

    if (updatedInvoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(updatedInvoice[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deletedInvoice = await db.delete(invoices).where(eq(invoices.id, id)).returning();

    if (deletedInvoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(deletedInvoice[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
