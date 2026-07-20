import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { getDefaultSchoolId } from "@/lib/school";

const CreateClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayName: z.string().optional(),
  level: z.number().int().optional(),
  capacity: z.number().int().positive().default(40),
});

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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateClassSchema.parse(body);

    const schoolId = await getDefaultSchoolId();
    const cls = await prisma.schoolClass.create({
      data: {
        schoolId,
        name: validated.name,
        displayName: validated.displayName || validated.name,
        level: validated.level || 1,
        capacity: validated.capacity || 40,
      },
    });

    return NextResponse.json(cls, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    console.error("POST /api/classes error:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
