import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth([
      "OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL",
      "TEACHER", "STUDENT", "PARENT",
    ]);
    if (authResult.error) return authResult.error;

    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        class: { select: { id: true, name: true, displayName: true } },
        subject: { select: { id: true, name: true, code: true } },
        submissions: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, admissionNumber: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("GET /api/assignments/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 });
  }
}
