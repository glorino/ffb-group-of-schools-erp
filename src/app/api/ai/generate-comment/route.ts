import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-rbac";
import { generateReportComment } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { studentName, subjects, attendance, behavior } = body;

    if (!studentName || !subjects || attendance === undefined || !behavior) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comment = await generateReportComment({ studentName, subjects, attendance, behavior });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("POST /api/ai/generate-comment error:", error);
    return NextResponse.json({ error: "Failed to generate comment" }, { status: 500 });
  }
}
