import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { applicationNumber } = await request.json();

    if (!applicationNumber || !applicationNumber.trim()) {
      return NextResponse.json({ error: "Application number is required" }, { status: 400 });
    }

    const applicant = await prisma.applicant.findFirst({
      where: { applicationNumber: applicationNumber.trim().toUpperCase() },
      select: {
        applicationNumber: true,
        firstName: true,
        lastName: true,
        classAppliedFor: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        decision: true,
        decisionNote: true,
        assignedClassId: true,
        assignedArm: true,
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Application not found. Please check your application number." }, { status: 404 });
    }

    return NextResponse.json({ success: true, applicant });
  } catch (error) {
    console.error("POST /api/admissions/track error:", error);
    return NextResponse.json({ error: "Failed to track application" }, { status: 500 });
  }
}
