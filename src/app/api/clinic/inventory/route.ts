import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET() {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const medications = await prisma.clinicVisit.groupBy({
      by: ["medication"],
      _count: { id: true },
      where: { medication: { not: null } },
    });

    return NextResponse.json({
      medications: medications
        .filter((m) => m.medication)
        .map((m) => ({
          name: m.medication,
          used: m._count.id,
          category: "General",
        })),
    });
  } catch (error) {
    console.error("GET /api/clinic/inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { name, category, stock } = body;

    if (!name) {
      return NextResponse.json({ error: "Medication name is required" }, { status: 400 });
    }

    return NextResponse.json({ success: true, medication: { name, category: category || "General", stock: stock || 0 } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/clinic/inventory error:", error);
    return NextResponse.json({ error: "Failed to add medication" }, { status: 500 });
  }
}
