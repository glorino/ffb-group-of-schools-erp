import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, type, startDate, endDate, status: examStatus } = body;

    if (!name || !startDate) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const schoolId = await getDefaultSchoolId();
    const exam = await prisma.exam.create({
      data: {
        schoolId,
        name,
        type: type || "terminal",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        status: examStatus || "upcoming",
      },
    });

    return NextResponse.json({ success: true, exam }, { status: 201 });
  } catch (error) {
    console.error("POST /api/exams error:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
