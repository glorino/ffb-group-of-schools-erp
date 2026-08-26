import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth([
      "OWNER",
      "ADMINISTRATOR",
      "PRINCIPAL",
      "VICE_PRINCIPAL",
      "TEACHER",
      "STUDENT",
    ]);
    if (authResult.error) return authResult.error;

    const { id } = await params;
    const userRoles = authResult.userRoles;
    const isStudent = userRoles.includes("STUDENT");

    const exam = await prisma.cBTExam.findUnique({
      where: { id },
      include: {
        questions: isStudent
          ? { select: { id: true, question: true, type: true, options: true, marks: true, topic: true } }
          : true,
        sessions: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
          },
          orderBy: { startedAt: "desc" },
        },
        _count: { select: { questions: true, sessions: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error("GET /api/cbt/exams/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth([
      "OWNER",
      "ADMINISTRATOR",
      "PRINCIPAL",
      "VICE_PRINCIPAL",
      "TEACHER",
    ]);
    if (authResult.error) return authResult.error;

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.cBTExam.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const exam = await prisma.cBTExam.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.duration !== undefined && { duration: Number(body.duration) }),
        ...(body.totalQuestions !== undefined && {
          totalQuestions: Number(body.totalQuestions),
        }),
        ...(body.passingScore !== undefined && {
          passingScore: Number(body.passingScore),
        }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.startDate !== undefined && {
          startDate: body.startDate ? new Date(body.startDate) : null,
        }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
        ...(body.settings !== undefined && { settings: body.settings }),
      },
    });

    return NextResponse.json({ exam });
  } catch (error: any) {
    console.error("PUT /api/cbt/exams/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth([
      "OWNER",
      "ADMINISTRATOR",
      "PRINCIPAL",
      "VICE_PRINCIPAL",
    ]);
    if (authResult.error) return authResult.error;

    const { id } = await params;

    const existing = await prisma.cBTExam.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    await prisma.cBTExam.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/cbt/exams/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete exam" },
      { status: 500 }
    );
  }
}
