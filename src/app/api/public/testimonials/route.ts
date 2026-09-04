import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const schoolId = await getDefaultSchoolId();

    const testimonials = await prisma.testimonial.findMany({
      where: { schoolId, published: true },
      orderBy: { sortOrder: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        role: true,
        text: true,
        rating: true,
        photo: true,
      },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("GET /api/public/testimonials error:", error);
    return NextResponse.json({ testimonials: [] });
  }
}
