import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";

export async function GET() {
  try {
    const allServices = await db.select().from(services);
    return NextResponse.json(allServices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostelId, name, price, unit, status, description } = body;

    const newId = `s_${Date.now()}`;

    const newService = await db.insert(services).values({
      id: newId,
      hostelId,
      name,
      price: Number(price),
      unit,
      status: status || "active",
      description: description || "",
    }).returning();

    return NextResponse.json(newService[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
