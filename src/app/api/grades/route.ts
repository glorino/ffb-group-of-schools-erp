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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { studentId, subjectId, type, score, maxScore, grade, term, session: sessionName, comments } = body;

    if (!studentId || !subjectId || !type || score === undefined) {
      return NextResponse.json({ error: "Missing required fields: studentId, subjectId, type, score" }, { status: 400 });
    }

    const computedGrade = grade || (score >= 75 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 40 ? "D" : "F");

    const existing = await prisma.grade.findFirst({
      where: { studentId, subjectId, type, term: term || null, session: sessionName || null },
    });

    let result;
    if (existing) {
      result = await prisma.grade.update({
        where: { id: existing.id },
        data: { score: parseFloat(score), maxScore: maxScore ? parseFloat(maxScore) : 100, grade: computedGrade, comments: comments || undefined },
      });
    } else {
      result = await prisma.grade.create({
        data: {
          studentId,
          subjectId,
          type,
          score: parseFloat(score),
          maxScore: maxScore ? parseFloat(maxScore) : 100,
          grade: computedGrade,
          term: term || undefined,
          session: sessionName || undefined,
          comments: comments || undefined,
        },
      });
    }

    return NextResponse.json({ success: true, grade: result }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/grades error:", error);
    return NextResponse.json({ error: error.message || "Failed to save grade" }, { status: 500 });
  }
}
