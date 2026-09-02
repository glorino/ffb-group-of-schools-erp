import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEntranceExamResultEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, answers, startedAt } = body;

    if (!token || !answers) {
      return NextResponse.json({ error: "Token and answers are required" }, { status: 400 });
    }

    const exam = await prisma.entranceExam.findUnique({
      where: { token },
      include: { applicant: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status === "completed") {
      return NextResponse.json({ error: "Exam already completed" }, { status: 400 });
    }

    const now = new Date();
    const examDate = new Date(exam.examDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const examDay = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

    if (today.getTime() !== examDay.getTime()) {
      return NextResponse.json({ error: "Exam is only available on the scheduled date" }, { status: 403 });
    }

    const questions = exam.questions as any[];
    let correctCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const userAnswer = answers[i];
      if (userAnswer !== undefined && userAnswer === questions[i].answer) {
        correctCount++;
      }
    }

    const totalQuestions = questions.length;
    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 50;

    await prisma.entranceExam.update({
      where: { id: exam.id },
      data: {
        answers,
        score,
        passed,
        status: "completed",
        startedAt: startedAt ? new Date(startedAt) : undefined,
        completedAt: now,
      },
    });

    try {
      await sendEntranceExamResultEmail({
        firstName: exam.applicant.firstName,
        lastName: exam.applicant.lastName,
        applicationNumber: exam.applicant.applicationNumber,
        classAppliedFor: exam.applicant.classAppliedFor,
        email: exam.applicant.email || "",
        guardianName: exam.applicant.guardianName || undefined,
        guardianEmail: exam.applicant.guardianEmail || undefined,
        score,
        totalQuestions,
        passed,
        percentage,
      });
    } catch (emailErr) {
      console.error("Failed to send result email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      passed,
      correctCount,
    });
  } catch (error) {
    console.error("POST /api/admissions/entrance-exam/submit error:", error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
