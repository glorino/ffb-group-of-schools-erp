import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
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

    const { session, userRoles } = authResult;
    const userId = session!.user.id;
    const isStudent = userRoles.includes("STUDENT");

    const now = new Date();

    if (isStudent) {
      const exams = await prisma.cBTExam.findMany({
        where: {
          status: "published",
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null },
          ],
        },
        include: {
          _count: { select: { questions: true, sessions: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const examsWithMyScores = await Promise.all(
        exams.map(async (exam) => {
          const mySession = await prisma.cBTSession.findFirst({
            where: { examId: exam.id, studentId: userId },
            orderBy: { startedAt: "desc" },
          });
          return { ...exam, myBestScore: mySession?.score ?? null };
        })
      );

      return NextResponse.json({ exams: examsWithMyScores });
    }

    const exams = await prisma.cBTExam.findMany({
      include: {
        _count: { select: { questions: true, sessions: true } },
        school: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("GET /api/cbt/exams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([
      "OWNER",
      "ADMINISTRATOR",
      "PRINCIPAL",
      "VICE_PRINCIPAL",
      "TEACHER",
    ]);
    if (authResult.error) return authResult.error;

    const userId = authResult.session!.user.id;
    const userRoles = authResult.userRoles;
    const schoolId = (authResult.session!.user as any).schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with your account" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      subject,
      duration,
      totalQuestions,
      passingScore,
      type,
      startDate,
      endDate,
      settings,
    } = body;

    if (!title || !subject || !duration || !totalQuestions) {
      return NextResponse.json(
        { error: "title, subject, duration, and totalQuestions are required" },
        { status: 400 }
      );
    }

    const exam = await prisma.cBTExam.create({
      data: {
        schoolId,
        title,
        subject,
        duration: Number(duration),
        totalQuestions: Number(totalQuestions),
        passingScore: Number(passingScore) || 50,
        type: type || "practice",
        status: "draft",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        settings: settings || undefined,
      },
    });

    return NextResponse.json({ exam }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/cbt/exams error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create exam" },
      { status: 500 }
    );
  }
}
