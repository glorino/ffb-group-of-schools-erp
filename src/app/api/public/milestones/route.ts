import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const schoolId = await getDefaultSchoolId();

    const milestones = await prisma.milestone.findMany({
      where: { schoolId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        year: true,
        event: true,
      },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error("GET /api/public/milestones error:", error);
    return NextResponse.json({ milestones: [] });
  }
}
