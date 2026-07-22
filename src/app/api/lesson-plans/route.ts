import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const plans = await prisma.lessonPlan.findMany({
      where,
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("GET /api/lesson-plans error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { teacherId, subject, className, topic, objectives, content, resources, startDate, endDate } = body;

    if (!teacherId || !subject || !className || !topic || !content || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plan = await prisma.lessonPlan.create({
      data: {
        teacherId,
        subject,
        className,
        topic,
        objectives: objectives || undefined,
        content,
        resources: resources || undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/lesson-plans error:", error);
    return NextResponse.json({ error: "Failed to create lesson plan" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, status: newStatus, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const data: any = { ...updates };
    if (newStatus) data.status = newStatus;
    if (updates.startDate) data.startDate = new Date(updates.startDate);
    if (updates.endDate) data.endDate = new Date(updates.endDate);

    const plan = await prisma.lessonPlan.update({
      where: { id },
      data,
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("PUT /api/lesson-plans error:", error);
    return NextResponse.json({ error: "Failed to update lesson plan" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.lessonPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/lesson-plans error:", error);
    return NextResponse.json({ error: "Failed to delete lesson plan" }, { status: 500 });
  }
}
