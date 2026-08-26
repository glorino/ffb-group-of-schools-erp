import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["STUDENT"]);
    if (authResult.error) return authResult.error;

    const studentId = authResult.session!.user.id;

    const sessions = await prisma.cBTSession.findMany({
      where: { studentId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
            type: true,
            passingScore: true,
            totalQuestions: true,
          },
        },
        responses: {
          select: { isCorrect: true, marks: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    const subjectStats: Record<
      string,
      { attempts: number; totalScore: number; bestScore: number; passed: number }
    > = {};

    const history = sessions.map((s) => {
      const correct = s.responses.filter((r) => r.isCorrect).length;
      const total = s.responses.length;
      const passed = (s.score ?? 0) >= (s.exam.passingScore || 50);

      const subject = s.exam.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = { attempts: 0, totalScore: 0, bestScore: 0, passed: 0 };
      }
      subjectStats[subject].attempts++;
      subjectStats[subject].totalScore += s.score ?? 0;
      subjectStats[subject].bestScore = Math.max(
        subjectStats[subject].bestScore,
        s.score ?? 0
      );
      if (passed) subjectStats[subject].passed++;

      return {
        sessionId: s.id,
        exam: s.exam,
        score: s.score,
        correct,
        total,
        passed,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        status: s.status,
      };
    });

    const subjectImprovement = Object.entries(subjectStats).map(
      ([subject, stats]) => {
        const recentSessions = sessions
          .filter((s) => s.exam.subject === subject)
          .slice(0, 5);
        const olderSessions = sessions
          .filter((s) => s.exam.subject === subject)
          .slice(5, 10);

        const recentAvg =
          recentSessions.length > 0
            ? recentSessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
              recentSessions.length
            : 0;
        const olderAvg =
          olderSessions.length > 0
            ? olderSessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
              olderSessions.length
            : recentAvg;

        return {
          subject,
          attempts: stats.attempts,
          averageScore: Math.round(stats.totalScore / stats.attempts),
          bestScore: stats.bestScore,
          passRate: Math.round((stats.passed / stats.attempts) * 100),
          trend:
            recentAvg > olderAvg
              ? "improving"
              : recentAvg < olderAvg
                ? "declining"
                : "stable",
        };
      }
    );

    return NextResponse.json({
      history,
      subjectImprovement,
      totalExams: sessions.length,
      overallAverage:
        sessions.length > 0
          ? Math.round(
              sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
                sessions.length
            )
          : 0,
    });
  } catch (error) {
    console.error("GET /api/cbt/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CBT history" },
      { status: 500 }
    );
  }
}
