import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const grades = await prisma.grade.findMany({
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        subject: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const scales = await prisma.gradingScale.findMany({ orderBy: { minScore: "desc" } });

    const subjectMap = new Map<string, { count: number; total: number; highest: number; lowest: number }>();
    grades.forEach(g => {
      const key = g.subject?.name || "Unknown";
      const existing = subjectMap.get(key) || { count: 0, total: 0, highest: 0, lowest: 100 };
      existing.count++;
      existing.total += g.score;
      existing.highest = Math.max(existing.highest, g.score);
      existing.lowest = Math.min(existing.lowest, g.score);
      subjectMap.set(key, existing);
    });

    const results = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      avgScore: Math.round(data.total / data.count),
      highest: data.highest,
      lowest: data.lowest,
      count: data.count,
    }));

    return NextResponse.json({ grades, results, scales, stats: { totalGrades: grades.length, subjects: results.length } });
  } catch (error) {
    console.error("GET /api/grades error:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}
