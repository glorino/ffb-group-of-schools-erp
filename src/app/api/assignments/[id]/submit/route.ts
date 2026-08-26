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
    const { session } = authResult;

    const userId = (session!.user as any).id as string;
    const { id: assignmentId } = await params;

    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.status !== "active") {
      return NextResponse.json({ error: "This assignment is no longer active" }, { status: 400 });
    }

    if (new Date() > new Date(assignment.dueDate)) {
      return NextResponse.json({ error: "The due date for this assignment has passed" }, { status: 400 });
    }

    const existing = await prisma.assignmentSubmission.findFirst({
      where: { assignmentId, studentId: student.id },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already submitted this assignment" }, { status: 409 });
    }

    const { content, attachments } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Submission content is required" }, { status: 400 });
    }

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: student.id,
        content,
        attachments: attachments || undefined,
        status: "submitted",
      },
      include: {
        assignment: { select: { id: true, title: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/assignments/[id]/submit error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit assignment" }, { status: 500 });
  }
}
