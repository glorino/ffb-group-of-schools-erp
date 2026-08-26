import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-rbac";
import { schoolChatbot } from "@/lib/ai";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const SCHOOL_CONTEXT = `School: ${SCHOOL_CONFIG.name}
Academic Calendar: First term starts September, Second term starts January, Third term starts April.
Fee Deadlines: First term fees due by end of September. Second term fees due by end of January. Third term fees due by end of April.
School Hours: 8:00 AM - 3:30 PM (Monday to Friday).
Uniform Policy: Full school uniform required daily. White shirt, navy blue trousers/skirt, school tie.
Grading System: A (75-100), B (65-74), C (50-64), D (40-49), F (0-39).
Classes: JSS1, JSS2, JSS3, SS1, SS2, SS3.
Subjects offered: Mathematics, English Language, Physics, Chemistry, Biology, Economics, Government, Literature, Computer Studies, Agricultural Science.
Contact: Call the school office at ${SCHOOL_CONFIG.phone} or email ${SCHOOL_CONFIG.email}
Examination: WAEC and NECO preparation. Internal exams held at end of each term.
Extra-curricular: Sports, Debate Club, Science Club, Drama Club, Music Club.
PTA Meetings: Held once per term.`;

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const answer = await schoolChatbot({ question, context: SCHOOL_CONTEXT });

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("POST /api/ai/chat error:", error);
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 });
  }
}
