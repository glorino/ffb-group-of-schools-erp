import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth([
      "OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER",
    ]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;

    const userId = (session!.user as any).id as string;
    const { id: assignmentId } = await params;

    const teacher = await prisma.teacher.findFirst({ where: { userId } });
    const isAdmin = (session!.user as any).roles?.some((r: any) =>
      ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r.name)
    );

    if (!isAdmin && teacher) {
      const existing = await prisma.assignment.findFirst({ where: { id: assignmentId, teacherId: teacher.id } });
      if (!existing) {
        return NextResponse.json({ error: "You can only grade submissions for your own assignments" }, { status: 403 });
      }
    }

    const { submissionId, score, feedback } = await request.json();

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: "submissionId and score are required" }, { status: 400 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.assignmentId !== assignmentId) {
      return NextResponse.json({ error: "Submission does not belong to this assignment" }, { status: 400 });
    }

    if (score < 0 || score > submission.assignment.totalMarks) {
      return NextResponse.json(
        { error: `Score must be between 0 and ${submission.assignment.totalMarks}` },
        { status: 400 }
      );
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: score,
        feedback: feedback || undefined,
        status: "graded",
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        assignment: { select: { id: true, title: true, totalMarks: true, subjectId: true } },
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error("POST /api/assignments/[id]/grade error:", error);
    return NextResponse.json({ error: error.message || "Failed to grade submission" }, { status: 500 });
  }
}
