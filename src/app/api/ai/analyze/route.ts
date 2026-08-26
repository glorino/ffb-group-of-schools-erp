import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { analyzeStudentPerformance } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const students = await prisma.student.findMany({
      where: { status: "active" },
      include: {
        grades: { select: { score: true, createdAt: true } },
        attendanceRecords: { select: { status: true } },
      },
    });

    const results = await Promise.allSettled(
      students.map(async (student) => {
        const grades = student.grades.map((g) => g.score).slice(-5);
        const attendanceRecs = student.attendanceRecords;
        const presentCount = attendanceRecs.filter((a) => a.status === "present").length;
        const attendanceRate = attendanceRecs.length > 0 ? Math.round((presentCount / attendanceRecs.length) * 100) : 100;
        const recentTrend = grades.length > 1
          ? grades[grades.length - 1] > grades[0]
            ? "improving"
            : "declining"
          : "stable";

        const analysis = await analyzeStudentPerformance({
          name: `${student.firstName} ${student.lastName}`,
          grades: grades.length > 0 ? grades : [50],
          attendance: attendanceRate,
          recentTrend,
        });

        return {
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          admissionNumber: student.admissionNumber,
          ...analysis,
        };
      })
    );

    const analyzed = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => r.value);

    const riskCounts = { low: 0, medium: 0, high: 0 };
    analyzed.forEach((a) => { riskCounts[a.riskLevel as keyof typeof riskCounts]++; });

    return NextResponse.json({
      success: true,
      totalAnalyzed: analyzed.length,
      riskCounts,
      predictions: analyzed,
    });
  } catch (error) {
    console.error("POST /api/ai/analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze students" }, { status: 500 });
  }
}
