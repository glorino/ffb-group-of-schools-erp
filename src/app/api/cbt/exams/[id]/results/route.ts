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
    const userId = authResult.session!.user.id;
    const isStudent = userRoles.includes("STUDENT");

    const exam = await prisma.cBTExam.findUnique({ where: { id } });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const whereClause: Record<string, any> = { examId: id };
    if (isStudent) {
      whereClause.studentId = userId;
    }

    const sessions = await prisma.cBTSession.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
        responses: {
          include: {
            question: { select: { id: true, question: true, answer: true, marks: true } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    const results = sessions.map((s) => {
      const totalCorrect = s.responses.filter((r) => r.isCorrect).length;
      const totalAnswered = s.responses.length;
      const totalMarks = s.responses.reduce((sum, r) => sum + (r.marks ?? 0), 0);
      const earnedMarks = s.responses.reduce(
        (sum, r) => sum + (r.isCorrect ? (r.marks ?? 0) : 0),
        0
      );

      return {
        sessionId: s.id,
        student: s.student,
        score: s.score,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        status: s.status,
        totalCorrect,
        totalAnswered,
        totalMarks,
        earnedMarks,
        passed: (s.score ?? 0) >= (exam.passingScore || 50),
      };
    });

    const stats = isStudent
      ? undefined
      : {
          totalSessions: sessions.length,
          averageScore:
            sessions.length > 0
              ? Math.round(
                  sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
                    sessions.length
                )
              : 0,
          highestScore: Math.max(...sessions.map((s) => s.score ?? 0), 0),
          lowestScore: Math.min(...sessions.map((s) => s.score ?? 0), 0),
          passRate:
            sessions.length > 0
              ? Math.round(
                  (sessions.filter((s) => (s.score ?? 0) >= (exam.passingScore || 50))
                    .length /
                    sessions.length) *
                    100
                )
              : 0,
        };

    return NextResponse.json({ exam, results, stats });
  } catch (error) {
    console.error("GET /api/cbt/exams/[id]/results error:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
