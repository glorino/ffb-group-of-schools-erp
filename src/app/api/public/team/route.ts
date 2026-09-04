import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const schoolId = await getDefaultSchoolId();

    const staff = await prisma.staff.findMany({
      where: { schoolId, status: "active" },
      orderBy: { firstName: "asc" },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        photo: true,
        qualification: true,
      },
    });

    return NextResponse.json({ team: staff });
  } catch (error) {
    console.error("GET /api/public/team error:", error);
    return NextResponse.json({ team: [] });
  }
}
