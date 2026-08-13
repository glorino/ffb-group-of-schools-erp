import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { DisciplineSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "";

    const where: any = {};
    if (studentId) where.studentId = studentId;

    const records = await prisma.disciplineRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true } } } } },
    });

    const totalIncidents = records.length;
    const resolved = records.filter(r => r.action && r.action !== "pending").length;
    const pending = totalIncidents - resolved;

    const typeMap: Record<string, number> = {};
    records.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + 1; });
    const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

    const monthMap: Record<string, number> = {};
    records.forEach(r => {
      const month = new Date(r.date).toLocaleString("en-US", { month: "short" });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const monthlyTrend = Object.entries(monthMap).map(([month, incidents]) => ({ month, incidents }));

    return NextResponse.json({ success: true, totalIncidents, resolved, pending, byType, monthlyTrend, records });
  } catch (error) {
    console.error("GET /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to fetch discipline records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = DisciplineSchema.parse(body);
    const { studentId, type, title } = validated;

    const record = await prisma.disciplineRecord.create({
      data: {
        studentId,
        type,
        title,
        details: validated.description || undefined,
        date: validated.date ? new Date(validated.date) : new Date(),
        action: validated.action || "pending",
        reportedBy: authResult.session?.user?.name || undefined,
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error("POST /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to create discipline record" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, type, title, details, date, action } = body;

    if (!id) return NextResponse.json({ error: "Record ID is required" }, { status: 400 });

    const record = await prisma.disciplineRecord.update({
      where: { id },
      data: {
        type: type || undefined,
        title: title || undefined,
        details: details || undefined,
        date: date ? new Date(date) : undefined,
        action: action || undefined,
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("PUT /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to update discipline record" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.disciplineRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to delete discipline record" }, { status: 500 });
  }
}
