import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        documents: true,
        exams: true,
        student: true,
        school: true,
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error("GET /api/admissions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.applicant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const applicant = await prisma.applicant.update({
      where: { id },
      data: {
        status: body.status ?? existing.status,
        decision: body.decision ?? existing.decision,
        decisionNote: body.decisionNote ?? existing.decisionNote,
        examDate: body.examDate ? new Date(body.examDate) : existing.examDate,
        interviewDate: body.interviewDate ? new Date(body.interviewDate) : existing.interviewDate,
        reviewedAt: body.status && body.status !== "pending" ? new Date() : existing.reviewedAt,
        admissionFeePaid: body.admissionFeePaid ?? existing.admissionFeePaid,
      },
      include: {
        documents: true,
        exams: true,
        student: true,
      },
    });

    return NextResponse.json(applicant);
  } catch (error) {
    console.error("PUT /api/admissions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.applicant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await prisma.applicant.delete({ where: { id } });

    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admissions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
