import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET() {
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

    const predictions = students.map((student) => {
      const grades = student.grades.map((g) => g.score).slice(-5);
      const avgScore = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
      const attendanceRecs = student.attendanceRecords;
      const presentCount = attendanceRecs.filter((a) => a.status === "present").length;
      const attendanceRate = attendanceRecs.length > 0 ? Math.round((presentCount / attendanceRecs.length) * 100) : 100;

      let riskLevel: "low" | "medium" | "high" = "low";
      if (avgScore < 40 || attendanceRate < 50) riskLevel = "high";
      else if (avgScore < 60 || attendanceRate < 70) riskLevel = "medium";

      return {
        studentId: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        avgScore,
        attendanceRate,
        riskLevel,
        predictedNextScore: Math.min(100, Math.max(0, avgScore + (Math.random() > 0.5 ? 3 : -3))),
      };
    });

    return NextResponse.json({ success: true, predictions });
  } catch (error) {
    console.error("GET /api/ai/predictions error:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}
