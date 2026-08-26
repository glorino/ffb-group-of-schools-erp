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

    const exam = await prisma.cBTExam.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status !== "published") {
      return NextResponse.json(
        { error: "This exam is not available" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (exam.startDate && now < exam.startDate) {
      return NextResponse.json(
        { error: "This exam has not started yet" },
        { status: 400 }
      );
    }
    if (exam.endDate && now > exam.endDate) {
      return NextResponse.json(
        { error: "This exam has ended" },
        { status: 400 }
      );
    }

    const questionCount = await prisma.cBTQuestion.count({
      where: { examId: id },
    });
    if (questionCount === 0) {
      return NextResponse.json(
        { error: "This exam has no questions yet" },
        { status: 400 }
      );
    }

    const settings = (exam.settings as Record<string, any>) || {};
    const allowRetakes = settings.allowRetakes === true;

    if (!allowRetakes) {
      const existingSession = await prisma.cBTSession.findFirst({
        where: { examId: id, studentId },
      });
      if (existingSession) {
        return NextResponse.json(
          { error: "You have already taken this exam" },
          { status: 400 }
        );
      }
    }

    const session = await prisma.cBTSession.create({
      data: {
        examId: id,
        studentId,
        status: "in_progress",
      },
    });

    const questions = await prisma.cBTQuestion.findMany({
      where: { examId: id },
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
        totalQuestions: exam.totalQuestions,
      },
      questions,
      startedAt: session.startedAt,
    });
  } catch (error) {
    console.error("POST /api/cbt/exams/[id]/start error:", error);
    return NextResponse.json(
      { error: "Failed to start exam" },
      { status: 500 }
    );
  }
}
