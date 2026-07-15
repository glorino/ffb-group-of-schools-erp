import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [classes, total] = await Promise.all([
      prisma.schoolClass.findMany({
        where,
        include: {
          _count: { select: { students: true } },
          classTeacher: {
            select: { name: true, email: true },
          },
        },
        orderBy: { level: "asc" },
      }),
      prisma.schoolClass.count({ where }),
    ]);

    return NextResponse.json({
      classes,
      total,
    });
  } catch (error) {
    console.error("GET /api/classes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
