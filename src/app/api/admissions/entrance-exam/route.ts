import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const EXAM_QUESTIONS = [
  {
    subject: "Mathematics",
    questions: [
      { q: "What is the value of 2x + 5 when x = 3?", options: ["8", "11", "13", "15"], answer: 1 },
      { q: "Simplify: 3(2a + 4) - 5a", options: ["a + 12", "a + 8", "6a + 12", "6a + 8"], answer: 0 },
      { q: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: 1 },
      { q: "Solve: 2x - 7 = 15", options: ["x = 8", "x = 9", "x = 11", "x = 13"], answer: 2 },
      { q: "What is the area of a rectangle with length 8cm and width 5cm?", options: ["13cm²", "26cm²", "40cm²", "80cm²"], answer: 2 },
      { q: "What is 3² + 4²?", options: ["7", "12", "24", "25"], answer: 3 },
      { q: "What is the value of √144?", options: ["11", "12", "13", "14"], answer: 1 },
    ],
  },
  {
    subject: "English Language",
    questions: [
      { q: "Choose the correct spelling:", options: ["Definately", "Definitely", "Definatly", "Definetly"], answer: 1 },
      { q: "Which word is a synonym of 'happy'?", options: ["Sad", "Angry", "Joyful", "Tired"], answer: 2 },
      { q: "Identify the noun: 'The cat sat on the mat.'", options: ["sat", "on", "cat", "the"], answer: 2 },
      { q: "Which is the correct form? 'She ___ to school daily.'", options: ["go", "goes", "going", "gone"], answer: 1 },
      { q: "Choose the antonym of 'brave':", options: ["Courageous", "Fearless", "Cowardly", "Bold"], answer: 2 },
      { q: "Which sentence is correct?", options: ["He don't like it", "He doesn't likes it", "He doesn't like it", "He not like it"], answer: 2 },
    ],
  },
  {
    subject: "Science",
    questions: [
      { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
      { q: "What is the boiling point of water in Celsius?", options: ["90°C", "95°C", "100°C", "110°C"], answer: 2 },
      { q: "Which organ pumps blood in the human body?", options: ["Lungs", "Brain", "Heart", "Liver"], answer: 2 },
      { q: "What is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: 2 },
      { q: "Photosynthesis occurs in which part of a plant?", options: ["Roots", "Stem", "Leaves", "Flowers"], answer: 2 },
      { q: "Which gas do humans breathe in to survive?", options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"], answer: 2 },
      { q: "What is the process by which water turns into vapour?", options: ["Condensation", "Evaporation", "Freezing", "Melting"], answer: 1 },
    ],
  },
];

function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantId, examDate, startTime, endTime, durationMins } = body;

    if (!applicantId || !examDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const applicant = await prisma.applicant.findUnique({ where: { id: applicantId } });
    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const existing = await prisma.entranceExam.findUnique({ where: { applicantId } });
    if (existing) {
      return NextResponse.json({ exam: existing, message: "Exam already exists" });
    }

    const allQuestions: any[] = [];
    for (const subject of EXAM_QUESTIONS) {
      const shuffled = shuffleArray(subject.questions);
      for (const q of shuffled) {
        allQuestions.push({
          subject: subject.subject,
          question: q.q,
          options: q.options,
          answer: q.answer,
        });
      }
    }

    const token = generateToken();

    const exam = await prisma.entranceExam.create({
      data: {
        applicantId,
        token,
        examDate: new Date(examDate),
        startTime,
        endTime,
        durationMins: durationMins || 60,
        subjects: EXAM_QUESTIONS.map((s) => s.subject),
        questions: allQuestions,
        totalQuestions: allQuestions.length,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("POST /api/admissions/entrance-exam error:", error);
    return NextResponse.json({ error: "Failed to create entrance exam" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const exam = await prisma.entranceExam.findUnique({
      where: { token },
      include: {
        applicant: {
          select: {
            firstName: true,
            lastName: true,
            applicationNumber: true,
            classAppliedFor: true,
            email: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const now = new Date();
    const examDate = new Date(exam.examDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const examDay = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

    const isExamDay = today.getTime() === examDay.getTime();

    const questionsWithoutAnswers = (exam.questions as any[]).map((q: any, i: number) => ({
      index: i,
      subject: q.subject,
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({
      id: exam.id,
      applicant: exam.applicant,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      durationMins: exam.durationMins,
      subjects: exam.subjects,
      totalQuestions: exam.totalQuestions,
      status: exam.status,
      score: exam.status === "completed" ? exam.score : undefined,
      passed: exam.status === "completed" ? exam.passed : undefined,
      isExamDay,
      questions: exam.status === "pending" ? questionsWithoutAnswers : undefined,
    });
  } catch (error) {
    console.error("GET /api/admissions/entrance-exam error:", error);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}
