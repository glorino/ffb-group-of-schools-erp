import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-rbac";
import { generateLessonPlan } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { subject, topic, classLevel, duration } = body;

    if (!subject || !topic || !classLevel || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plan = await generateLessonPlan({ subject, topic, classLevel, duration });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("POST /api/ai/generate-lesson-plan error:", error);
    return NextResponse.json({ error: "Failed to generate lesson plan" }, { status: 500 });
  }
}
