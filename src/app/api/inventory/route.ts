import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";

    const where: any = {};
    if (category) where.category = category;

    const items = await prisma.inventoryItem.findMany({
      where,
      include: { purchases: { orderBy: { purchasedAt: "desc" }, take: 5 } },
      orderBy: { createdAt: "desc" },
    });

    const lowStock = items.filter(i => i.quantity <= 5).length;
    const totalValue = items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);

    return NextResponse.json({
      items,
      stats: { total: items.length, lowStock, totalValue, categories: new Set(items.map(i => i.category)).size },
    });
  } catch (error) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, category, quantity, unit, unitPrice, location } = body;

    if (!name || !category) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const schoolId = await getDefaultSchoolId();
    const item = await prisma.inventoryItem.create({
      data: {
        schoolId,
        name,
        category,
        quantity: parseInt(quantity) || 0,
        unit: unit || "piece",
        unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
        location: location || undefined,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/inventory error:", error);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, name, category, quantity, unit, unitPrice, location, status } = body;

    if (!id) return NextResponse.json({ error: "Missing item ID" }, { status: 400 });

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(unit && { unit }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
        ...(location !== undefined && { location }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("PUT /api/inventory error:", error);
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}
