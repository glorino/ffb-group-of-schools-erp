import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["STUDENT"]);
    if (authResult.error) return authResult.error;

    const { id } = await params;
    const studentId = authResult.session!.user.id;
    const body = await request.json();
    const { sessionId, responses } = body as {
      sessionId: string;
      responses: { questionId: string; answer: string }[];
    };

    if (!sessionId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "sessionId and responses array are required" },
        { status: 400 }
      );
    }

    const session = await prisma.cBTSession.findUnique({
      where: { id: sessionId },
      include: { exam: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.status !== "in_progress") {
      return NextResponse.json(
        { error: "This session has already been submitted" },
        { status: 400 }
      );
    }

    if (session.examId !== id) {
      return NextResponse.json(
        { error: "Session does not match this exam" },
        { status: 400 }
      );
    }

    const questions = await prisma.cBTQuestion.findMany({
      where: { examId: id },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let totalScore = 0;
    let totalMarks = 0;

    const responseRecords = responses.map((r) => {
      const question = questionMap.get(r.questionId);
      if (!question) return null;

      totalMarks += question.marks;
      const isCorrect =
        question.answer.toUpperCase() === r.answer.toUpperCase();
      if (isCorrect) totalScore += question.marks;

      return {
        sessionId,
        questionId: r.questionId,
        response: r.answer,
        isCorrect,
        marks: isCorrect ? question.marks : 0,
      };
    });

    const validRecords = responseRecords.filter(Boolean) as {
      sessionId: string;
      questionId: string;
      response: string;
      isCorrect: boolean;
      marks: number;
    }[];

    await prisma.cBTResponse.createMany({ data: validRecords });

    const scorePercent =
      totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

    await prisma.cBTSession.update({
      where: { id: sessionId },
      data: {
        score: scorePercent,
        endedAt: new Date(),
        status: "completed",
      },
    });

    const detailedResults = responses.map((r) => {
      const question = questionMap.get(r.questionId);
      return {
        questionId: r.questionId,
        yourAnswer: r.answer,
        isCorrect:
          question?.answer.toUpperCase() === r.answer.toUpperCase(),
        marks: question?.marks ?? 0,
      };
    });

    return NextResponse.json({
      score: scorePercent,
      totalScore,
      totalMarks,
      passed: scorePercent >= (session.exam.passingScore || 50),
      passingScore: session.exam.passingScore || 50,
      results: detailedResults,
    });
  } catch (error) {
    console.error("POST /api/cbt/exams/[id]/submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}
