import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { university: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    const alumni = await prisma.alumni.findMany({
      where,
      include: {
        donations: { orderBy: { donatedAt: "desc" }, take: 5 },
        mentorships: true,
      },
      orderBy: { graduationYear: "desc" },
    });

    return NextResponse.json({ alumni });
  } catch (error) {
    console.error("GET /api/alumni error:", error);
    return NextResponse.json({ error: "Failed to fetch alumni" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { userId, graduationYear, university, degree, industry, currentEmployer, currentPosition, biography, isPublic } = body;

    if (!userId || !graduationYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const alumni = await prisma.alumni.create({
      data: {
        userId,
        graduationYear: parseInt(graduationYear),
        university: university || undefined,
        degree: degree || undefined,
        industry: industry || undefined,
        currentEmployer: currentEmployer || undefined,
        currentPosition: currentPosition || undefined,
        biography: biography || undefined,
        isPublic: isPublic !== false,
      },
    });

    return NextResponse.json({ success: true, alumni }, { status: 201 });
  } catch (error) {
    console.error("POST /api/alumni error:", error);
    return NextResponse.json({ error: "Failed to create alumni record" }, { status: 500 });
  }
}
