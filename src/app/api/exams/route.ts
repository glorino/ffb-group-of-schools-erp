import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";
import { ExamSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) where.status = status;

    const exams = await prisma.exam.findMany({
      where,
      include: { _count: { select: { questions: true, sittings: true } } },
      orderBy: { startDate: "desc" },
    });

    const questionCount = await prisma.examQuestion.count();

    return NextResponse.json({ exams, stats: { total: exams.length, questionCount } });
  } catch (error) {
    console.error("GET /api/exams error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = ExamSchema.parse(body);
    const { name, startDate } = validated;

    const schoolId = await getDefaultSchoolId();
    const exam = await prisma.exam.create({
      data: {
        schoolId,
        name,
        type: validated.type || "terminal",
        startDate: new Date(startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : new Date(startDate),
        status: "upcoming",
      },
    });

    return NextResponse.json({ success: true, exam }, { status: 201 });
  } catch (error) {
    console.error("POST /api/exams error:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
