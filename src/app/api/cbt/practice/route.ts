import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { generateExamQuestions } from "@/lib/ai";

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

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    const where: Record<string, any> = { type: "practice" };
    if (subject) where.subject = subject;

    const exams = await prisma.cBTExam.findMany({
      where,
      include: {
        _count: { select: { questions: true, sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("GET /api/cbt/practice error:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice exams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["STUDENT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { subject, topic, count, difficulty } = body as {
      subject: string;
      topic: string;
      count: number;
      difficulty: string;
    };

    if (!subject || !topic) {
      return NextResponse.json(
        { error: "subject and topic are required" },
        { status: 400 }
      );
    }

    const schoolId = (authResult.session!.user as any).schoolId;
    const questionCount = Math.min(count || 10, 50);

    const exam = await prisma.cBTExam.create({
      data: {
        schoolId,
        title: `Practice: ${topic}`,
        subject,
        duration: 30,
        totalQuestions: questionCount,
        passingScore: 50,
        type: "practice",
        status: "published",
      },
    });

    const generated = await generateExamQuestions({
      subject,
      topic,
      count: questionCount,
      difficulty: difficulty || "medium",
      examType: "practice",
    });

    await prisma.cBTQuestion.createMany({
      data: generated.map((q) => ({
        examId: exam.id,
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

    const session = await prisma.cBTSession.create({
      data: {
        examId: exam.id,
        studentId: authResult.session!.user.id,
        status: "in_progress",
      },
    });

    const questions = await prisma.cBTQuestion.findMany({
      where: { examId: exam.id },
      select: {
        id: true,
        question: true,
        type: true,
        options: true,
        marks: true,
        topic: true,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      exam: {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        totalQuestions: questionCount,
      },
      questions,
      startedAt: session.startedAt,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/cbt/practice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create practice session" },
      { status: 500 }
    );
  }
}
