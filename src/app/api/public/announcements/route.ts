import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "10");

    const schoolId = await getDefaultSchoolId();
    const where: any = { schoolId, published: true };
    if (type) where.type = type;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        target: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("GET /api/public/announcements error:", error);
    return NextResponse.json({ announcements: [] });
  }
}
