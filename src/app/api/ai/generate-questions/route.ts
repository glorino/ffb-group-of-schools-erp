import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-rbac";
import { generateExamQuestions } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { subject, topic, count, difficulty, examType } = body;

    if (!subject || !topic || !count || !difficulty || !examType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const questions = await generateExamQuestions({
      subject,
      topic,
      count: Math.min(count, 50),
      difficulty,
      examType,
    });

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("POST /api/ai/generate-questions error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
