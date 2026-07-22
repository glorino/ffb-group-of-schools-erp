import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const visits = await prisma.clinicVisit.findMany({
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } } },
      orderBy: { date: "desc" },
      take: 50,
    });

    const totalVisits = await prisma.clinicVisit.count();
    const recentVisits = await prisma.clinicVisit.count({ where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });

    return NextResponse.json({ visits, stats: { totalVisits, recentVisits } });
  } catch (error) {
    console.error("GET /api/clinic error:", error);
    return NextResponse.json({ error: "Failed to fetch clinic data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { studentId, reason, diagnosis, treatment, medication } = body;

    if (!studentId || !reason) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const visit = await prisma.clinicVisit.create({
      data: {
        studentId,
        reason,
        diagnosis: diagnosis || undefined,
        treatment: treatment || undefined,
        medication: medication || undefined,
        createdBy: session.user.name || undefined,
      },
    });

    return NextResponse.json({ success: true, visit }, { status: 201 });
  } catch (error) {
    console.error("POST /api/clinic error:", error);
    return NextResponse.json({ error: "Failed to create clinic visit" }, { status: 500 });
  }
}
