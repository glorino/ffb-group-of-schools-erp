import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "ALUMNI"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    const schoolId = await getDefaultSchoolId();
    where.schoolId = schoolId;

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
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { userId, graduationYear, university, degree, industry, currentEmployer, currentPosition, biography, isPublic } = body;

    if (!userId || !graduationYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const schoolId = await getDefaultSchoolId();

    const alumni = await prisma.alumni.create({
      data: {
        userId,
        schoolId,
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
