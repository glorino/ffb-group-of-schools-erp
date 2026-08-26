import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { generateExamQuestions } from "@/lib/ai";

export async function POST(
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
    ]);
    if (authResult.error) return authResult.error;

    const { id } = await params;
    const body = await request.json();
    const { count, difficulty, topics } = body as {
      count: number;
      difficulty: string;
      topics: string[];
    };

    if (!count || count < 1 || count > 100) {
      return NextResponse.json(
        { error: "count must be between 1 and 100" },
        { status: 400 }
      );
    }

    const exam = await prisma.cBTExam.findUnique({ where: { id } });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const allQuestions: {
      question: string;
      options: { A: string; B: string; C: string; D: string };
      answer: string;
      explanation: string;
      difficulty: string;
      topic: string;
    }[] = [];

    const topicsToUse =
      topics && topics.length > 0 ? topics : [exam.subject];

    const perTopic = Math.ceil(count / topicsToUse.length);

    for (const topic of topicsToUse) {
      const generated = await generateExamQuestions({
        subject: exam.subject,
        topic,
        count: perTopic,
        difficulty: difficulty || "medium",
        examType: exam.type || "WAEC",
      });
      allQuestions.push(...generated);
    }

    const trimmed = allQuestions.slice(0, count);

    const created = await prisma.cBTQuestion.createMany({
      data: trimmed.map((q) => ({
        examId: id,
        question: q.question,
        type: "objective",
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.topic,
        marks: 1,
      })),
    });

    await prisma.cBTExam.update({
      where: { id },
      data: { totalQuestions: { increment: created.count } },
    });

    return NextResponse.json({
      generated: created.count,
      questions: trimmed,
    });
  } catch (error: any) {
    console.error("POST /api/cbt/exams/[id]/generate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
