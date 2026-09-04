import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { GradeSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (studentId) where.studentId = studentId;

    const grades = await prisma.grade.findMany({
      where,
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
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = GradeSchema.parse(body);
    const { studentId, subjectId, examId, score } = validated;

    const computedGrade = validated.grade || (score >= 75 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 40 ? "D" : "F");

    const result = await prisma.grade.upsert({
      where: {
        studentId_subjectId_type_term_session: { studentId, subjectId, type: "exam", term: "current", session: "current" },
      },
      update: { score, grade: computedGrade, comments: validated.comment || undefined },
      create: {
        studentId,
        subjectId,
        type: "exam",
        score,
        grade: computedGrade,
        comments: validated.comment || undefined,
      },
    });

    return NextResponse.json({ success: true, grade: result }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/grades error:", error);
    return NextResponse.json({ error: error.message || "Failed to save grade" }, { status: 500 });
  }
}
