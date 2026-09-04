import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const schoolId = await getDefaultSchoolId();

    const where: any = { schoolId, published: true };
    if (category && category !== "All") where.category = category;

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
      },
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("GET /api/public/faqs error:", error);
    return NextResponse.json({ faqs: [] });
  }
}
